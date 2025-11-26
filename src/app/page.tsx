import {DashboardClient} from '@/components/dashboard-client';
import {mainStudent, homeworkAssignments, leaderboardData} from '@/lib/data';

export default function DashboardPage() {
  const rankedLeaderboard = leaderboardData
    .sort((a, b) => b.points - a.points)
    .map((student, index) => ({...student, rank: index + 1}));

  return (
    <DashboardClient
      student={mainStudent}
      homework={homeworkAssignments[0]}
      leaderboard={rankedLeaderboard}
    />
  );
}
