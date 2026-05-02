import { useState, useEffect, useCallback } from 'react'

const initialAccessLogs = [
  { id: 1, time: '14:32:15', user: 'Carlos Silva', tagId: 'A1B2C3D4', status: 'success' },
  { id: 2, time: '14:28:42', user: 'Maria Santos', tagId: 'E5F6G7H8', status: 'success' },
  { id: 3, time: '14:25:10', user: 'Desconhecido', tagId: 'X9Y0Z1W2', status: 'denied' },
  { id: 4, time: '14:20:33', user: 'João Oliveira', tagId: 'I9J0K1L2', status: 'success' },
  { id: 5, time: '14:15:58', user: 'Ana Pereira', tagId: 'M3N4O5P6', status: 'success' },
  { id: 6, time: '14:10:22', user: 'Desconhecido', tagId: 'Q7R8S9T0', status: 'denied' },
  { id: 7, time: '14:05:45', user: 'Pedro Costa', tagId: 'U1V2W3X4', status: 'success' },
]

const initialTags = [
  { id: 'A1B2C3D4', name: 'Carlos Silva' },
  { id: 'E5F6G7H8', name: 'Maria Santos' },
  { id: 'I9J0K1L2', name: 'João Oliveira' },
  { id: 'M3N4O5P6', name: 'Ana Pereira' },
  { id: 'U1V2W3X4', name: 'Pedro Costa' },
]

export function useAccessControl() {
  const [isConnected, setIsConnected] = useState(true)
  const [uptime, setUptime] = useState('2h 34m 15s')
  const [alarmActive, setAlarmActive] = useState(false)
  const [accessLogs, setAccessLogs] = useState(initialAccessLogs)
  const [registeredTags, setRegisteredTags] = useState(initialTags)

  // Simula atualizacoes de uptime e status de conexao
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor(Math.random() * 60)
      const minutes = 34 + Math.floor(Math.random() * 5)
      setUptime(`2h ${minutes}m ${seconds}s`)

      // Simula perda/reconexao ocasional
      if (Math.random() < 0.05) {
        setIsConnected(false)
        setTimeout(() => setIsConnected(true), 2000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Simula novos acessos em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const randomTag = registeredTags[Math.floor(Math.random() * registeredTags.length)]
        const isKnownUser = Math.random() > 0.2
        
        const newAccess = {
          id: Date.now(),
          time: new Date().toLocaleTimeString('pt-BR'),
          user: isKnownUser ? (randomTag?.name || 'Usuário') : 'Desconhecido',
          tagId: Math.random().toString(36).substring(2, 10).toUpperCase(),
          status: isKnownUser ? 'success' : 'denied',
        }
        
        setAccessLogs((prev) => [newAccess, ...prev.slice(0, 19)])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [registeredTags])

  const toggleAlarm = useCallback(() => {
    setAlarmActive((prev) => !prev)
  }, [])

  const addTag = useCallback((tagId, tagName) => {
    if (tagId.trim() && tagName.trim()) {
      setRegisteredTags((prev) => [
        ...prev,
        { id: tagId.toUpperCase(), name: tagName }
      ])
      return true
    }
    return false
  }, [])

  const removeTag = useCallback((tagId) => {
    setRegisteredTags((prev) => prev.filter((tag) => tag.id !== tagId))
  }, [])

  const todayAccesses = accessLogs.length
  const activeUsers = registeredTags.length
  const deniedAttempts = accessLogs.filter((log) => log.status === 'denied').length

  return {
    isConnected,
    uptime,
    alarmActive,
    accessLogs,
    registeredTags,
    todayAccesses,
    activeUsers,
    deniedAttempts,
    toggleAlarm,
    addTag,
    removeTag,
  }
}