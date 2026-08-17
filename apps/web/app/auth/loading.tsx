import { Skeleton } from "@workspace/ui/components/skeleton"

export default function AuthLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="overflow-hidden rounded-xl border bg-card shadow-xl">
          <div className="grid md:grid-cols-2">
            {/* Form side skeleton */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Logo area */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-2.5 w-32" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
                {/* Email field */}
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
                {/* Password field */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
                {/* Button */}
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            </div>
            {/* Image side skeleton */}
            <div className="relative hidden md:block">
              <Skeleton className="absolute inset-0 h-full w-full" />
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-6 flex justify-center">
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
    </div>
  )
}
