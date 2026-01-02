'use client';
import {useState, useMemo, useEffect, useTransition} from 'react';
import {useUser, useFirestore, useCollection, useMemoFirebase, useDoc} from '@/firebase';
import {collectionGroup, query, where, doc} from 'firebase/firestore';
import {useRouter} from 'next/navigation';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';
import {format, parseISO} from 'date-fns';
import {Skeleton} from '@/components/ui/skeleton';
import {AlertTriangle, Loader2} from 'lucide-react';
import type {LeaveRequest, Student} from '@/lib/types';
import {
  generateLeaveRequestReasoning,
  LeaveRequestInput,
  LeaveRequestOutput,
} from '@/ai/flows/leave-request-ai-helper';
import {useToast} from '@/hooks/use-toast';
import { studentGrades, attendanceHistory, pastLeaveRequests } from '@/lib/data';

function LeaveApprovalContent() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [analysisResult, setAnalysisResult] = useState<LeaveRequestOutput | null>(null);
  const [isAnalysisPending, startAnalysisTransition] = useTransition();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: teacher } = useDoc<Student>(userDocRef);

  const leaveRequestsQuery = useMemoFirebase(() => {
    if (!firestore || teacher?.role !== 'teacher') return null;
    return query(collectionGroup(firestore, 'leaveRequests'), where('status', '==', 'pending'));
  }, [firestore, teacher?.role]);


  const {data: leaveRequests, isLoading: areRequestsLoading} = useCollection<LeaveRequest>(leaveRequestsQuery);

  const handleSelectRequest = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setAnalysisResult(null);
    startAnalysisTransition(async () => {
      try {
        const result = await generateLeaveRequestReasoning({
          studentId: request.studentId,
          leaveStartDate: request.startDate,
          leaveEndDate: request.endDate,
          reason: request.reason,
          grades: studentGrades,
          pastAttendance: attendanceHistory,
          pastLeaveRequests: pastLeaveRequests,
        });
        setAnalysisResult(result);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to run AI analysis.',
          variant: 'destructive',
        });
      }
    });
  };
  
  const getRiskColor = (score: number) => {
    if (score > 0.66) return 'border-destructive';
    if (score > 0.33) return 'border-orange-400';
    return 'border-accent';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>{leaveRequests?.length || 0} requests awaiting review.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {areRequestsLoading && <p>Loading requests...</p>}
              {!areRequestsLoading && leaveRequests && leaveRequests.length === 0 && <p className="text-muted-foreground">No pending requests.</p>}
              <div className="space-y-2">
                {leaveRequests?.map(req => (
                  <button
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-colors',
                      selectedRequest?.id === req.id ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                    )}
                  >
                    <p className="font-semibold">{req.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(req.startDate), 'MMM d, yyyy')} - {format(parseISO(req.endDate), 'MMM d, yyyy')}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className={cn('sticky top-24 border-2', analysisResult && getRiskColor(analysisResult.riskScore))}>
          <CardHeader>
            <CardTitle>AI Review & Analysis</CardTitle>
            <CardDescription>AI-generated insights on the selected leave request.</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedRequest && (
               <div className="text-center text-muted-foreground py-8">
                  <p>Select a request to see the AI analysis.</p>
              </div>
            )}
            {selectedRequest && isAnalysisPending && (
              <div className="space-y-4">
                  <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                  </div>
                <Skeleton className="h-8 w-1/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="pt-4">
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            )}
            {selectedRequest && !isAnalysisPending && !analysisResult && (
              <div className="text-center text-muted-foreground py-8">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <p>Could not load AI analysis.</p>
              </div>
            )}
            {analysisResult && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-4xl font-bold font-headline">{(analysisResult.riskScore * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <h4 className="font-semibold">AI Summary:</h4>
                  <p className="text-sm text-muted-foreground italic">"{analysisResult.summary}"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function LeaveApprovalPage() {
  const {user, isUserLoading} = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<Student>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (!isUserLoading && !isTeacherLoading && teacher && teacher.role !== 'teacher') {
        router.push('/');
    }
  }, [isUserLoading, user, isTeacherLoading, teacher, router]);
  
  const isLoading = isUserLoading || isTeacherLoading;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leave Approval</h1>
        <p className="text-muted-foreground">Review and approve student leave requests with AI assistance.</p>
      </div>
      
      {isLoading && <div>Loading access permissions...</div>}

      {!isLoading && teacher?.role !== 'teacher' && <div>You do not have permission to view this page.</div>}

      {!isLoading && teacher?.role === 'teacher' && <LeaveApprovalContent />}
    </div>
  );
}
