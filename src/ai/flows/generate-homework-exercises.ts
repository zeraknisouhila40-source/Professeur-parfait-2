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

**Tâche :** Générer **{{quantity}}** exercices de devoirs sur le sujet : **"{{topic}}"**.

**Contexte Éducatif :**
*   **Langue :** Français
*   **Niveau :** {{level}}
*   **Année :** {{year}}
*   **Trimestre :** {{trimester}}
*   **Niveau de Compétence :** {{skillLevel}}
*   **Directives du Programme :** Les exercices doivent être strictement conformes aux directives du programme du Ministère de l'Éducation Nationale algérien.

**Instructions :**
1.  Chaque exercice doit être clair, concis et directement lié au sujet et au niveau de compétence spécifiés.
2.  Les exercices doivent être pratiques et prêts à être donnés aux élèves comme devoirs.
3.  Le résultat doit être une liste d'exercices.

{{else}}
You are an AI assistant designed to help English teachers in Algeria create homework exercises according to the Algerian education system.

**Task:** Generate **{{quantity}}** homework exercises for the topic: **"{{topic}}"**.

**Educational Context:**
*   **Language:** English
*   **Level:** {{level}}
*   **Year:** {{year}}
*   **Trimester:** {{trimester}}
*   **Skill Level:** {{skillLevel}}
*   **Curriculum Guidelines:** The exercises must strictly align with the Algerian Ministry of Education curriculum guidelines.

**Instructions:**
1.  Ensure each exercise is clear, concise, and directly related to the specified topic and skill level.
2.  The exercises should be practical and ready to be given to students as homework.
3.  The output should be a list of exercises.
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
    const {output} = await prompt({...input, isFrench});
    return output!;
  }
);
