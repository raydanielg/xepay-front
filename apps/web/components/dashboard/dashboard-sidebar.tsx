"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { IconLogout, IconSelector } from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { useSession } from "@/lib/session"
import { visibleNav } from "@/lib/navigation"
import { ROLE_LABELS, type Role } from "@/lib/rbac"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { session, loading, signOut } = useSession()

  const groups = visibleNav(
    session?.user.permissions,
    session?.user.is_staff_member ?? false,
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Image
                  src="/assets/XERIN icon-09 (1).png"
                  alt=""
                  width={28}
                  height={28}
                  className="shrink-0"
                />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">XerinPay</span>
                  {session?.merchant ? (
                    <span className="text-muted-foreground truncate text-xs">
                      {session.merchant.display_name}
                    </span>
                  ) : session?.user.is_staff_member ? (
                    <span className="text-muted-foreground truncate text-xs">
                      Internal admin
                    </span>
                  ) : null}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {loading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          groups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active =
                      item.url === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.url)

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.description ?? item.title}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {initials(session?.user.full_name ?? session?.user.email)}
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">
                      {session?.user.full_name ?? "—"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {session
                        ? ROLE_LABELS[session.user.role as Role] ??
                          session.user.role
                        : ""}
                    </span>
                  </div>
                  <IconSelector className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">
                    {session?.user.email}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {session
                        ? ROLE_LABELS[session.user.role as Role] ??
                          session.user.role
                        : ""}
                    </Badge>
                    {session?.user.totp_enabled ? (
                      <Badge variant="outline" className="text-xs">
                        2FA on
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Account settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>
                  <IconLogout className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function initials(value: string | undefined): string {
  if (!value) return "?"
  const parts = value.split(/[\s@.]+/).filter(Boolean)
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase()
}
