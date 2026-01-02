'use client';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {Backpack, BarChart3, BookOpenCheck, Home, LogOut, ThumbsUp} from 'lucide-react';
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
import { useUser, useDoc, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';


const studentNavItems = [
  {href: '/', icon: Home, label: 'Dashboard'},
  {href: '/backpack', icon: BookOpenCheck, label: 'Book Check'},
  {href: '/leave-requests', icon: ThumbsUp, label: 'Leave Requests'},
  {href: '/leaderboard', icon: BarChart3, label: 'Leaderboard'},
];

const teacherNavItems = [
    {href: '/', icon: Home, label: 'Dashboard'},
    {href: '/leave-approval', icon: ThumbsUp, label: 'Leave Approval'},
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();


  const userDocRef = useMemoFirebase(() => {
    // Only create the doc ref if the user is fully loaded and exists
    if (!firestore || isUserLoading || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user, isUserLoading]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc<Student>(userDocRef);

  // Default to student nav while user data is loading
  const navItems = !isUserDocLoading && userData?.role === 'teacher' ? teacherNavItems : studentNavItems;

  const handleLogout = async () => {
    if (!auth) return;
    try {
        await auth.signOut();
        toast({ title: 'Signed out successfully.' });
        router.push('/login');
    } catch (error: any) {
        console.error("Logout failed:", error);
        toast({
            variant: "destructive",
            title: "Logout Failed",
            description: error.message || "Could not sign out.",
        });
    }
  };


  if (pathname === '/login') {
      return null;
  }

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
        <Button variant="outline" size="icon" onClick={handleLogout} className="w-full">
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Log Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
