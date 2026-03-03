import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PipelinePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const [stages, deals] = await Promise.all([
        prisma.pipelineStage.findMany({ orderBy: { orderIndex: 'asc' } }),
        prisma.deal.findMany({
            include: {
                lead: { select: { name: true, company: true } },
                assignedUser: { select: { name: true } }
            }
        })
    ])

    // Group deals by stage
    const dealsByStage = stages.map(stage => ({
        ...stage,
        deals: deals.filter(deal => deal.stageId === stage.id)
    }))

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 lg:p-8 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
                    <p className="text-sm text-gray-400 mt-1">Gestão visual do funil de vendas.</p>
                </div>
                <Link
                    href="/pipeline/new"
                    className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <span>+</span> Novo Negócio
                </Link>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto bg-[#F4F4F5]">
                <div className="flex h-full p-6 lg:p-8 gap-6 min-w-max">
                    {dealsByStage.map(stage => (
                        <div key={stage.id} className="w-80 flex flex-col h-full bg-gray-100/50 rounded-2xl border border-gray-200/50">
                            {/* Stage Header */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">{stage.name}</h3>
                                    <span className="text-[10px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                        {stage.deals.length}
                                    </span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-900">⋮</button>
                            </div>

                            {/* Deals List */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {stage.deals.length === 0 ? (
                                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Vazio</span>
                                    </div>
                                ) : (
                                    stage.deals.map(deal => (
                                        <div key={deal.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-black/20 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-black">{deal.title}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="text-[10px] text-gray-400">👤</span>
                                                    <p className="text-[11px] text-gray-500 font-medium truncate">{deal.lead.name}</p>
                                                </div>

                                                {deal.estimatedValue && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] text-gray-400">💰</span>
                                                        <p className="text-[11px] text-gray-900 font-bold">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deal.estimatedValue))}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                        {deal.assignedUser.name.charAt(0)}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium">{deal.assignedUser.name.split(' ')[0]}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-300">#{deal.id.slice(-4)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
