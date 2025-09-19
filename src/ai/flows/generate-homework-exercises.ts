'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating tailored homework exercises for English language teachers in Algeria.
 *
 * It includes:
 * - generateHomeworkExercises: The main function to generate homework exercises.
 */

import {ai} from '@/ai/genkit';
import type {
  GenerateHomeworkExercisesInput,
  GenerateHomeworkExercisesOutput,
} from './generate-homework-exercises-types';
import {
  GenerateHomeworkExercisesInputSchema,
  GenerateHomeworkExercisesOutputSchema,
} from './generate-homework-exercises-types';

export async function generateHomeworkExercises(
  input: GenerateHomeworkExercisesInput
): Promise<GenerateHomeworkExercisesOutput> {
  return generateHomeworkExercisesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHomeworkExercisesPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {
    schema: GenerateHomeworkExercisesInputSchema,
  },
  output: {schema: GenerateHomeworkExercisesOutputSchema},
  prompt: `{{#if isFrench}}
Vous êtes un assistant IA conçu pour aider les professeurs de français en Algérie à créer des exercices de devoirs conformément au système éducatif algérien.

Générez {{quantity}} exercices de devoirs pour le sujet : {{topic}}.
Les exercices doivent être appropriés pour des élèves du niveau {{level}}, dans leur {{year}}, pendant le {{trimester}}.
Les exercices doivent être adaptés au niveau de compétence {{skillLevel}} des élèves.
Alignez les exercices sur les directives du programme suivantes : {{curriculumGuidelines}}.

Assurez-vous que chaque exercice est clair, concis et directement lié au sujet et au niveau de compétence spécifiés.
Chaque exercice doit être quelque chose qu'un enseignant pourrait donner à un élève comme devoir.
Retournez les exercices de devoirs sous forme de liste numérotée.

Exercices :

{{else}}
You are an AI assistant designed to help English teachers in Algeria create homework exercises according to the Algerian education system.

Generate {{quantity}} homework exercises for the topic: {{topic}}.
The exercises should be appropriate for students at the {{level}} level, in their {{year}}, during the {{trimester}}.
The exercises should be appropriate for students with a {{skillLevel}} skill level.
Align the exercises with the following curriculum guidelines: {{curriculumGuidelines}}.

Ensure that each exercise is clear, concise, and directly related to the specified topic and skill level.
Each exercise should be something a teacher could give to a student as homework.
Return the homework exercises as a numbered list. 

Exercises:
{{/if}}
`,
});

const generateHomeworkExercisesFlow = ai.defineFlow(
  {
    name: 'generateHomeworkExercisesFlow',
    inputSchema: GenerateHomeworkExercisesInputSchema,
    outputSchema: GenerateHomeworkExercisesOutputSchema,
  },
  async (input) => {
    const isFrench = input.language === 'fr';
    const {output} = await prompt(input, {isFrench});
    return output!;
  }
);
