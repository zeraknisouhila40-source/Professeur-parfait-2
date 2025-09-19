'use server';

/**
 * @fileOverview An AI agent for providing automated assistance in correcting student assignments and exams.
 *
 * - correctAssignment - A function that handles the assignment correction process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  CorrectAssignmentInputSchema,
  type CorrectAssignmentInput,
  CorrectAssignmentOutputSchema,
  type CorrectAssignmentOutput,
} from './automated-correction-assistance-types';


export async function correctAssignment(input: CorrectAssignmentInput): Promise<CorrectAssignmentOutput> {
  return correctAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctAssignmentPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {
    schema: CorrectAssignmentInputSchema.extend({
      isFrench: z.boolean(),
    }),
  },
  output: {schema: CorrectAssignmentOutputSchema},
  prompt: `You are an expert {{#if isFrench}}French{{else}}English{{/if}} teacher specializing in identifying common errors and suggesting corrections in student assignments, following the Algerian education system.

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
    const isFrench = input.language === 'fr';
    const {output} = await prompt({...input, isFrench});
    return output!;
  }
);
