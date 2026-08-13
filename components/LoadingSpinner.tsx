export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[60vh] w-full p-8">
      <div className="w-8 h-8 border-2 border-gray-600 border-t-brand-500 rounded-full animate-spin" />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}
