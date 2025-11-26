'use client';
import {generateLeaveRequestReasoning, LeaveRequestInput, LeaveRequestOutput} from '@/ai/flows/leave-request-ai-helper';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {zodResolver} from '@hookform/resolvers/zod';
import {format} from 'date-fns';
import {AlertTriangle, CalendarIcon, Loader2, Sparkles} from 'lucide-react';
import {useState, useTransition} from 'react';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {CodeBlock} from './code-block';
import {Skeleton} from './ui/skeleton';

const formSchema = z
  .object({
    dateRange: z.object({
      from: z.date({required_error: 'A start date is required.'}),
      to: z.date().optional(),
    }),
    reason: z.string().min(10, {message: 'Reason must be at least 10 characters.'}),
  })
  .refine(data => !!data.dateRange.from, {
    message: 'Start date is required.',
    path: ['dateRange'],
  });

export function LeaveRequestHelper({
  student,
  grades,
  attendance,
  pastRequests,
}: {
  student: LeaveRequestInput['pastLeaveRequests'];
  grades: LeaveRequestInput['grades'];
  attendance: LeaveRequestInput['pastAttendance'];
  pastRequests: LeaveRequestInput['pastLeaveRequests'];
}) {
  const [analysisResult, setAnalysisResult] = useState<LeaveRequestOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: '',
      dateRange: {
        from: undefined,
        to: undefined,
      },
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setAnalysisResult(null);
      try {
        const result = await generateLeaveRequestReasoning({
          studentId: 'student-01', // Mocked as per data
          leaveStartDate: format(values.dateRange.from, 'yyyy-MM-dd'),
          leaveEndDate: format(values.dateRange.to || values.dateRange.from, 'yyyy-MM-dd'),
          reason: values.reason,
          grades,
          pastAttendance: attendance,
          pastLeaveRequests: pastRequests,
        });
        setAnalysisResult(result);
        toast({
          title: 'Request Sent for Analysis',
          description: 'The AI is reviewing your leave request.',
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
  }

  const getRiskColor = (score: number) => {
    if (score > 0.66) return 'border-destructive';
    if (score > 0.33) return 'border-orange-400';
    return 'border-accent';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Leave Request</CardTitle>
          <CardDescription>Fill out the form below to request time off.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="dateRange"
                render={({field}) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Leave Dates</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value?.from && 'text-muted-foreground')}
                          >
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, 'LLL dd, y')} - {format(field.value.to, 'LLL dd, y')}
                                </>
                              ) : (
                                format(field.value.from, 'LLL dd, y')
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Reason for Leave</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Please provide a detailed reason for your absence..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Submit for AI Review
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className={cn('sticky top-24', analysisResult && getRiskColor(analysisResult.riskScore), 'border-2')}>
        <CardHeader>
          <CardTitle>For Teacher's Review</CardTitle>
          <CardDescription>AI-generated insights on this leave request.</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-4">
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          )}
          {!isPending && !analysisResult && (
            <div className="text-center text-muted-foreground py-8">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p>Submit a request to see the AI analysis.</p>
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
  );
}
