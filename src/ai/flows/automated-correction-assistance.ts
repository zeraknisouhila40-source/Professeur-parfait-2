'use server';

/**
 * @fileOverview An AI agent for providing automated assistance in correcting student assignments and exams.
 *
 * - correctAssignment - A function that handles the assignment correction process.
 */

import {ai} from '@/ai/genkit';
import type {
  CorrectAssignmentInput,
  CorrectAssignmentOutput,
} from './automated-correction-assistance-types';
import {
  CorrectAssignmentInputSchema,
  CorrectAssignmentOutputSchema,
} from './automated-correction-assistance-types';

export async function correctAssignment(
  input: CorrectAssignmentInput
): Promise<CorrectAssignmentOutput> {
  return correctAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctAssignmentPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {
    schema: CorrectAssignmentInputSchema,
  },
  output: {schema: CorrectAssignmentOutputSchema},
  prompt: `{{#if isFrench}}
Vous êtes un enseignant expert en langue française, spécialisé dans l'identification des erreurs courantes et la suggestion de corrections dans les devoirs des élèves, conformément au système éducatif algérien.

Vous utiliserez ces informations pour corriger le devoir de l'élève, identifier les erreurs courantes et suggérer des améliorations.

Niveau d'éducation : {{{level}}}
Sujet : {{{topic}}}
Questions de l'examen : {{{examQuestions}}}

{{#if studentAssignmentImage}}
Devoir de l'élève (Image) :
{{media url=studentAssignmentImage}}
{{else}}
Devoir de l'élève (Texte) :
{{{studentAssignment}}}
{{/if}}

Devoir corrigé :
Erreurs identifiées :
Améliorations suggérées :

{{else}}
You are an expert English teacher specializing in identifying common errors and suggesting corrections in student assignments, following the Algerian education system.

You will use this information to correct the student's assignment, identify common errors, and suggest improvements.

Educational Level: {{{level}}}
Topic: {{{topic}}}
Exam Questions: {{{examQuestions}}}

{{#if studentAssignmentImage}}
Student Assignment (Image):
{{media url=studentAssignmentImage}}
{{else}}
Student Assignment (Text):
{{{studentAssignment}}}
{{/if}}

Corrected Assignment:
Identified Errors:
Suggested Improvements:
{{/if}}`,
});

const correctAssignmentFlow = ai.defineFlow(
  {
    name: 'correctAssignmentFlow',
    inputSchema: CorrectAssignmentInputSchema,
    outputSchema: CorrectAssignmentOutputSchema,
  },
  async (input) => {
    const isFrench = input.language === 'fr';
    const {output} = await prompt(input, {isFrench});
    return output!;
  }
);
