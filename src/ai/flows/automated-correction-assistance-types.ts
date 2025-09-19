import {z} from 'genkit';

export const CorrectAssignmentInputSchema = z.object({
  studentAssignment: z
    .string()
    .optional()
    .describe('The text of the student assignment.'),
  studentAssignmentImage: z
    .string()
    .optional()
    .describe(
      "An image of the student's assignment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  examQuestions: z
    .string()
    .optional()
    .describe('The exam questions that were given to the students.'),
  topic: z.string().optional().describe('The topic of the assignment.'),
  level: z.string().describe('The educational level of the students.'),
  language: z.enum(['en', 'fr']).describe('The language of the assignment.'),
});
export type CorrectAssignmentInput = z.infer<
  typeof CorrectAssignmentInputSchema
>;

export const CorrectAssignmentOutputSchema = z.object({
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
export type CorrectAssignmentOutput = z.infer<
  typeof CorrectAssignmentOutputSchema
>;
