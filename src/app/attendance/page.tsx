
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Student, AttendanceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function AttendanceManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const today = format(new Date(), 'yyyy-MM-dd');

    const studentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'student'));
    }, [firestore]);
    const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsQuery);
    
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});

    const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSaveChanges = () => {
        if (!firestore || !students) return;

        students.forEach(student => {
            const status = attendance[student.id];
            if (status) {
                const attendanceRef = doc(firestore, 'users', student.id, 'attendance', today);
                setDocumentNonBlocking(attendanceRef, {
                    id: today,
                    date: today,
                    status: status
                }, { merge: true });
            }
        });
        toast({
            title: 'Attendance Saved',
            description: "Today's attendance records have been updated.",
        });
    };

    if (areStudentsLoading) {
        return <div>Loading students...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Mark each student's attendance.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(students || []).map(student => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={student.avatarUrl} alt={student.name} />
                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{student.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <RadioGroup
                                        defaultValue={attendance[student.id]}
                                        onValueChange={(value: 'present' | 'absent') => handleStatusChange(student.id, value)}
                                        className="flex justify-end space-x-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="present" id={`present-${student.id}`} />
                                            <Label htmlFor={`present-${student.id}`}>Present</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                                            <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                                        </div>
                                    </RadioGroup>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    );
}


export default function AttendancePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc<Student>(userDocRef);

  if (isUserLoading || isUserDocLoading || !user) {
    return <div>Loading...</div>;
  }

  const isTeacher = userData?.role === 'teacher';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Attendance</h1>
        <p className="text-muted-foreground">Manage daily student attendance.</p>
      </div>
      {isTeacher ? (
        <AttendanceManager />
      ) : (
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      )}
    </div>
  );
}
