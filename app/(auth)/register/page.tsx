'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flame } from 'lucide-react'

const PRESETS = [30, 60, 90, 100]

export default function RegisterPage() {
  const router = useRouter()
  const [days, setDays] = useState(60)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // NOTE: extend `/api/auth/register` (and the Prisma User model) to persist
        // `lockInDays`. For now we also stash it in localStorage so /onboarding
        // can pick it up if the API is not yet wired.
        body: JSON.stringify({ email, password, lockInDays: days }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Registration failed')
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but sign-in failed. Please try logging in.')
        return
      }

      router.push('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stripePct = Math.min(100, (days / 100) * 100)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-1 px-6 py-10 text-ink">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[200px] -top-[200px] h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,91,31,0.10), transparent 60%)' }}
      />

      <div className="relative flex w-full max-w-[520px] flex-col gap-7">
        {/* brand */}
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-brand-500 text-surface-1 shadow-brand-glow">
            <Flame size={20} fill="currentColor" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Locked<span className="text-brand-500">IN</span></span>
        </div>

        {/* hero */}
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-brand-500">
            // SIGN YOUR LOCK-IN
          </div>
          <h1 className="mt-2.5 text-[44px] font-black leading-[1.05] tracking-[-0.03em]">
            Pick how long.
            <br />
            Then we&apos;re locked in.
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {error && (
            <div className="rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* DURATION — the hero input */}
          <section className="rounded-2xl border border-line bg-surface-2 p-5">
            <div className="font-mono text-[11px] tracking-[0.2em] text-ink-subtle">
              // LOCK-IN DURATION
            </div>

            <div className="mt-3.5 flex items-baseline gap-3.5">
              <input
                type="number"
                value={days}
                min={7}
                max={365}
                onChange={(e) => setDays(Math.max(7, Math.min(365, +e.target.value || 7)))}
                className="w-[200px] bg-transparent p-0 font-sans text-[88px] font-black leading-[0.9] tracking-[-0.05em] text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <div className="text-2xl font-semibold text-ink-subtle">days</div>
            </div>

            {/* preset chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const active = days === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDays(p)}
                    className={`rounded-lg border px-3.5 py-2 font-mono text-xs font-bold tracking-[0.15em] transition-colors ${
                      active
                        ? 'border-brand-500 bg-brand-500 text-surface-1'
                        : 'border-line-2 bg-transparent text-ink-muted hover:border-ink-subtle hover:text-ink'
                    }`}
                  >
                    {p} DAYS
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setDays((d) => Math.min(365, d + 7))}
                className="rounded-lg border border-line-2 bg-transparent px-3 py-2 font-mono text-xs font-bold tracking-[0.15em] text-ink-subtle hover:border-ink-subtle hover:text-ink-muted"
              >
                +1 WEEK
              </button>
            </div>

            {/* visual stripe */}
            <div className="relative mt-4 h-2.5 overflow-hidden rounded-md bg-surface-3">
              <div
                className="h-full transition-[width] duration-200"
                style={{
                  width: `${stripePct}%`,
                  background: 'linear-gradient(90deg, #9c3a15, #ff5b1f)',
                }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] tracking-[0.15em] text-ink-subtle">
              <span>SHORT · 7D</span>
              <span>STANDARD · 60D</span>
              <span>EPIC · 100D+</span>
            </div>
          </section>

          {/* identity */}
          <section className="grid grid-cols-2 gap-3.5">
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
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-[10px] border border-line bg-surface-2 px-3.5 py-3 text-sm text-ink outline-none placeholder:text-ink-subtle/50 focus:border-brand-500"
              />
            </div>
          </section>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-500 px-5 py-[18px] text-[15px] font-extrabold tracking-[0.06em] text-surface-1 transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                'CREATING ACCOUNT...'
              ) : (
                <>
                  <Flame size={16} fill="currentColor" /> LOCK IN FOR {days} DAYS
                </>
              )}
            </button>
            <div className="text-center font-mono text-[10px] tracking-[0.15em] text-ink-subtle">
              ALREADY HAVE AN ACCOUNT?{' '}
              <Link href="/login" className="text-brand-500 no-underline hover:text-brand-400">
                SIGN IN
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
