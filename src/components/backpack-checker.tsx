'use client';

import {smartBookRequirementAnalysis, SmartBookRequirementAnalysisOutput} from '@/ai/flows/smart-book-requirement-analysis';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useToast} from '@/hooks/use-toast';
import type {Homework, Student} from '@/lib/types';
import {CheckCircle2, CircleDashed, ListTodo, Loader2, Package, Sparkles, XCircle} from 'lucide-react';
import {useState, useTransition} from 'react';
import {Badge} from './ui/badge';
import {Progress} from './ui/progress';
import {CodeBlock} from './code-block';

export function BackpackChecker({
  student,
  allHomework,
  initialBackpackContents,
}: {
  student: Student;
  allHomework: Homework[];
  initialBackpackContents: string[];
}) {
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string>(allHomework[0].id);
  const [analysisResult, setAnalysisResult] = useState<SmartBookRequirementAnalysisOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();

  const [currentPoints, setCurrentPoints] = useState(student.points);
  const [currentStreak, setCurrentStreak] = useState(student.streak);

  const selectedHomework = allHomework.find(h => h.id === selectedHomeworkId)!;

  const handleCheckBooks = () => {
    startTransition(async () => {
      setAnalysisResult(null);
      try {
        const result = await smartBookRequirementAnalysis({
          currentBooks: initialBackpackContents,
          requiredBooks: selectedHomework.requiredBooks,
        });
        setAnalysisResult(result);

        if (result.status === 'complete') {
          setCurrentPoints(prev => prev + 10);
          setCurrentStreak(prev => prev + 1);
          toast({
            title: 'Great job!',
            description: 'You earned 10 points & increased your streak.',
            variant: 'default',
          });
        } else {
          setCurrentStreak(0);
          toast({
            title: 'Missing books!',
            description: 'Your streak has been reset to 0.',
            variant: 'destructive',
          });
        }
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

  const getStatusIcon = () => {
    if (!analysisResult) return <CircleDashed className="h-12 w-12 text-muted-foreground" />;
    if (analysisResult.status === 'complete') return <CheckCircle2 className="h-12 w-12 text-accent" />;
    return <XCircle className="h-12 w-12 text-destructive" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Select Homework</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedHomeworkId} defaultValue={selectedHomeworkId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a homework assignment" />
              </SelectTrigger>
              <SelectContent>
                {allHomework.map(hw => (
                  <SelectItem key={hw.id} value={hw.id}>
                    {hw.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="text-primary" />
                Your Backpack
              </CardTitle>
              <CardDescription>Simulated RFID scan of your bag.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {initialBackpackContents.map(book => (
                  <li key={book} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span>{book}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="text-primary" />
                Required Books
              </CardTitle>
              <CardDescription>Books needed for the selected homework.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedHomework.requiredBooks.map(book => (
                  <li key={book} className="flex items-center gap-2">
                    <span className="font-medium text-primary">*</span>
                    <span>{book}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Button onClick={handleCheckBooks} disabled={isPending} className="w-full">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Check Books with AI
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Result</CardTitle>
            <CardDescription>Your book check status.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">{getStatusIcon()}</div>
            {analysisResult ? (
              <div>
                <Badge variant={analysisResult.status === 'complete' ? 'default' : 'destructive'} className="capitalize bg-accent text-accent-foreground">
                  {analysisResult.status}
                </Badge>
                <p className="mt-2 text-muted-foreground">{analysisResult.message}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Click the button to run the analysis.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Points</span>
              <span className="font-bold text-primary">{currentPoints}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Streak</span>
              <span className="font-bold text-primary">{currentStreak} days</span>
            </div>
            <Progress value={(currentStreak / 30) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">Complete daily checks to extend your streak!</p>
          </CardContent>
        </Card>
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle>AI Output</CardTitle>
              <CardDescription>The raw JSON output from the AI model.</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={JSON.stringify(analysisResult, null, 2)} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
