'use client';
import {Backpack} from 'lucide-react';
import Link from 'next/link';
import {SidebarTrigger} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export function MobileHeader() {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
      <SidebarTrigger />
      <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
        <Backpack className="h-7 w-7 text-primary" />
        <span className="text-foreground">SmartBackpack</span>
      </Link>
    </header>
  );
}
