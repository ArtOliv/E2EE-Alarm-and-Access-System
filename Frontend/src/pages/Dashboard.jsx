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
    alarmActive,
    accessLogs,
    registeredTags,
    todayAccesses,
    activeUsers,
    deniedAttempts,
    toggleAlarm,
    addTag,
    removeTag,
  } = useAccessControl()

  return(
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <Header isConnected={isConnected} uptime={uptime} />

      <SummaryCards
        todayAccesses={todayAccesses}
        activeUsers={activeUsers}
        deniedAttempts={deniedAttempts}
      />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 flex flex-col">
          <AccessLogTable logs={accessLogs} />
        </div>

        <div className="flex flex-col gap-6">
          <AlarmControl active={alarmActive} onToggle={toggleAlarm} />
          <TagManager tags={registeredTags} onAddTag={addTag} onRemoveTag={removeTag} />
        </div>
      </div>
    </div>
  )
}