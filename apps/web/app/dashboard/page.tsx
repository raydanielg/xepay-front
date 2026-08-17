import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import { SiteHeader } from "@workspace/ui/components/site-header"
import { SectionCards } from "@workspace/ui/components/section-cards"
import { ChartAreaInteractive } from "@workspace/ui/components/chart-area-interactive"
import { DataTable } from "@workspace/ui/components/data-table"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import data from "./data.json"

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <SectionCards />
            <ChartAreaInteractive />
            <DataTable data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
