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

Votre tâche est de corriger le devoir de l'élève, d'identifier les erreurs courantes et de suggérer des améliorations, en vous basant sur les informations fournies.

**Contexte Éducatif :**
*   **Langue :** Français
*   **Niveau :** {{level}}
{{#if topic}}
*   **Sujet :** {{{topic}}}
{{/if}}
{{#if examQuestions}}
*   **Questions de l'examen :** {{{examQuestions}}}
{{/if}}

**Devoir de l'élève :**
{{#if studentAssignmentImage}}
L'élève a fourni une image de son devoir.
{{media url=studentAssignmentImage}}
{{else}}
{{{studentAssignment}}}
{{/if}}

**Instructions pour la sortie :**
1.  **Devoir corrigé :** Fournissez une version corrigée du devoir de l'élève.
2.  **Erreurs identifiées :** Listez les erreurs clés trouvées dans le devoir (grammaire, orthographe, etc.).
3.  **Améliorations suggérées :** Proposez des conseils constructifs pour aider l'élève à s'améliorer.

{{else}}
You are an expert English teacher specializing in identifying common errors and suggesting corrections in student assignments, following the Algerian education system.

Your task is to correct the student's assignment, identify common errors, and suggest improvements based on the provided information.

**Educational Context:**
*   **Language:** English
*   **Level:** {{{level}}}
{{#if topic}}
*   **Topic:** {{{topic}}}
{{/if}}
{{#if examQuestions}}
*   **Exam Questions:** {{{examQuestions}}}
{{/if}}

**Student's Assignment:**
{{#if studentAssignmentImage}}
The student has provided an image of their assignment.
{{media url=studentAssignmentImage}}
{{else}}
{{{studentAssignment}}}
{{/if}}

**Output Instructions:**
1.  **Corrected Assignment:** Provide a corrected version of the student's assignment.
2.  **Identified Errors:** List the key errors found in the assignment (grammar, spelling, etc.).
3.  **Suggested Improvements:** Offer constructive tips to help the student improve.
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
    const {output} = await prompt({...input, isFrench});
    return output!;
  }
);
