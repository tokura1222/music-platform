"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart, Music2, Piano, Mic2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getGenresByCategory, type GenreDefinition } from "@/lib/genres"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const instGenres = getGenresByCategory('instrumentals')
    const vocalGenres = getGenresByCategory('vocal')

    // Admin Sidebar
    if (pathname.startsWith('/manage')) {
        return (
            <div className={cn("pb-12 border-r bg-background", className)}>
                <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                        <div className="mb-6 flex items-center px-4">
                            <Music2 className="mr-2 h-6 w-6 text-primary" />
                            <h2 className="text-xl font-bold tracking-tight text-primary">
                                Zion Admin
                            </h2>
                        </div>
                        <div className="space-y-1">
                            <Button
                                variant={pathname === '/manage' || pathname === '/manage/dashboard' ? 'secondary' : 'ghost'}
                                className="w-full justify-start font-medium"
                                asChild
                            >
                                <Link href="/manage">
                                    <Home className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                            <Button
                                variant={pathname === '/manage/songs' ? 'secondary' : 'ghost'}
                                className="w-full justify-start font-medium"
                                asChild
                            >
                                <Link href="/manage?tab=songs">
                                    <Music2 className="mr-2 h-4 w-4" />
                                    Upload Song
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-muted-foreground hover:text-foreground"
                                asChild
                            >
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Back to Site
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("pb-12 border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                {/* Logo */}
                <div className="px-3 py-2">
                    <div className="mb-6 flex items-center px-4">
                        <Music2 className="mr-2 h-6 w-6 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-primary">
                            Zion Online
                        </h2>
                    </div>

                    {/* Library */}
                    <div className="space-y-1">
                        <Button
                            variant={pathname === '/' ? 'secondary' : 'ghost'}
                            className="w-full justify-start font-medium"
                            asChild
                        >
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Link>
                        </Button>
                        <Button
                            variant={pathname === '/liked' ? 'secondary' : 'ghost'}
                            className="w-full justify-start font-medium"
                            asChild
                        >
                            <Link href="/liked">
                                <Heart className="mr-2 h-4 w-4" />
                                Liked Songs
                            </Link>
                        </Button>
                    </div>
                </div>

                <Separator className="mx-3" />

                {/* Genre Navigation */}
                <ScrollArea className="h-[calc(100vh-280px)] px-1">
                    {/* Instrumentals */}
                    <GenreSection
                        title="Instrumentals"
                        icon={<Piano className="mr-2 h-4 w-4 text-emerald-400" />}
                        genres={instGenres}
                        pathname={pathname}
                    />

                    <Separator className="mx-3 my-3" />

                    {/* Vocal Songs */}
                    <GenreSection
                        title="Vocal Songs"
                        icon={<Mic2 className="mr-2 h-4 w-4 text-amber-400" />}
                        genres={vocalGenres}
                        pathname={pathname}
                    />
                </ScrollArea>
            </div>
        </div>
    )
}

function GenreSection({
    title,
    icon,
    genres,
    pathname,
}: {
    title: string
    icon: React.ReactNode
    genres: GenreDefinition[]
    pathname: string
}) {
    return (
        <div className="px-3 py-2">
            <h2 className="mb-2 flex items-center px-4 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
                {icon}
                {title}
            </h2>
            <div className="space-y-0.5">
                {genres.map((genre) => {
                    const href = `/genre/${genre.slug}`
                    const isActive = pathname === href
                    return (
                        <Button
                            key={genre.slug}
                            variant={isActive ? 'secondary' : 'ghost'}
                            className="w-full justify-start font-normal text-sm h-8"
                            asChild
                        >
                            <Link href={href}>
                                {genre.name}
                            </Link>
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}
