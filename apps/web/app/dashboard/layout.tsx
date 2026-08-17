import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { EnvironmentBadge } from "@/components/dashboard/environment-badge"
import { SessionProvider } from "@/lib/session"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <EnvironmentBadge />
          </header>
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}
