import { useState, useEffect, useCallback } from 'react'

// Mantive apenas os logs simulados, já que você fará a integração deles mais tarde
const initialAccessLogs = [
  { id: 1, time: '14:32:15', user: 'Carlos Silva', tagId: 'A1B2C3D4', status: 'success' },
  { id: 2, time: '14:28:42', user: 'Maria Santos', tagId: 'E5F6G7H8', status: 'success' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
]

export function useAccessControl() {
  const [isConnected, setIsConnected] = useState(true)
  const [uptime, setUptime] = useState('2h 34m 15s')
  const [alarmActive, setAlarmActive] = useState(false)
  const [accessLogs, setAccessLogs] = useState(initialAccessLogs)

  // Simula atualizações de uptime e status de conexão
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor(Math.random() * 60)
      const minutes = 34 + Math.floor(Math.random() * 5)
      setUptime(`2h ${minutes}m ${seconds}s`)

      if (Math.random() < 0.05) {
        setIsConnected(false)
        setTimeout(() => setIsConnected(true), 2000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleAlarm = useCallback(() => {
    setAlarmActive((prev) => !prev)
  }, [])

  // Essas variáveis temporárias vão sumir quando você integrar o banco de dados real nos SummaryCards
  const todayAccesses = accessLogs.length
  const activeUsers = 0 // Temporário até a integração real do SummaryCards
  const deniedAttempts = accessLogs.filter((log) => log.status === 'denied').length

  return {
    isConnected,
    uptime,
    alarmActive,
    accessLogs,
    todayAccesses,
    activeUsers,
    deniedAttempts,
    toggleAlarm
  }
}