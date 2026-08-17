import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { EnvironmentBadge } from "@/components/dashboard/environment-badge"
import { PageTransition } from "@/components/page-transition"
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
          <header className="bg-background/80 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <EnvironmentBadge />
          </header>
          {/* Skip link target — see the link in the root layout. */}
          <main
            id="main"
            tabIndex={-1}
            className="flex flex-1 flex-col gap-6 p-4 outline-none md:p-6"
          >
            <PageTransition>
              <div className="flex flex-1 flex-col gap-6">{children}</div>
            </PageTransition>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}
