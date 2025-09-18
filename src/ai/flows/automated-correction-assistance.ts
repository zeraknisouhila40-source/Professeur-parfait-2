'use server';

/**
 * @fileOverview An AI agent for providing automated assistance in correcting student assignments and exams.
 *
 * - correctAssignment - A function that handles the assignment correction process.
 * - CorrectAssignmentInput - The input type for the correctAssignment function.
 * - CorrectAssignmentOutput - The return type for the correctAssignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectAssignmentInputSchema = z.object({
  studentAssignment: z
    .string()
    .describe('The text of the student assignment in French.'),
  examQuestions: z
    .string()
    .optional()
    .describe('The exam questions that were given to the students.'),
  topic: z.string().optional().describe('The topic of the assignment.'),
  level: z
    .enum(['primary', 'secondary', 'elementary'])
    .describe('The educational level of the students.'),
});
export type CorrectAssignmentInput = z.infer<typeof CorrectAssignmentInputSchema>;

const CorrectAssignmentOutputSchema = z.object({
  correctedAssignment: z
    .string()
    .describe('The corrected version of the student assignment.'),
  identifiedErrors: z
    .string()
    .describe('The common errors identified in the assignment.'),
  suggestedImprovements: z
    .string()
    .describe('The suggested improvements for the student.'),
});
export type CorrectAssignmentOutput = z.infer<typeof CorrectAssignmentOutputSchema>;

export async function correctAssignment(input: CorrectAssignmentInput): Promise<CorrectAssignmentOutput> {
  return correctAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctAssignmentPrompt',
  input: {schema: CorrectAssignmentInputSchema},
  output: {schema: CorrectAssignmentOutputSchema},
  prompt: `You are an expert French teacher specializing in identifying common errors and suggesting corrections in student assignments, following the Algerian education system.

You will use this information to correct the student's assignment, identify common errors, and suggest improvements.

Educational Level: {{{level}}}
Topic: {{{topic}}}
Exam Questions: {{{examQuestions}}}

Student Assignment:
{{{studentAssignment}}}

Corrected Assignment:
Identified Errors:
Suggested Improvements:`,
});

const correctAssignmentFlow = ai.defineFlow(
  {
    name: 'correctAssignmentFlow',
    inputSchema: CorrectAssignmentInputSchema,
    outputSchema: CorrectAssignmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
