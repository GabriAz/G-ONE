import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ActivityStatus, Priority, ActivityType } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusColors: Record<string, string> = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-gray-400',
}

const typeLabels: Record<ActivityType, string> = {
    FOLLOW_UP: 'Follow-up',
    TASK: 'Tarefa',
    MEETING: 'Reunião',
    DELIVERY: 'Entrega',
    REMINDER: 'Lembrete',
}

function ActivityCard({ activity }: {
    activity: {
        id: string
        title: string
        type: ActivityType
        priority: Priority
        dueAt: Date
        description: string | null
        assignedUser: { name: string }
        lead?: { id: string, name: string } | null
        deal?: { id: string, title: string } | null
    }
}) {
    const isOverdue = activity.dueAt < new Date()
    return (
        <div className={`group bg-white rounded-xl border ${isOverdue ? 'border-red-200' : 'border-gray-100'} p-4 hover:shadow-sm transition-all duration-200`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${statusColors[activity.priority]}`} />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                            {activity.lead && (
                                <span className="text-[9px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                                    L: {activity.lead.name}
                                </span>
                            )}
                            {activity.deal && (
                                <span className="text-[9px] font-bold bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded border border-purple-100 shrink-0">
                                    D: {activity.deal.title}
                                </span>
                            )}
                        </div>
                        {activity.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {typeLabels[activity.type]}
                            </span>
                            <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                                {isOverdue ? '⚠ ' : ''}{formatDistanceToNow(activity.dueAt, { addSuffix: true, locale: ptBR })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                    {activity.assignedUser.name.charAt(0)}
                </div>
            </div>
        </div>
    )
}

function SectionHeader({ title, count, color }: { title: string; count: number; color: string }) {
    return (
        <div className="flex items-center gap-3 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{count}</span>
        </div>
    )
}

export default async function HojePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1)
    const endOf7Days = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [overdue, today, upcoming] = await Promise.all([
        prisma.activity.findMany({
            where: { status: ActivityStatus.OPEN, dueAt: { lt: startOfToday } },
            include: {
                assignedUser: { select: { name: true } },
                lead: { select: { id: true, name: true } },
                deal: { select: { id: true, title: true } }
            },
            orderBy: { dueAt: 'asc' },
        }),
        prisma.activity.findMany({
            where: { status: ActivityStatus.OPEN, dueAt: { gte: startOfToday, lte: endOfToday } },
            include: {
                assignedUser: { select: { name: true } },
                lead: { select: { id: true, name: true } },
                deal: { select: { id: true, title: true } }
            },
            orderBy: { dueAt: 'asc' },
        }),
        prisma.activity.findMany({
            where: { status: ActivityStatus.OPEN, dueAt: { gt: endOfToday, lte: endOf7Days } },
            include: {
                assignedUser: { select: { name: true } },
                lead: { select: { id: true, name: true } },
                deal: { select: { id: true, title: true } }
            },
            orderBy: { dueAt: 'asc' },
        }),
    ])

    const totalOpen = overdue.length + today.length + upcoming.length

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">
                    {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h1 className="text-2xl font-bold text-gray-900">Hoje</h1>
                <p className="text-sm text-gray-400 mt-1">
                    {totalOpen === 0
                        ? '✓ Tudo limpo. Bom trabalho.'
                        : `${totalOpen} item${totalOpen > 1 ? 's' : ''} em aberto`}
                </p>
            </div>

            <div className="space-y-8">
                {/* VENCIDOS */}
                {overdue.length > 0 && (
                    <section>
                        <SectionHeader title="Vencidos" count={overdue.length} color="bg-red-500" />
                        <div className="space-y-2">
                            {overdue.map(a => <ActivityCard key={a.id} activity={a} />)}
                        </div>
                    </section>
                )}

                {/* HOJE */}
                <section>
                    <SectionHeader title="Hoje" count={today.length} color="bg-yellow-400" />
                    {today.length === 0 ? (
                        <p className="text-sm text-gray-400 pl-5">Nenhuma atividade para hoje.</p>
                    ) : (
                        <div className="space-y-2">
                            {today.map(a => <ActivityCard key={a.id} activity={a} />)}
                        </div>
                    )}
                </section>

                {/* PRÓXIMOS 7 DIAS */}
                <section>
                    <SectionHeader title="Próximos 7 dias" count={upcoming.length} color="bg-gray-300" />
                    {upcoming.length === 0 ? (
                        <p className="text-sm text-gray-400 pl-5">Agenda limpa para os próximos dias.</p>
                    ) : (
                        <div className="space-y-2">
                            {upcoming.map(a => <ActivityCard key={a.id} activity={a} />)}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
