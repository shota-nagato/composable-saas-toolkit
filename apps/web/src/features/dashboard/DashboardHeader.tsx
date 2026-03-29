import { Avatar } from '@toolkit/ui'

interface DashboardHeaderProps {
  userName: string
  userImage?: string | null
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTodayDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

export function DashboardHeader({ userName, userImage }: DashboardHeaderProps) {
  const firstName = userName.split(' ')[0]

  return (
    <div className="flex items-center gap-3">
      <Avatar src={userImage} fallback={userName} size="md" />
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-xs text-muted">{formatTodayDate()}</p>
      </div>
    </div>
  )
}
