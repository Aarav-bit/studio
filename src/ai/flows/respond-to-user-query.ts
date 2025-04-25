'use server';
/**
 * @fileOverview Responds to a user query using a Large Language Model (LLM).
 *
 * - respondToUserQuery - A function that takes user input and returns an AI-generated response.
 * - RespondToUserQueryInput - The input type for the respondToUserQuery function.
 * - RespondToUserQueryOutput - The return type for the respondToUserQuery function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RespondToUserQueryInputSchema = z.object({
  message: z.string().describe('The user message to respond to.'),
});
export type RespondToUserQueryInput = z.infer<typeof RespondToUserQueryInputSchema>;

const RespondToUserQueryOutputSchema = z.object({
  response: z.string().describe('The AI response to the user message.'),
});
export type RespondToUserQueryOutput = z.infer<typeof RespondToUserQueryOutputSchema>;

export async function respondToUserQuery(input: RespondToUserQueryInput): Promise<RespondToUserQueryOutput> {
  return respondToUserQueryFlow(input);
}

const respondToUserQueryPrompt = ai.definePrompt({
  name: 'respondToUserQueryPrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The user message to respond to.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The AI response to the user message.'),
    }),
  },
  prompt: `You are a helpful AI assistant named Zephyr. Respond to the following user message:

User Message: {{{message}}}

If the user asks who created you, respond with: "I was created by Aarav Srivastava. You can find more about him on Instagram: honestly_aarav13."`,
});

const respondToUserQueryFlow = ai.defineFlow<
  typeof RespondToUserQueryInputSchema,
  typeof RespondToUserQueryOutputSchema
>({
  name: 'respondToUserQueryFlow',
  inputSchema: RespondToUserQueryInputSchema,
  outputSchema: RespondToUserQueryOutputSchema,
}, async input => {
  const {output} = await respondToUserQueryPrompt(input);
  return output!;
});
