import {z} from 'genkit';

export const AiAssistedLessonPlanningInputSchema = z.object({
  topic: z.string().describe('The topic of the lesson plan.'),
  numberOfClassMeetings: z
    .number()
    .describe('The desired number of class meetings for the lesson plan.'),
  prerequisiteKnowledge: z
    .string()
    .optional()
    .describe(
      "The students' existing knowledge and skills related to the topic."
    ),
  level: z.string().describe("The educational level (e.g., 'middle', 'secondary')."),
  year: z.string().describe("The year within the educational level (e.g., '1st year')."),
  trimester: z.string().describe("The trimester (e.g., '1st trimester')."),
  language: z.enum(['en', 'fr']).describe('The language for the lesson plan.'),
});
export type AiAssistedLessonPlanningInput = z.infer<
  typeof AiAssistedLessonPlanningInputSchema
>;

export const AiAssistedLessonPlanningOutputSchema = z.object({
  lessonPlan: z
    .string()
    .describe(
      'A detailed lesson plan including objectives, activities, and assessments, formatted in Markdown.'
    ),
});
export type AiAssistedLessonPlanningOutput = z.infer<
  typeof AiAssistedLessonPlanningOutputSchema
>;
