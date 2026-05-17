import { useAccessControl } from "../hooks/useAccessControl"
import Header from "../components/Header"
import SummaryCards from "../components/SummaryCards"
import AccessLogTable from "../components/AccessLogTable"
import AlarmControl from "../components/AlarmControl"
import TagManager from "../components/TagManager"

export default function Dashboard(){
  const{
    isConnected,
    uptime,
    todayAccesses,
    activeUsers,
    deniedAttempts,
  } = useAccessControl()

  return(
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <Header isConnected={isConnected} uptime={uptime} />

      <SummaryCards
        todayAccesses={todayAccesses}
        activeUsers={activeUsers}
        deniedAttempts={deniedAttempts}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col">
          <AccessLogTable />
        </div>

        <div className="flex flex-col gap-6">
          <AlarmControl />
          <TagManager />
        </div>
      </div>
    </div>
  )
}