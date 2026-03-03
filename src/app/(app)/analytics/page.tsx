import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnalyticsData } from '@/lib/services/analyticsService'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) redirect('/login')

    const data = await getAnalyticsData()

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-400 mt-1">Visão estratégica da sua operação comercial.</p>
            </div>

            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Valor no Pipeline"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.overview.totalPipelineValue)}
                    icon="💰"
                    trend="Total estimado"
                />
                <StatCard
                    label="Eficiência Follow-up"
                    value={`${data.overview.followUpEfficiency}%`}
                    icon="⚡"
                    trend="Taxa de conclusão"
                    color={data.overview.followUpEfficiency > 80 ? 'text-green-600' : 'text-yellow-600'}
                />
                <StatCard
                    label="Total de Leads"
                    value={data.overview.totalLeads}
                    icon="👤"
                    trend="Crescimento base"
                />
                <StatCard
                    label="Negócios Ativos"
                    value={data.overview.totalDeals}
                    icon="📊"
                    trend="Em progresso"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribuição por Estágio */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Pipeline por Estágio</h2>
                    <div className="space-y-4">
                        {data.pipeline.map(s => (
                            <div key={s.name}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-gray-600">{s.name}</span>
                                    <span className="text-xs font-bold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.value)}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-black rounded-full"
                                        style={{ width: `${(s.value / data.overview.totalPipelineValue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Saúde das Atividades */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Saúde das Atividades</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                            <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Concluídas</p>
                            <p className="text-2xl font-bold text-green-700">{data.activities.completedCount}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                            <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Vencidas</p>
                            <p className="text-2xl font-bold text-red-700">{data.activities.overdueCount}</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Volume por Tipo</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.activities.distribution.map(item => (
                                <div key={item.type} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                                    <span className="text-[10px] font-bold text-gray-600 truncate">{item.type}: {item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, trend, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{icon}</span>
                <span className="text-[10px] font-bold text-gray-300 uppercase leading-none tracking-tighter self-start mt-1">G•ONE</span>
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{label}</p>
            </div>
            <p className={`text-[10px] font-bold mt-4 uppercase tracking-widest ${color || 'text-gray-300'}`}>
                {trend}
            </p>
        </div>
    )
}
