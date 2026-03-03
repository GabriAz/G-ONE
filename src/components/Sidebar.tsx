'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface NavItemProps {
    label: string
    href: string
    icon: string
    active: boolean
}

function NavItem({ label, href, icon, active }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
        ${active
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <span className="text-base w-5 text-center shrink-0">{icon}</span>
            <span className="hidden lg:block">{label}</span>
        </Link>
    )
}

interface SidebarProps {
    user: {
        name?: string | null
        email?: string | null
    }
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside className="w-16 lg:w-56 bg-[#0F0F0F] flex flex-col h-full shrink-0 border-r border-white/5">
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-white/5">
                <span className="text-white font-bold text-lg tracking-tight hidden lg:block">G•ONE</span>
                <span className="text-white font-bold text-lg lg:hidden mx-auto">G</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1 py-4">
                <div className="pb-2">
                    <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Principal</p>
                    <NavItem href="/hoje" icon="📅" label="Hoje" active={pathname === '/hoje'} />
                    <NavItem href="/notificacoes" icon="🔔" label="Notificações" active={pathname === '/notificacoes'} />
                </div>

                <div className="pt-4 pb-2">
                    <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">CRM</p>
                    <NavItem href="/leads" icon="👤" label="Leads" active={pathname === '/leads'} />
                    <NavItem href="/pipeline" icon="📊" label="Pipeline" active={pathname === '/pipeline'} />
                </div>

                <div className="pt-4 pb-2">
                    <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Relatórios</p>
                    <NavItem href="/analytics" icon="📈" label="Analytics" active={pathname === '/analytics'} />
                </div>
            </nav>

            {/* Configurações + User */}
            <div className="border-t border-white/5 p-2 space-y-0.5">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <span className="text-base w-5 text-center">⚙️</span>
                    <span className="hidden lg:block">Configurações</span>
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                    <span className="text-base w-5 text-center">↩️</span>
                    <span className="hidden lg:block">Sair</span>
                </button>

                {/* User info */}
                <div className="flex items-center gap-2 px-3 pt-3 pb-2 mt-1 border-t border-white/5">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-bold shrink-0 border border-white/5">
                        {user.name?.charAt(0) ?? 'G'}
                    </div>
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-white text-[11px] font-semibold truncate leading-tight">{user.name}</p>
                        <p className="text-gray-500 text-[10px] truncate leading-tight">{user.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
