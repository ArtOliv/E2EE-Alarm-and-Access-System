import { useState, useEffect } from 'react'

export function useAccessControl() {
  const [isConnected, setIsConnected] = useState(true)
  const [uptime, setUptime] = useState('2h 34m 15s')

  // Simula atualizações de uptime e status de conexão
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor(Math.random() * 60)
      const minutes = 34 + Math.floor(Math.random() * 5)
      setUptime(`2h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    isConnected,
    uptime,
    todayAccesses: 0,
    activeUsers: 0,
    deniedAttempts: 0,
  }
}