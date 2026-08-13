'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flame, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { update } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        return
      }

      await update()
      router.push('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-1 px-6 py-10 text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-[350px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,91,31,0.13), transparent 60%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[250px] -right-[150px] h-[600px] w-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,91,31,0.07), transparent 60%)' }}
      />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-line px-8 py-3.5 font-mono text-[11px] tracking-[0.18em] text-ink-subtle">
        <span className="flex items-center gap-2.5">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-500 text-surface-1 shadow-brand-glow">
            <Flame size={11} fill="currentColor" />
          </span>
          <span className="font-sans text-[13px] font-extrabold tracking-tight text-ink">
            Locked<span className="text-brand-500">IN</span>
          </span>
        </span>
        <span>
          NO ACCOUNT?{' '}
          <Link href="/register" className="text-brand-500 no-underline hover:text-brand-400">
            LOCK IN →
          </Link>
        </span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center gap-9">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-brand-500">
            // WELCOME BACK
          </div>
          <h1 className="mt-3.5 text-[64px] font-black leading-[0.98] tracking-[-0.06em]">
            Stay
            <br />
            locked in.
          </h1>
          <p className="mt-3.5 text-[15px] leading-[1.5] text-ink-subtle">
            Sign in to keep your streak alive.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {error && (
            <div className="rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-[10px] border border-line bg-surface-2 px-3.5 py-3 text-sm text-ink outline-none placeholder:text-ink-subtle/50 focus:border-brand-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-[10px] border border-line bg-surface-2 px-3.5 py-3 text-sm text-ink outline-none placeholder:text-ink-subtle/50 focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-500 px-4 py-3.5 text-sm font-extrabold tracking-tight text-surface-1 transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight size={14} strokeWidth={2.5} /></>}
          </button>

        </form>
      </div>
    </div>
  )
}
