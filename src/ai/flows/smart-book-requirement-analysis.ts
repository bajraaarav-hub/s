'use server';

/**
 * @fileOverview Smart Book Requirement Analysis AI agent.
 *
 * - smartBookRequirementAnalysis - A function that handles the book requirement analysis process.
 * - SmartBookRequirementAnalysisInput - The input type for the smartBookRequirementAnalysis function.
 * - SmartBookRequirementAnalysisOutput - The return type for the smartBookRequirementAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartBookRequirementAnalysisInputSchema = z.object({
  currentBooks: z.array(z.string()).describe('The list of books currently detected in the student\'s backpack.'),
  requiredBooks: z.array(z.string()).describe('The list of books required for the current homework assignment.'),
});
export type SmartBookRequirementAnalysisInput = z.infer<typeof SmartBookRequirementAnalysisInputSchema>;

const SmartBookRequirementAnalysisOutputSchema = z.object({
  missingBooks: z.array(z.string()).describe('The list of books that are missing from the student\'s backpack.'),
  status: z.enum(['complete', 'incomplete']).describe('The status of the book requirement check.'),
  message: z.string().describe('A message indicating the missing books, if any.'),
});
export type SmartBookRequirementAnalysisOutput = z.infer<typeof SmartBookRequirementAnalysisOutputSchema>;

export async function smartBookRequirementAnalysis(input: SmartBookRequirementAnalysisInput): Promise<SmartBookRequirementAnalysisOutput> {
  return smartBookRequirementAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartBookRequirementAnalysisPrompt',
  input: {schema: SmartBookRequirementAnalysisInputSchema},
  output: {schema: SmartBookRequirementAnalysisOutputSchema},
  prompt: `You are an AI assistant helping students determine if they have all the required books for their homework.\n\nYou will be provided with a list of books currently in the student's backpack and a list of books required for the homework assignment. Your task is to compare the two lists and determine which books are missing.\n\nBased on the missing books you will determine a status. If there are missing books, the status is incomplete, otherwise complete.\n\nYou will generate an easy to read message that the student can use to quickly understand what books they are missing, if any.\n\nCurrent Books: {{currentBooks}}\nRequired Books: {{requiredBooks}}`,
});

const smartBookRequirementAnalysisFlow = ai.defineFlow(
  {
    name: 'smartBookRequirementAnalysisFlow',
    inputSchema: SmartBookRequirementAnalysisInputSchema,
    outputSchema: SmartBookRequirementAnalysisOutputSchema,
  },
  async input => {
    const missingBooks = input.requiredBooks.filter(book => !input.currentBooks.includes(book));
    const status = missingBooks.length > 0 ? 'incomplete' : 'complete';
    const message = missingBooks.length > 0 ? `You are missing: ${missingBooks.join(', ')}` : 'You have all the required books.';

    const {output} = await prompt({...input, missingBooks, status, message});
    return {
      missingBooks: missingBooks,
      status: status,
      message: message,
    };
  }
);
