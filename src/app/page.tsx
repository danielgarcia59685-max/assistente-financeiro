import { Suspense } from 'react'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div>Carregando...</div>}>
        <Dashboard />
      </Suspense>
    </main>
  )
}