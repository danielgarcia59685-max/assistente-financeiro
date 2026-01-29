import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Recuperar dados do localStorage
    const storedUserId = localStorage.getItem('user_id')
    const storedEmail = localStorage.getItem('user_email')

    if (storedUserId && storedEmail) {
      setUserId(storedUserId)
      setUserEmail(storedEmail)
    } else {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  const logout = () => {
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    router.push('/login')
  }

  return { userId, userEmail, loading, logout }
}
