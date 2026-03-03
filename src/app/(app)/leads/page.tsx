import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LeadsPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            deals: {
                select: { id: true, title: true }
            },
            assignedUser: {
                select: { name: true }
            }
        }
    })

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                    <p className="text-sm text-gray-400 mt-1">Gestão de contatos e prospecção ativa.</p>
                </div>
                <Link
                    href="/leads/new"
                    className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <span>+</span> Novo Lead
                </Link>
            </div>

            {/* Leads Table/Grid */}
            {leads.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-2xl">
                        ⬡
                    </div>
                    <h3 className="text-gray-900 font-semibold">Nenhum lead encontrado</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                        Comece adicionando seu primeiro prospecto para iniciar o funil de vendas.
                    </p>
                    <Link
                        href="/leads/new"
                        className="inline-block mt-6 text-sm font-bold text-gray-900 border-b-2 border-black pb-1 hover:pb-2 transition-all"
                    >
                        Adicionar agora
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nome / Empresa</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Contato</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Negócios</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Responsável</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{lead.name}</span>
                                            {lead.company && <span className="text-xs text-gray-400 mt-0.5">{lead.company}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex flex-col gap-0.5">
                                            {lead.email && <span className="text-sm text-gray-600">{lead.email}</span>}
                                            {lead.phone && <span className="text-xs text-gray-400">{lead.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1.5">
                                            {lead.deals.length > 0 ? (
                                                lead.deals.map(deal => (
                                                    <span key={deal.id} className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                                                        {deal.title}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-300">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                {lead.assignedUser.name.charAt(0)}
                                            </div>
                                            <span className="text-xs text-gray-600 font-medium">{lead.assignedUser.name.split(' ')[0]}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-300 group-hover:text-gray-900 transition-colors">
                                            •••
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
