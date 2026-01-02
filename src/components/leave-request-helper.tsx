'use client';
import {addDocumentNonBlocking} from '@/firebase';
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
import {CalendarIcon, Loader2, Sparkles} from 'lucide-react';
import {useTransition} from 'react';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {Student} from '@/lib/types';
import {useFirestore, useUser} from '@/firebase';
import {collection} from 'firebase/firestore';

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
}: {
  student: Student;
}) {
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();
  const firestore = useFirestore();
  const {user} = useUser();

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
    if (!firestore || !user) return;

    startTransition(async () => {
      try {
        const leaveRequestsCol = collection(firestore, 'users', user.uid, 'leaveRequests');
        await addDocumentNonBlocking(leaveRequestsCol, {
          studentId: student.id,
          studentName: student.name,
          startDate: format(values.dateRange.from, 'yyyy-MM-dd'),
          endDate: format(values.dateRange.to || values.dateRange.from, 'yyyy-MM-dd'),
          reason: values.reason,
          status: 'pending',
        });

        toast({
          title: 'Request Submitted',
          description: 'Your leave request has been sent for review.',
        });
        form.reset();
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to submit leave request.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div>
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
                Submit Request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
