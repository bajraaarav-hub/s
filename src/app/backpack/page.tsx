'use client';

import { BackpackChecker } from '@/components/backpack-checker';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Homework, Student } from '@/lib/types';
import { collection, query } from 'firebase/firestore';
import { useEffect } from 'react';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { mainStudent, homeworkAssignments as mockHomework, leaderboardData } from '@/lib/data'; // for seeding

export default function BackpackPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const homeworkQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'homework'));
  }, [firestore]);
  const { data: allHomework, isLoading: isHomeworkLoading } = useCollection<Homework>(homeworkQuery);

  const studentQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: studentData, isLoading: isStudentLoading } = useCollection<Student>(studentQuery as any);

  // Seed data for demonstration
  useEffect(() => {
    if (firestore) {
      // Seed homework
      mockHomework.forEach(hw => {
        const hwRef = doc(firestore, 'homework', hw.id);
        setDocumentNonBlocking(hwRef, hw, { merge: true });
      });
      // Seed users
      leaderboardData.forEach(student => {
        const userRef = doc(firestore, 'users', student.id);
        setDocumentNonBlocking(userRef, student, { merge: true });
      });
    }
  }, [firestore]);


  if (isHomeworkLoading || isUserLoading || isStudentLoading) {
    return <div>Loading...</div>;
  }

  // In a real app, you'd likely have a way to identify the current student.
  // For now, we'll continue to use a primary student for demo purposes,
  // but we'll use the authenticated user's data if available.
  const currentStudent = studentData?.[0] || mainStudent;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Smart Book Check</h1>
        <p className="text-muted-foreground">Verify you have all the books you need for your homework, powered by AI.</p>
      </div>
      <BackpackChecker
        student={currentStudent}
        allHomework={allHomework || []}
      />
    </div>
  );
}
