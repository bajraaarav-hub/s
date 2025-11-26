import {AttendanceTracker} from '@/components/attendance-tracker';
import {leaderboardData} from '@/lib/data';

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Attendance Tracker</h1>
        <p className="text-muted-foreground">Mark attendance and detect anomalies with AI assistance.</p>
      </div>
      <AttendanceTracker students={leaderboardData} />
    </div>
  );
}
