"use client"

import Link from "next/link"
import { Home, Compass, Heart, Music2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("pb-12 border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-6 flex items-center px-4">
                        <Music2 className="mr-2 h-6 w-6 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-primary">
                            Zion Online
                        </h2>
                    </div>
                    <div className="space-y-1">
                        <Button variant="secondary" className="w-full justify-start font-medium" asChild>
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start font-medium" asChild>
                            <Link href="/browse">
                                <Compass className="mr-2 h-4 w-4" />
                                Browse
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start font-medium" asChild>
                            <Link href="/liked">
                                <Heart className="mr-2 h-4 w-4" />
                                Liked Songs
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Playlists
                    </h2>
                    <ScrollArea className="h-[300px] px-1">
                        <div className="space-y-1 p-2">
                            <Button variant="ghost" className="w-full justify-start font-normal">
                                Reggae Classics
                            </Button>
                            <Button variant="ghost" className="w-full justify-start font-normal">
                                Dub Sessions
                            </Button>
                            <Button variant="ghost" className="w-full justify-start font-normal">
                                Dancehall Top 50
                            </Button>
                            <Button variant="ghost" className="w-full justify-start font-normal">
                                Roots Rock
                            </Button>
                            <Button variant="ghost" className="w-full justify-start font-normal">
                                Jah Works
                            </Button>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}
