import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
    return (
        <div className="h-full px-4 py-6 lg:px-8">
            <div className="space-y-8">
                {/* Hero Section Skeleton */}
                <section>
                    <div className="relative h-[400px] w-full overflow-hidden rounded-xl bg-muted/50">
                        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                            <Skeleton className="h-6 w-32 rounded-full mb-4" />
                            <Skeleton className="h-10 w-3/4 md:w-1/2 mb-4" />
                            <Skeleton className="h-6 w-1/2 md:w-1/3 mb-8" />
                            <div className="flex gap-4">
                                <Skeleton className="h-11 w-32 rounded-full" />
                                <Skeleton className="h-11 w-32 rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* New Releases Skeleton */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex space-x-4 overflow-hidden">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-[180px] flex-none space-y-3">
                                <Skeleton className="h-[180px] w-full rounded-md" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Charts Skeleton */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 rounded-md p-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-10 w-10 rounded" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <div className="hidden md:block">
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
