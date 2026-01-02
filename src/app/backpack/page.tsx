'use client';

import { BackpackChecker } from '@/components/backpack-checker';
import { useCollection, useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Homework, Student } from '@/lib/types';
import { collection, query, doc } from 'firebase/firestore';
import { useEffect } from 'react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { homeworkAssignments as mockHomework, mainStudent } from '@/lib/data';
import { useRouter } from 'next/navigation';

export default function BackpackPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const homeworkQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'homework'));
  }, [firestore, user]);
  const { data: allHomework, isLoading: isHomeworkLoading } = useCollection<Homework>(homeworkQuery);

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: studentData, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

  // Create the student doc for the user if it doesn't exist.
  useEffect(() => {
      if (!isStudentLoading && !studentData && user && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        const newStudent = { ...mainStudent, id: user.uid, email: user.email || 'anonymous@example.com', name: user.displayName || 'Anonymous Panda' };
        setDocumentNonBlocking(userRef, newStudent, { merge: true });
      }
  }, [isStudentLoading, studentData, user, firestore]);

  if (isHomeworkLoading || isUserLoading || isStudentLoading || !user) {
    return <div>Loading...</div>;
  }

  const currentStudent = studentData || { ...mainStudent, id: user?.uid || mainStudent.id, name: user.displayName || 'Anonymous Panda'};

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
