'use client';

import { Leaderboard } from '@/components/leaderboard';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Student } from '@/lib/types';
import { collection, query } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LeaderboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, user]);
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useCollection<Student>(leaderboardQuery);

  if (isUserLoading || isLeaderboardLoading || !user) {
    return <div>Loading...</div>;
  }

  const rankedLeaderboard = leaderboard
    ? [...leaderboard]
        .sort((a, b) => b.points - a.points)
        .map((student, index) => ({ ...student, rank: index + 1 }))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
        <p className="text-muted-foreground">See who's at the top of the class!</p>
      </div>
      <Leaderboard students={rankedLeaderboard} currentStudentId={user.uid} />
    </div>
  );
}
