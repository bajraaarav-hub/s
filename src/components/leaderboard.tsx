'use client';

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {cn} from '@/lib/utils';
import type {Student} from '@/lib/types';
import {Flame, Star, Trophy} from 'lucide-react';

export function Leaderboard({students, currentStudentId}: {students: Student[]; currentStudentId: string}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-center">Streak</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.id} className={cn(student.id === currentStudentId && 'bg-primary/10')}>
                <TableCell>
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                    {index < 3 ? (
                      <Trophy
                        className={cn(
                          'h-6 w-6',
                          index === 0 && 'text-yellow-500',
                          index === 1 && 'text-gray-400',
                          index === 2 && 'text-orange-400'
                        )}
                      />
                    ) : (
                      <span className="text-lg font-bold">{student.rank}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="person face" />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    {student.streak}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 font-semibold text-primary">
                    <Star className="h-4 w-4" />
                    <span>{student.points.toLocaleString()}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
