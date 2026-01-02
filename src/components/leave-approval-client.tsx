'use client';
import { useState, useTransition } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LeaveRequest, Student, PastLeaveRequest, Grade, AttendanceRecord } from '@/lib/types';
import { Loader2, Sparkles } from 'lucide-react';
import { generateLeaveRequestReasoning, LeaveRequestInput, LeaveRequestOutput } from '@/ai/flows/leave-request-ai-helper';
import { useCollection, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';

function AIAnalysisCard({ analysis, isLoading }: { analysis: LeaveRequestOutput | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Generating insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const riskColor = analysis.riskScore > 0.7 ? 'text-destructive' : analysis.riskScore > 0.4 ? 'text-yellow-500' : 'text-accent';

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Risk Score</p>
          <p className={`text-2xl font-bold ${riskColor}`}>
            {Math.round(analysis.riskScore * 100)}%
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Summary</p>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaveRequestItem({ request, onStatusChange }: { request: LeaveRequest, onStatusChange: (id: string, status: 'approved' | 'rejected') => void; }) {
  const [isAiPending, startAiTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<LeaveRequestOutput | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const studentDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', request.studentId) : null, [firestore, request.studentId]);
  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

  const pastLeaveQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users', request.studentId, 'leaveRequests')) : null, [firestore, request.studentId]);
  const { data: pastLeaveRequests, isLoading: arePastLeavesLoading } = useCollection<LeaveRequest>(pastLeaveQuery);

  const gradesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users', request.studentId, 'grades')) : null, [firestore, request.studentId]);
  const { data: grades, isLoading: areGradesLoading } = useCollection<Grade>(gradesQuery);

  const attendanceQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users', request.studentId, 'attendance')) : null, [firestore, request.studentId]);
  const { data: attendance, isLoading: isAttendanceLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const isLoadingDetails = isStudentLoading || arePastLeavesLoading || areGradesLoading || isAttendanceLoading;

  const handleReview = () => {
    startAiTransition(async () => {
        if (isLoadingDetails) return;
        
        const historicalLeaves = (pastLeaveRequests || [])
            .filter((req): req is PastLeaveRequest => req.id !== request.id && req.status !== 'pending');

        const analysisInput: LeaveRequestInput = {
            studentId: request.studentId,
            leaveStartDate: request.startDate,
            leaveEndDate: request.endDate,
            reason: request.reason,
            pastLeaveRequests: historicalLeaves,
            pastAttendance: attendance || [],
            grades: grades || [],
        };
        
        try {
            const result = await generateLeaveRequestReasoning(analysisInput);
            setAnalysisResult(result);
        } catch (error) {
            console.error("AI Analysis failed:", error);
            toast({
            title: 'AI Analysis Failed',
            description: 'Could not generate AI insights for this request.',
            variant: 'destructive',
            });
        }
    });
  };
  
  const handleStatusUpdate = (status: 'approved' | 'rejected') => {
      if (!firestore) return;
      const requestRef = doc(firestore, 'users', request.studentId, 'leaveRequests', request.id);
      updateDocumentNonBlocking(requestRef, { status });
      onStatusChange(request.id, status);
      toast({
          title: `Request ${status}`,
          description: `The leave request from ${request.studentName} has been ${status}.`
      })
  }

  return (
    <AccordionItem value={request.id}>
      <AccordionTrigger>
        <div className="flex justify-between items-center w-full pr-4">
            <div className='text-left'>
                <p className="font-semibold">{request.studentName}</p>
                <p className="text-sm text-muted-foreground">
                    {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                </p>
            </div>
            <Badge variant="outline">{request.status}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <div>
          <p className="font-medium text-sm">Reason Provided:</p>
          <p className="text-muted-foreground text-sm">{request.reason}</p>
        </div>

        {analysisResult ? (
          <AIAnalysisCard analysis={analysisResult} isLoading={isAiPending} />
        ) : (
            <Button onClick={handleReview} disabled={isAiPending || isLoadingDetails}>
                {isAiPending || isLoadingDetails ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isLoadingDetails ? 'Loading Student Data...' : 'Review with AI'}
            </Button>
        )}
        
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => handleStatusUpdate('rejected')}>Reject</Button>
          <Button onClick={() => handleStatusUpdate('approved')}>Approve</Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}


export function LeaveApprovalClient({ pendingRequests }: { pendingRequests: LeaveRequest[] }) {
    const [requests, setRequests] = useState(pendingRequests);

    const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
        setRequests(prev => prev.filter(req => req.id !== id));
    }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No pending leave requests.
        </CardContent>
      </Card>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {requests.map(request => (
        <LeaveRequestItem key={request.id} request={request} onStatusChange={handleStatusChange} />
      ))}
    </Accordion>
  );
}
