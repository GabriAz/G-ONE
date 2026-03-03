import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const severityColors: Record<string, string> = {
    INFO: 'bg-blue-50 border-blue-100 text-blue-700',
    WARNING: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    CRITICAL: 'bg-red-50 border-red-100 text-red-700',
}

const severityIcons: Record<string, string> = {
    INFO: 'ℹ️',
    WARNING: '⚠️',
    CRITICAL: '🚨',
}

export default async function NotificacoesPage() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) redirect('/login')

    const userId = (session.user as any).id

    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            activity: {
                select: { title: true, dueAt: true }
            }
        }
    })

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
                <p className="text-sm text-gray-400 mt-1">Lembretes e alertas do seu assistente G•ONE.</p>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <span className="text-4xl">📭</span>
                        <p className="text-sm text-gray-400 mt-4">Nenhuma notificação por aqui.</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`p-4 rounded-xl border transition-all ${n.isRead ? 'bg-white opacity-60' : severityColors[n.severity]}`}
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-xl shrink-0">{severityIcons[n.severity]}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className={`text-sm font-bold ${n.isRead ? 'text-gray-900' : 'text-inherit'}`}>
                                            {n.message.split('\n')[1]?.replace('*Atividade: *', '') || 'Alerta de Sistema'}
                                        </p>
                                        <span className="text-[10px] text-gray-400 shrink-0 uppercase font-medium">
                                            {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-xs opacity-80 whitespace-pre-line line-clamp-2">
                                        {n.message.split('\n').slice(2).join('\n').trim() || n.message}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2 shadow-sm" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
