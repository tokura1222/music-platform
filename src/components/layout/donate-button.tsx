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
                <Button data-donate-trigger variant="default" className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
                    <Coffee className="h-4 w-4" />
                    Zion Onlineをサポートする
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Zion Onlineをサポートする</DialogTitle>
                    <DialogDescription>
                        活動を継続するために、コーヒー1杯分からのご支援をお願いします。
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-center text-sm text-muted-foreground">
                        皆さまのサポートがアーティスト活動とプラットフォームの運営を支えています。
                    </p>
                    <Button className="w-full gap-2" size="lg" asChild>
                        <a href="https://ko-fi.com/ntoku" target="_blank" rel="noopener noreferrer">
                            <Coffee className="h-5 w-5" />
                            Ko-fiでサポートする
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
