import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';
import { ActivityStatus, NotificationType } from '@prisma/client';
import { addHours, addMinutes, isAfter, isBefore } from 'date-fns';

/**
 * Motor de Notificações — Atividades Proativas
 * Busca atividades OPEN que vencem em breve e que ainda não tiveram notificação enviada.
 */
export async function processNotifications() {
    console.log('🔔 Iniciando processamento de notificações...');

    const now = new Date();

    // 1. Buscar atividades abertas que vencem nas próximas 48h
    const activities = await prisma.activity.findMany({
        where: {
            status: ActivityStatus.OPEN,
            dueAt: {
                lte: addHours(now, 48),
                gte: now, // Apenas as que ainda não venceram (vencidas tratamos em logica de OVERDUE)
            }
        },
        include: {
            assignedUser: true,
            lead: true,
            deal: true,
            notifications: true,
        }
    });

    for (const activity of activities) {
        // Lógica de Janelas de Notificação: 48h, 24h, 6h, 2h, 1h, 30min
        const notificationWindows = [
            { type: NotificationType.T_MINUS_48H, hours: 48 },
            { type: NotificationType.T_MINUS_24H, hours: 24 },
            { type: NotificationType.T_MINUS_6H, hours: 6 },
            { type: NotificationType.T_MINUS_2H, hours: 2 },
            { type: NotificationType.T_MINUS_1H, hours: 1 },
            { type: NotificationType.T_MINUS_30MIN, minutes: 30 },
        ];

        for (const window of notificationWindows) {
            const threshold = window.hours
                ? addHours(now, window.hours)
                : addMinutes(now, window.minutes!);

            // Se o vencimento está dentro dessa janela e ainda não enviamos esse tipo para essa atividade
            if (isBefore(activity.dueAt, threshold)) {
                const alreadySent = activity.notifications.some(n => n.type === window.type);

                if (!alreadySent) {
                    await sendNotificationUpdate(activity, window.type);
                    break; // Envia apenas a notificação mais urgente aplicável
                }
            }
        }
    }

    // 2. Lógica de OVERDUE (Vencidas)
    const overdueActivities = await prisma.activity.findMany({
        where: {
            status: ActivityStatus.OPEN,
            dueAt: { lt: now }
        },
        include: {
            assignedUser: true,
            notifications: true
        }
    });

    for (const activity of overdueActivities) {
        const alreadySentOverdue = activity.notifications.some(n => n.type === NotificationType.OVERDUE);
        if (!alreadySentOverdue) {
            await sendNotificationUpdate(activity, NotificationType.OVERDUE);
        }
    }
}

async function sendNotificationUpdate(activity: any, type: NotificationType) {
    const originEmoji = activity.origin === 'CRM' ? '💼' : '⚙️';
    const entityInfo = activity.deal ? `Negócio: *${activity.deal.title}*` : activity.lead ? `Lead: *${activity.lead.name}*` : '';

    let timeLabel = '';
    switch (type) {
        case NotificationType.T_MINUS_48H: timeLabel = 'faltam 48 horas'; break;
        case NotificationType.T_MINUS_24H: timeLabel = 'faltam 24 horas'; break;
        case NotificationType.T_MINUS_2H: timeLabel = 'faltam 2 horas'; break;
        case NotificationType.T_MINUS_30MIN: timeLabel = 'faltam 30 minutos'; break;
        case NotificationType.OVERDUE: timeLabel = 'ESTÁ VENCIDA! ⚠️'; break;
        default: timeLabel = 'em breve';
    }

    const message = `
🔔 *G•ONE Alerta*
${originEmoji} Atividade: *${activity.title}*
${entityInfo ? `📍 ${entityInfo}\n` : ''}⏳ Prazo: ${timeLabel}

Responsável: ${activity.assignedUser.name}
  `.trim();

    // Enviar para o Telegram
    await sendTelegramMessage(message);

    // Registrar no banco para não repetir
    await prisma.notification.create({
        data: {
            userId: activity.assignedUserId,
            activityId: activity.id,
            type: type,
            message: message,
            severity: 'INFO',
            // O campo 'status' não existe no schema atual, apenas 'isRead' (que é default false)
            sentAt: new Date(),
        }
    });
}
