'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting abnormal attendance patterns and notifying teachers/parents.
 *
 * It includes:
 * - `attendanceAnomalyDetection`: Function to trigger the attendance anomaly detection flow.
 * - `AttendanceAnomalyDetectionInput`: Interface for the input to the flow (student ID).
 * - `AttendanceAnomalyDetectionOutput`: Interface for the output of the flow (analysis summary and risk score).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceAnomalyDetectionInputSchema = z.object({
  studentId: z.string().describe('The unique identifier for the student.'),
});
export type AttendanceAnomalyDetectionInput = z.infer<
  typeof AttendanceAnomalyDetectionInputSchema
>;

const AttendanceAnomalyDetectionOutputSchema = z.object({
  summary: z.string().describe('A summary of the attendance analysis.'),
  riskScore: z.number().describe('A risk score indicating the severity of the anomaly.'),
});
export type AttendanceAnomalyDetectionOutput = z.infer<
  typeof AttendanceAnomalyDetectionOutputSchema
>;

export async function attendanceAnomalyDetection(
  input: AttendanceAnomalyDetectionInput
): Promise<AttendanceAnomalyDetectionOutput> {
  return attendanceAnomalyDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'attendanceAnomalyDetectionPrompt',
  input: {schema: AttendanceAnomalyDetectionInputSchema},
  output: {schema: AttendanceAnomalyDetectionOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing student attendance records to detect anomalies.
  Given the student's ID, analyze their attendance history and identify any unusual patterns, such as frequent absences or sudden changes in attendance.
  Provide a summary of your analysis and a risk score indicating the severity of the anomaly.

  Student ID: {{{studentId}}}
  Current Date: {{currentDate}}

  Output:
  {
    "summary": "",
    "riskScore": 0.0
  }`,
});

const attendanceAnomalyDetectionFlow = ai.defineFlow(
  {
    name: 'attendanceAnomalyDetectionFlow',
    inputSchema: AttendanceAnomalyDetectionInputSchema,
    outputSchema: AttendanceAnomalyDetectionOutputSchema,
  },
  async input => {
    const currentDate = new Date().toLocaleDateString();
    const {output} = await prompt({...input, currentDate});
    return output!;
  }
);
