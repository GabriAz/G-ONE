'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setError('Email ou senha incorretos.')
            setLoading(false)
        } else {
            router.push('/hoje')
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-10 text-center">
                    <h1 className="text-white text-3xl font-bold tracking-tight">G•ONE</h1>
                    <p className="text-gray-500 text-sm mt-1">Uma fonte de verdade. Um lugar só.</p>
                </div>

                {/* Card */}
                <div className="bg-[#141414] border border-white/8 rounded-2xl p-8">
                    <h2 className="text-white text-lg font-semibold mb-6">Entrar</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="seu@email.com"
                                className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-lg px-4 py-3 text-sm
                  placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10
                  transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-lg px-4 py-3 text-sm
                  placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10
                  transition-all duration-200"
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold rounded-lg py-3 text-sm
                hover:bg-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                mt-2"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                </div>

                <p className="text-gray-700 text-xs text-center mt-6">G•ONE © 2026</p>
            </div>
        </div>
    )
}
