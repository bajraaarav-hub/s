import type {Metadata} from 'next';
import './globals.css';
import {AppSidebar} from '@/components/app-sidebar';
import {MobileHeader} from '@/components/mobile-header';
import {SidebarProvider, SidebarInset} from '@/components/ui/sidebar';
import {Toaster} from '@/components/ui/toaster';
import {cn} from '@/lib/utils';

export const metadata: Metadata = {
  title: 'SmartBackpack Pro',
  description: 'AI-powered student productivity app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background')}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <MobileHeader />
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
