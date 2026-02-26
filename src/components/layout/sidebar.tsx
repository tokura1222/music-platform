"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Home, Heart, Music2, Piano, Mic2, LogOut, ChevronDown, ChevronRight, Video } from "lucide-react"
import Cookies from 'js-cookie'
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getGenresByCategory, type GenreDefinition } from "@/lib/genres"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab')

    const instGenres = getGenresByCategory('instrumentals')
    const vocalGenres = getGenresByCategory('vocal')
    const movieGenres = getGenresByCategory('movie')

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
                                variant={pathname === '/manage' && (!tab || tab === 'dashboard') ? 'secondary' : 'ghost'}
                                className="w-full justify-start font-medium"
                                asChild
                            >
                                <Link href="/manage">
                                    <Home className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                            <Button
                                variant={pathname === '/manage' && tab === 'songs' ? 'secondary' : 'ghost'}
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
                                <Link href="/" target="_blank" rel="noopener noreferrer">
                                    <Home className="mr-2 h-4 w-4" />
                                    サイトを開く
                                </Link>
                            </Button>

                            <Separator className="my-2" />

                            <Button
                                variant="ghost"
                                className="w-full justify-start font-medium text-red-400 hover:text-red-300 hover:bg-red-900/10"
                                onClick={() => {
                                    Cookies.remove('admin_token');
                                    window.location.href = '/manage/login';
                                }}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
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
                    <div className="mb-6 px-4">
                        <Link href="/">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="Zion Online" className="h-12 w-auto object-contain" />
                        </Link>
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
                        <Button
                            variant={pathname === '/songs' ? 'secondary' : 'ghost'}
                            className="w-full justify-start font-medium"
                            asChild
                        >
                            <Link href="/songs">
                                <Music2 className="mr-2 h-4 w-4" />
                                All Songs
                            </Link>
                        </Button>
                        <Button
                            variant={pathname === '/movies' ? 'secondary' : 'ghost'}
                            className="w-full justify-start font-medium"
                            asChild
                        >
                            <Link href="/movies">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                                Movies
                            </Link>
                        </Button>
                    </div>
                </div>

                <Separator className="mx-3" />

                <ScrollArea className="h-[calc(100vh-280px)] px-1">
                    {/* Instrumentals */}
                    <GenreSection
                        title="Instrumentals"
                        icon={<Piano className="mr-2 h-4 w-4 text-emerald-400" />}
                        genres={instGenres}
                        pathname={pathname}
                        defaultOpen={true}
                    />

                    <Separator className="mx-3 my-3" />

                    {/* Vocal Songs */}
                    <GenreSection
                        title="Vocal Songs"
                        icon={<Mic2 className="mr-2 h-4 w-4 text-amber-400" />}
                        genres={vocalGenres}
                        pathname={pathname}
                        defaultOpen={true}
                    />

                    {movieGenres.length > 0 && (
                        <>
                            <Separator className="mx-3 my-3" />

                            {/* Movies */}
                            <GenreSection
                                title="Movies"
                                icon={<Video className="mr-2 h-4 w-4 text-cyan-400" />}
                                genres={movieGenres}
                                pathname={pathname}
                                defaultOpen={true}
                            />
                        </>
                    )}
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
    defaultOpen = false,
}: {
    title: string
    icon: React.ReactNode
    genres: GenreDefinition[]
    pathname: string
    defaultOpen?: boolean
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const ChevronIcon = isOpen ? ChevronDown : ChevronRight

    return (
        <div className="px-3 py-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mb-2 flex w-full items-center justify-between px-4 text-sm font-semibold tracking-tight text-muted-foreground uppercase hover:text-foreground transition-colors"
                aria-expanded={isOpen}
                aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            >
                <div className="flex items-center">
                    {icon}
                    {title}
                </div>
                <ChevronIcon className="h-4 w-4 opacity-50" />
            </button>

            {isOpen && (
                <div className="space-y-0.5 animate-in slide-in-from-top-1 fade-in-0 duration-200">
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
            )}
        </div>
    )
}
