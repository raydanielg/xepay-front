"use client"

import * as React from "react"

import { NavDocuments } from "@workspace/ui/components/nav-documents"
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
import { IconDashboard, IconChartBar, IconUsers, IconCamera, IconFileDescription, IconFileAi, IconSettings, IconHelp, IconSearch, IconDatabase, IconReport, IconFileWord, IconInnerShadowTop } from "@tabler/icons-react"

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
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: (
        <IconChartBar
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
  navClouds: [
    {
      title: "Capture",
      icon: (
        <IconCamera
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <IconFileDescription
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <IconFileAi
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
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
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <IconDatabase
        />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <IconReport
        />
      ),
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: (
        <IconFileWord
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <IconInnerShadowTop className="size-5!" />
              <span className="text-base font-semibold">XerinPay</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
