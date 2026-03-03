import { prisma } from '@/lib/prisma';
import { ActivityStatus, ActivityType } from '@prisma/client';

export async function getAnalyticsData() {
    const [deals, activities, leadsCount] = await Promise.all([
        // Métricas de Deals
        prisma.deal.findMany({
            include: { stage: true }
        }),
        // Métricas de Atividades
        prisma.activity.findMany({
            where: {
                status: { in: [ActivityStatus.DONE, ActivityStatus.OPEN] }
            }
        }),
        // Total de Leads
        prisma.lead.count()
    ]);

    // 1. Pipeline Value por Estágio
    const pipelineValueByStage: Record<string, number> = {};
    deals.forEach(deal => {
        const stageName = deal.stage.name;
        const value = Number(deal.estimatedValue || 0);
        pipelineValueByStage[stageName] = (pipelineValueByStage[stageName] || 0) + value;
    });

    const totalPipelineValue = deals.reduce((acc, deal) => acc + Number(deal.estimatedValue || 0), 0);

    // 2. Eficiência de Follow-up (Zero Perdido)
    const completedActivities = activities.filter(a => a.status === ActivityStatus.DONE);
    const overdueActivities = activities.filter(a =>
        a.status === ActivityStatus.OPEN && a.dueAt < new Date()
    );

    const totalRelevantActivities = activities.length;
    const followUpEfficiency = totalRelevantActivities > 0
        ? ((completedActivities.length / totalRelevantActivities) * 100).toFixed(1)
        : "100";

    // 3. Tipos de Atividades mais comuns
    const activityDistribution: Record<ActivityType, number> = {
        FOLLOW_UP: 0,
        TASK: 0,
        MEETING: 0,
        DELIVERY: 0,
        REMINDER: 0
    };

    activities.forEach(a => {
        activityDistribution[a.type]++;
    });

    return {
        overview: {
            totalLeads: leadsCount,
            totalDeals: deals.length,
            totalPipelineValue,
            followUpEfficiency: Number(followUpEfficiency)
        },
        pipeline: Object.entries(pipelineValueByStage).map(([name, value]) => ({ name, value })),
        activities: {
            distribution: Object.entries(activityDistribution).map(([type, count]) => ({ type, count })),
            overdueCount: overdueActivities.length,
            completedCount: completedActivities.length
        }
    };
}
