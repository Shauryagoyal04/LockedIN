import NavBar from '@/components/NavBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <NavBar />
      <main className="flex-1 md:ml-56 pb-20 md:pb-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
