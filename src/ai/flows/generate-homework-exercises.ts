'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating tailored homework exercises for French language teachers in Algeria.
 *
 * It includes:
 * - generateHomeworkExercises: The main function to generate homework exercises.
 * - GenerateHomeworkExercisesInput: The input type for the generateHomeworkExercises function.
 * - GenerateHomeworkExercisesOutput: The output type for the generateHomeworkExercises function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHomeworkExercisesInputSchema = z.object({
  topic: z.string().describe('The specific topic covered in class for which homework is needed.'),
  skillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The skill level of the students for whom the homework is intended.'),
  educationalStage:
    z.enum(['primary', 'middle', 'secondary']).describe('The educational stage for the homework exercises.'),
  quantity: z.number().min(1).max(10).default(3).describe('The desired number of homework exercises.'),
  curriculumGuidelines: z
    .string()
    .default('Algerian Ministry of Education French curriculum guidelines')
    .describe('The curriculum guidelines to align the homework with.'),
});
export type GenerateHomeworkExercisesInput = z.infer<typeof GenerateHomeworkExercisesInputSchema>;

const GenerateHomeworkExercisesOutputSchema = z.object({
  exercises: z.array(z.string()).describe('An array of homework exercises tailored to the specified topic and skill level.'),
});
export type GenerateHomeworkExercisesOutput = z.infer<typeof GenerateHomeworkExercisesOutputSchema>;

export async function generateHomeworkExercises(input: GenerateHomeworkExercisesInput): Promise<GenerateHomeworkExercisesOutput> {
  return generateHomeworkExercisesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHomeworkExercisesPrompt',
  input: {schema: GenerateHomeworkExercisesInputSchema},
  output: {schema: GenerateHomeworkExercisesOutputSchema},
  prompt: `You are an AI assistant designed to help French teachers in Algeria create homework exercises.

  Generate {{quantity}} homework exercises for the topic: {{topic}}.
  The exercises should be appropriate for students with a {{skillLevel}} skill level and at the {{educationalStage}} educational stage.
  Align the exercises with the following curriculum guidelines: {{curriculumGuidelines}}.

  Ensure that each exercise is clear, concise, and directly related to the specified topic and skill level.
  Each exercise should be something a teacher could give to a student as homework.
  Return the homework exercises as a numbered list. 

  Exercises:
`,
});

const generateHomeworkExercisesFlow = ai.defineFlow(
  {
    name: 'generateHomeworkExercisesFlow',
    inputSchema: GenerateHomeworkExercisesInputSchema,
    outputSchema: GenerateHomeworkExercisesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
