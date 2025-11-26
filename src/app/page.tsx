'use client';
import {DashboardClient} from '@/components/dashboard-client';
import {mainStudent, homeworkAssignments, leaderboardData} from '@/lib/data';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useEffect } from 'react';
import { collection, query, doc, limit } from 'firebase/firestore';
import type { Student, Homework } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function DashboardPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    // Seed data for demonstration
    useEffect(() => {
        if (firestore && user) {
        // Seed homework
        homeworkAssignments.forEach(hw => {
            const hwRef = doc(firestore, 'homework', hw.id);
            setDocumentNonBlocking(hwRef, hw, { merge: true });
        });
        // Seed users
        leaderboardData.forEach(student => {
            const userRef = doc(firestore, 'users', student.id);
            setDocumentNonBlocking(userRef, student, { merge: true });
        });
         // Seed current books for main student
        const currentBooksRef = doc(firestore, 'users', mainStudent.id, 'currentBooks', 'initial-books');
        setDocumentNonBlocking(currentBooksRef, { studentId: mainStudent.id, id: 'initial-books', bookIds: ['Math Textbook', 'History Textbook', 'Laptop'] }, { merge: true });

        }
    }, [firestore, user]);

    const studentDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

    const homeworkQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'homework'), limit(1));
    }, [firestore]);
    const { data: homework, isLoading: isHomeworkLoading } = useCollection<Homework>(homeworkQuery);
    
    const leaderboardQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);
    const { data: leaderboard, isLoading: isLeaderboardLoading } = useCollection<Student>(leaderboardQuery);

    if (isUserLoading || isStudentLoading || isHomeworkLoading || isLeaderboardLoading) {
        return <div>Loading...</div>;
    }
    
    const rankedLeaderboard = leaderboard
    ? [...leaderboard]
        .sort((a, b) => b.points - a.points)
        .map((s, index) => ({ ...s, rank: index + 1 }))
    : [];
    
    // If there is no student data, use the mainStudent and try to set it.
    // This will create the user doc for the anonymous user.
    if (!student && user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      const newStudent = { ...mainStudent, id: user.uid, email: user.email || 'anonymous@example.com' };
      setDocumentNonBlocking(userRef, newStudent, { merge: true });
    }

    const currentStudent = student || { ...mainStudent, id: user?.uid || mainStudent.id };

  return (
    <DashboardClient
      student={currentStudent}
      homework={homework?.[0] || homeworkAssignments[0]}
      leaderboard={rankedLeaderboard}
    />
  );
}
