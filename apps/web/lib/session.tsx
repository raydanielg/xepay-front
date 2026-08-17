"use client"

/**
 * Session context.
 *
 * Loads the signed-in user once and exposes their permission set to the
 * whole dashboard. Components ask `can(Perm.X)` rather than checking roles
 * directly — role checks scattered through the UI drift out of step with
 * the backend the moment a role's permissions change.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import { ApiError, api, tokens, type Session } from "@/lib/api"
import { hasPermission, type Permission, type Role } from "@/lib/rbac"

interface SessionContextValue {
  session: Session | null
  loading: boolean
  error: string | null
  can: (permission: Permission) => boolean
  role: Role | null
  isStaff: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!tokens.access) {
      setLoading(false)
      router.replace("/auth")
      return
    }
    try {
      setSession(await api.me())
      setError(null)
    } catch (err) {
      if (err instanceof ApiError && err.isAuthError) {
        tokens.clear()
        router.replace("/auth")
        return
      }
      setError(
        err instanceof ApiError ? err.message : "Could not load your account.",
      )
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const signOut = useCallback(async () => {
    await api.logout().catch(() => undefined)
    setSession(null)
    router.replace("/auth")
  }, [router])

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      loading,
      error,
      can: (permission) => hasPermission(session?.user.permissions, permission),
      role: (session?.user.role as Role) ?? null,
      isStaff: session?.user.is_staff_member ?? false,
      refresh: load,
      signOut,
    }),
    [session, loading, error, load, signOut],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used inside a SessionProvider.")
  }
  return context
}

/**
 * Gate a block of UI on a permission.
 *
 * A convenience for rendering only. The endpoint behind whatever this hides
 * still enforces the same permission server side.
 */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { can } = useSession()
  return <>{can(permission) ? children : fallback}</>
}
