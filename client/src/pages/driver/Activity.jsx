import { History } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { EmptyState } from '../../components/ui'

export default function DriverActivity() {
  return (
    <AppShell title="Activity">
      <div className="card">
        <EmptyState
          icon={History}
          title="Coming soon"
          description="The trip activity view is coming soon."
        />
      </div>
    </AppShell>
  )
}
