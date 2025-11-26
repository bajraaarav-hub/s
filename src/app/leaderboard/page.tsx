import {Leaderboard} from '@/components/leaderboard';
import {leaderboardData, mainStudent} from '@/lib/data';

export default function LeaderboardPage() {
  const rankedLeaderboard = leaderboardData
    .sort((a, b) => b.points - a.points)
    .map((student, index) => ({...student, rank: index + 1}));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
        <p className="text-muted-foreground">See who's at the top of the class!</p>
      </div>
      <Leaderboard students={rankedLeaderboard} currentStudentId={mainStudent.id} />
    </div>
  );
}
