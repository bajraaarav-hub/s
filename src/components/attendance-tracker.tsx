'use client';
import {attendanceAnomalyDetection, AttendanceAnomalyDetectionOutput} from '@/ai/flows/attendance-anomaly-detection';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import {useToast} from '@/hooks/use-toast';
import type {Student} from '@/lib/types';
import {AlertCircle, Check, Loader2, Sparkles, User, X} from 'lucide-react';
import {useState, useTransition} from 'react';
import {CodeBlock} from './code-block';
import {Badge} from './ui/badge';

type AttendanceStatus = 'present' | 'absent' | 'not-marked';

export function AttendanceTracker({students}: {students: Student[]}) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    students.reduce((acc, s) => ({...acc, [s.id]: 'not-marked'}), {})
  );
  const [analysisResult, setAnalysisResult] = useState<AttendanceAnomalyDetectionOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({...prev, [studentId]: status}));
    setSelectedStudentId(studentId);
    setAnalysisResult(null);
  };

  const handleAnalyze = () => {
    if (!selectedStudentId) return;

    startTransition(async () => {
      setAnalysisResult(null);
      try {
        const result = await attendanceAnomalyDetection({studentId: selectedStudentId});
        setAnalysisResult(result);
        toast({
          title: 'Analysis Complete',
          description: `Attendance pattern for ${selectedStudent?.name} has been analyzed.`,
        });
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
    if (score > 0.66) return 'text-destructive';
    if (score > 0.33) return 'text-orange-400';
    return 'text-accent';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Mark Daily Attendance</CardTitle>
          <CardDescription>Select a student to mark them as present or absent for today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {students.map(student => (
                <TableRow
                  key={student.id}
                  className={selectedStudentId === student.id ? 'bg-muted/50' : ''}
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatarUrl} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{student.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                      className={attendance[student.id] === 'present' ? 'bg-accent hover:bg-accent/90' : ''}
                      onClick={() => handleMarkAttendance(student.id, 'present')}
                    >
                      <Check className="mr-2 h-4 w-4" /> Present
                    </Button>
                    <Button
                      size="sm"
                      variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'}
                      onClick={() => handleMarkAttendance(student.id, 'absent')}
                    >
                      <X className="mr-2 h-4 w-4" /> Absent
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Anomaly Detection</CardTitle>
            <CardDescription>Analyze a student's attendance history for unusual patterns.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAnalyze} disabled={!selectedStudentId || isPending} className="w-full">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
        {isPending && (
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">AI is analyzing patterns...</p>
            </CardContent>
          </Card>
        )}
        {analysisResult && selectedStudent && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Analysis for {selectedStudent.name}</CardTitle>
              <div className="flex justify-center pt-4">
                <div className={`text-5xl font-bold ${getRiskColor(analysisResult.riskScore)}`}>
                  {(analysisResult.riskScore * 100).toFixed(0)}
                  <span className="text-xl">%</span>
                </div>
              </div>
              <CardDescription>Risk Score</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center italic">"{analysisResult.summary}"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}