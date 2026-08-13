'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LayoutDashboard, Code2, Dumbbell, BookOpen, LogOut, Flame, UserCircle } from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dsa', label: 'DSA', icon: Code2 },
  { href: '/gym', label: 'Gym', icon: Dumbbell },
  { href: '/skills', label: 'Skills', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: UserCircle },
]

export default function NavBar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-gray-950 border-r border-gray-800/80 flex-col z-40">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800/80">
          <div className="w-8 h-8 rounded-lg bg-brand-500 grid place-items-center shadow-brand-glow">
            <Flame size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            locked<span className="text-brand-500">IN</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-500/10 text-brand-400 ring-1 ring-inset ring-brand-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800/80">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 flex justify-around z-40">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors ${
                active ? 'text-brand-400' : 'text-gray-500 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
