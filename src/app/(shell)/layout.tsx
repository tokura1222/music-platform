import { Sidebar } from '@/components/layout/sidebar';
import { Player } from '@/components/layout/player';
import { DonateButton } from '@/components/layout/donate-button';
import { Menu } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from "@/components/ui/sonner"
import { AudioProvider } from '@/context/AudioContext';
import { VideoProvider } from '@/context/VideoContext';
import { FloatingVideoPlayer } from '@/components/features/floating-video-player';
import { Suspense } from "react"

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        
        <AudioProvider>
          <VideoProvider>
            <div className="relative flex min-h-screen flex-col">
              {/* Content area with Resizable Sidebar */}
              <div className="flex flex-1 flex-col pb-20 overflow-hidden">
                {/* Header (Top Bar) */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  {/* Mobile Menu Trigger */}
                  <div className="mr-4 md:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                          <Menu className="h-6 w-6" />
                          <span className="sr-only">Toggle Menu</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="p-0 w-64">
                        <Sidebar className="h-full border-none" />
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Logo for Mobile */}
                  <div className="flex-1 md:hidden font-bold text-lg">
                    Zion Online
                  </div>

                  {/* Desktop Spacer / Search (Future) */}
                  <div className="hidden md:flex flex-1">
                    {/* Search bar could go here */}
                  </div>

                  {/* Actions */}
                  <div className="ml-auto flex items-center space-x-4">
                    <div className="hidden lg:block text-[10px] text-muted-foreground mr-2 max-w-sm leading-tight text-right">
                      こちらは趣味で運営しているサイトです。<br />
                      サイトをはじめ、掲載している著作物のほとんどはAIを活用して制作しています。<br />
                      楽曲はSUNOのProプランで作成したものですので、どうぞお気軽にご利用ください。
                    </div>
                    <DonateButton />
                  </div>
                </header>

                <ResizablePanelGroup
                  direction="horizontal"
                  className="flex-1 items-stretch"
                >
                  <ResizablePanel
                    defaultSize={20}
                    minSize={15}
                    maxSize={30}
                    className="hidden md:block"
                  >
                    <Suspense fallback={<div className="h-full bg-background" />}>
                      <Sidebar className="h-full border-r-0" />
                    </Suspense>
                  </ResizablePanel>

                  <ResizableHandle withHandle className="hidden md:flex" />

                  <ResizablePanel defaultSize={80}>
                    {/* Page Content */}
                    <main className="h-full overflow-y-auto w-full">
                      {children}
                    </main>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>

              {/* Persistent Player (Fixed Bottom) */}
              <Player className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t bg-background" />
              <FloatingVideoPlayer />
              <Toaster />
            </div>
          </VideoProvider>
        </AudioProvider>
      </>
  );
}
