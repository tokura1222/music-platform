"use client"

import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function DonateButton() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
                    <Coffee className="h-4 w-4" />
                    Support
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Support Zion Onine</DialogTitle>
                    <DialogDescription>
                        If you enjoy the music, please consider buying us a coffee to keep the servers running!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Your support helps independent artists and maintains this platform.
                    </p>
                    <Button className="w-full" size="lg">
                        Donate via Ko-fi
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
