import {LeaveRequestHelper} from '@/components/leave-request-helper';
import {mainStudent, studentGrades, attendanceHistory, pastLeaveRequests} from '@/lib/data';

export default function LeaveRequestsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leave Request Helper</h1>
        <p className="text-muted-foreground">Submit leave requests and get AI-powered insights for approval.</p>
      </div>
      <LeaveRequestHelper
        student={mainStudent}
        grades={studentGrades}
        attendance={attendanceHistory}
        pastRequests={pastLeaveRequests}
      />
    </div>
  );
}
