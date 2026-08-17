import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import { SiteHeader } from "@workspace/ui/components/site-header"
import { SectionCards } from "@workspace/ui/components/section-cards"
import { ChartAreaInteractive } from "@workspace/ui/components/chart-area-interactive"
import { DataTable } from "@workspace/ui/components/data-table"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import data from "./data.json"

export default function DashboardPage() {
  return (
    <div className="[--header-height:calc(--spacing(2)+3.5rem)]">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing(4)) + 16rem)",
            "--header-height": "calc(var(--spacing(2) + 3.5rem))",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
