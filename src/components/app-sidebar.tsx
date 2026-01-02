'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Backpack, BarChart3, BookOpenCheck, CalendarCheck, Home, ThumbsUp} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { ThemeSwitcher } from './theme-switcher';

const navItems = [
  {href: '/', icon: Home, label: 'Dashboard'},
  {href: '/backpack', icon: BookOpenCheck, label: 'Book Check'},
  {href: '/attendance', icon: CalendarCheck, label: 'Attendance'},
  {href: '/leave-requests', icon: ThumbsUp, label: 'Leave Requests'},
  {href: '/leaderboard', icon: BarChart3, label: 'Leaderboard'},
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
          <Backpack className="h-7 w-7 text-primary" />
          <span className="text-foreground">SmartBackpack</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitcher />
      </SidebarFooter>
    </Sidebar>
  );
}
