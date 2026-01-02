'use server';

/**
 * @fileOverview AI flow to handle chat conversations with a teacher about a leave request analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LeaveRequestInput, LeaveRequestOutput } from './leave-request-ai-helper';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const LeaveRequestChatInputSchema = z.object({
  originalRequest: LeaveRequestInputSchema.describe("The student's original leave request details."),
  initialAnalysis: LeaveRequestOutputSchema.describe('The initial analysis provided by the AI.'),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  question: z.string().describe("The teacher's latest question for the AI."),
});

export type LeaveRequestChatInput = z.infer<typeof LeaveRequestChatInputSchema>;

export const LeaveRequestChatOutputSchema = z.string().describe('The AI model\'s response to the question.');
export type LeaveRequestChatOutput = z.infer<typeof LeaveRequestChatOutputSchema>;


export async function leaveRequestChat(input: LeaveRequestChatInput): Promise<LeaveRequestChatOutput> {
    return leaveRequestChatFlow(input);
}


const chatPrompt = ai.definePrompt({
    name: 'leaveRequestChatPrompt',
    input: { schema: LeaveRequestChatInputSchema },
    output: { schema: LeaveRequestChatOutputSchema },
    prompt: `You are an AI assistant helping a teacher understand your analysis of a student's leave request.
The user you are chatting with is the teacher.

Here is the original context you used for your analysis:
- Student ID: {{{originalRequest.studentId}}}
- Leave Request: {{{originalRequest.reason}}} (from {{{originalRequest.leaveStartDate}}} to {{{originalRequest.leaveEndDate}}})
- Past Attendance: {{#if originalRequest.pastAttendance}} {{json originalRequest.pastAttendance}} {{else}}None{{/if}}
- Past Leaves: {{#if originalRequest.pastLeaveRequests}} {{json originalRequest.pastLeaveRequests}} {{else}}None{{/if}}
- Grades: {{#if originalRequest.grades}} {{json originalRequest.grades}} {{else}}None{{/if}}

Here was your initial analysis:
- Summary: {{{initialAnalysis.summary}}}
- Risk Score: {{{initialAnalysis.riskScore}}}

Now, continue the conversation with the teacher based on the chat history.
Answer the teacher's latest question concisely and directly, referring back to the context you were given.
Do not repeat information unless asked. Be helpful and provide clarity on your reasoning.

Chat History:
{{#each history}}
  - {{role}}: {{content}}
{{/each}}

Teacher's new question:
{{{question}}}

Your Answer:
`,
});


const leaveRequestChatFlow = ai.defineFlow(
  {
    name: 'leaveRequestChatFlow',
    inputSchema: LeaveRequestChatInputSchema,
    outputSchema: LeaveRequestChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input);
    return output!;
  }
);
