'use server';

/**
 * @fileOverview AI flow to generate reasoning suggestions for teacher approval of leave requests.
 *
 * - generateLeaveRequestReasoning - A function that generates reasoning suggestions for leave requests.
 * - LeaveRequestInput - The input type for the generateLeaveRequestReasoning function.
 * - LeaveRequestOutput - The return type for the generateLeaveRequestReasoning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LeaveRequestInputSchema = z.object({
  studentId: z.string().describe('The ID of the student requesting leave.'),
  leaveStartDate: z.string().describe('The start date of the leave request (YYYY-MM-DD).'),
  leaveEndDate: z.string().describe('The end date of the leave request (YYYY-MM-DD).'),
  reason: z.string().describe('The reason provided by the student for the leave request.'),
  pastLeaveRequests: z.array(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
      reason: z.string(),
      status: z.enum(['approved', 'rejected']),
    })
  ).optional().describe('Past leave requests of the student.'),
  pastAttendance: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      status: z.enum(['present', 'absent']),
    })
  ).optional().describe('Past attendance records of the student.'),
  grades: z.array(
    z.object({
      id: z.string(),
      subject: z.string(),
      grade: z.number(),
    })
  ).optional().describe('The student grades for each subject'),
});

export type LeaveRequestInput = z.infer<typeof LeaveRequestInputSchema>;

const LeaveRequestOutputSchema = z.object({
  summary: z.string().describe('A summary of the AI analysis of the leave request.'),
  riskScore: z.number().describe('A risk score (0-1) indicating the potential impact of the leave request.'),
});

export type LeaveRequestOutput = z.infer<typeof LeaveRequestOutputSchema>;

export async function generateLeaveRequestReasoning(input: LeaveRequestInput): Promise<LeaveRequestOutput> {
  return leaveRequestAIHelperFlow(input);
}

const leaveRequestPrompt = ai.definePrompt({
  name: 'leaveRequestPrompt',
  input: {schema: LeaveRequestInputSchema},
  output: {schema: LeaveRequestOutputSchema},
  prompt: `You are an AI assistant helping teachers assess student leave requests.

  Analyze the following information to generate a summary and a risk score for the leave request.

  Student ID: {{{studentId}}}
  Leave Start Date: {{{leaveStartDate}}}
  Leave End Date: {{{leaveEndDate}}}
  Reason: {{{reason}}}

  Past Leave Requests:
  {{#if pastLeaveRequests}}
    {{#each pastLeaveRequests}}
      Start Date: {{{startDate}}}, End Date: {{{endDate}}}, Reason: {{{reason}}}, Status: {{{status}}}
    {{/each}}
  {{else}}
    No past leave requests.
  {{/if}}

  Past Attendance Records:
  {{#if pastAttendance}}
    {{#each pastAttendance}}
      Date: {{{date}}}, Status: {{{status}}}
    {{/each}}
  {{else}}
    No past attendance records.
  {{/if}}

  Grades:
  {{#if grades}}
    {{#each grades}}
      Subject: {{{subject}}}, Grade: {{{grade}}}
    {{/each}}

  {{else}}
    No grades available.
  {{/if}}

  Generate a concise summary of your analysis, including any potential concerns or mitigating factors.
  Provide a risk score between 0 and 1, where 0 indicates a low-risk leave request and 1 indicates a high-risk leave request.
  Consider factors such as the student's attendance history, grades, and the reason for the leave request.
  If the reason is not compelling, their attendance is spotty, and their grades are low, the risk is higher.
  If the reason is compelling, their attendance is good, and their grades are high, the risk is lower.
  The summary should directly address concerns and mitigations based on the historical information provided.  Explain why you selected the risk score and how it aligns with student history.
  `,
});

const leaveRequestAIHelperFlow = ai.defineFlow(
  {
    name: 'leaveRequestAIHelperFlow',
    inputSchema: LeaveRequestInputSchema,
    outputSchema: LeaveRequestOutputSchema,
  },
  async input => {
    const {output} = await leaveRequestPrompt(input);
    return output!;
  }
);
