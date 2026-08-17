"use client"

import * as React from "react"

import { NavMain } from "@workspace/ui/components/nav-main"
import { NavSecondary } from "@workspace/ui/components/nav-secondary"
import { NavUser } from "@workspace/ui/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { IconDashboard, IconChartBar, IconUsers, IconSettings, IconHelp, IconSearch, IconWallet, IconReceipt, IconArrowsRightLeft } from "@tabler/icons-react"

const data = {
  user: {
    name: "XerinPay User",
    email: "user@xerinpay.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <IconDashboard
        />
      ),
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: (
        <IconArrowsRightLeft
        />
      ),
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: (
        <IconChartBar
        />
      ),
    },
    {
      title: "Wallet",
      url: "/dashboard/wallet",
      icon: (
        <IconWallet
        />
      ),
    },
    {
      title: "Invoices",
      url: "/dashboard/invoices",
      icon: (
        <IconReceipt
        />
      ),
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: (
        <IconUsers
        />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: (
        <IconSettings
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <IconHelp
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <IconSearch
        />
      ),
    },
  ],
  documents: [],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/dashboard" />}
            >
              <img
                src="/assets/XERIN PAY LOGO-12-12.svg"
                alt="XerinPay"
                className="h-10 w-auto"
              />
              <span className="text-base font-semibold">XerinPay</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
