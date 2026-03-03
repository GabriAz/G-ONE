'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createLead } from '@/lib/actions/leads'

export default function NewLeadPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        try {
            await createLead(formData)
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao criar o lead.')
            setLoading(false)
        }
    }

    return (
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                <Link href="/leads" className="hover:text-gray-900 transition-colors">Leads</Link>
                <span>/</span>
                <span className="text-gray-900">Novo Lead</span>
            </div>

            <div className="mb-10">
                <h1 className="text-2xl font-bold text-gray-900">Novo Lead</h1>
                <p className="text-sm text-gray-400 mt-1">Cadastre um novo prospecto e defina a próxima ação imediatamente.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Sessão 1: Informações do Lead */}
                <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 mb-4">Informações de Contato</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome Completo *</label>
                            <input
                                name="name"
                                required
                                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
                                placeholder="Ex: João Silva"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Empresa</label>
                            <input
                                name="company"
                                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
                                placeholder="Ex: Empresa Ltda"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                            <input
                                name="email"
                                type="email"
                                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
                                placeholder="email@exemplo.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Telefone</label>
                            <input
                                name="phone"
                                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Notas Gerais</label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all resize-none"
                            placeholder="Contexto inicial sobre o lead..."
                        />
                    </div>
                </section>

                {/* Sessão 2: Próxima Ação (OBRIGATÓRIO) */}
                <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 ring-1 ring-black/5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Próxima Ação 🔥</h2>
                        <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded uppercase tracking-tighter">Obrigatório</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo de Atividade</label>
                            <select
                                name="activityType"
                                required
                                defaultValue="FOLLOW_UP"
                                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all appearance-none"
                            >
                                <option value="FOLLOW_UP">Follow-up</option>
                                <option value="TASK">Tarefa</option>
                                <option value="MEETING">Reunião</option>
                                <option value="REMINDER">Lembrete</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Data / Hora Limite</label>
                            <input
                                name="dueAt"
                                type="datetime-local"
                                required
                                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">O que precisa ser feito?</label>
                        <input
                            name="activityTitle"
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
                            placeholder="Ex: Ligar para confirmar interesse"
                        />
                    </div>
                </section>

                {error && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        {error}
                    </p>
                )}

                <div className="flex items-center justify-end gap-4 pt-4">
                    <Link
                        href="/leads"
                        className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/5"
                    >
                        {loading ? 'Salvando...' : 'Criar Lead'}
                    </button>
                </div>
            </form>
        </div>
    )
}
