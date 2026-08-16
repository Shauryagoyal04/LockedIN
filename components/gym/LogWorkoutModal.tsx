'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import LogWorkoutForm from './LogWorkoutForm'
import type { SessionRow } from './types'

interface LogWorkoutModalProps {
  open: boolean
  onClose: () => void
  onLogged: (session: SessionRow) => void
}

export default function LogWorkoutModal({ open, onClose, onLogged }: LogWorkoutModalProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-20"
      onClick={onClose}
    >
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <LogWorkoutForm
          onLogged={(session) => {
            onLogged(session)
            setTimeout(onClose, 1800)
          }}
        />
      </div>
    </div>
  )
}
