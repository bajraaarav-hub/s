'use client';

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import type {Homework, Student} from '@/lib/types';
import {ArrowRight, BookOpenCheck, Flame, Star, Trophy} from 'lucide-react';
import Link from 'next/link';

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  className?: string;
}) {
  const Icon = icon;
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function DashboardClient({
  student,
  homework,
  leaderboard,
}: {
  student: Student;
  homework: Homework;
  leaderboard: Student[];
}) {
  const userRank = leaderboard.find(s => s.id === student.id)?.rank || 'N/A';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={student.avatarUrl} alt={student.name} />
          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Welcome back, {student.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here is your summary for today.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Star} label="Points" value={student.points} />
        <StatCard icon={Flame} label="Streak" value={`${student.streak} days`} className="text-accent-foreground" />
        <StatCard icon={Trophy} label="Rank" value={`#${userRank}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get right back into your tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/backpack" className="block">
              <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <BookOpenCheck className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Today's Book Check</h3>
                    <p className="text-sm text-muted-foreground">{homework.title}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>See how you stack up against your peers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.slice(0, 3).map(s => (
                  <TableRow key={s.id} className={s.id === student.id ? 'bg-muted/50' : ''}>
                    <TableCell className="font-medium">{s.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={s.avatarUrl} alt={s.name} />
                          <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{s.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Link href="/leaderboard" className="mt-4 block text-center">
              <Button variant="outline" className="w-full">
                View Full Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
