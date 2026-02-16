import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Player } from '@/components/layout/player';
import { DonateButton } from '@/components/layout/donate-button';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: 'Zion Online - Reggae Music Platform',
  description: 'Listen and download the best Reggae music.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <div className="relative flex min-h-screen flex-col">
          {/* Desktop Sidebar (Fixed Left) */}
          <aside className="fixed left-0 top-0 bottom-20 z-40 hidden w-64 border-r bg-background md:block">
            <Sidebar className="h-full" />
          </aside>

          {/* Main Content Wrapper */}
          <div className="flex flex-1 flex-col md:pl-64 pb-20">
            {/* Header (Top Bar) */}
            <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {/* Mobile Menu Trigger */}
              <div className="mr-4 md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
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
                <DonateButton />
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>

          {/* Persistent Player (Fixed Bottom) */}
          <Player className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t bg-background" />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
