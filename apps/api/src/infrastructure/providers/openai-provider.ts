import { generatedWorkoutPlanSchema } from "@m-move-app/validators";
import OpenAI from "openai";

import type {
  ChatMessage,
  GeneratedWorkoutDay,
  GeneratedWorkoutPlan,
  GeneratedWorkoutPlanParams,
  OpenAIChatProvider,
  OpenAIInsightsProvider,
  OpenAIPlanProvider,
} from "../../domain/ai/providers/openai-provider.interface.js";
import { env } from "../../lib/env.js";

function getClient(): OpenAI | null {
  const key = env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export class OpenAIPlanProviderImpl
  implements OpenAIPlanProvider, OpenAIChatProvider, OpenAIInsightsProvider
{
  async generateWorkoutPlan(
    params: GeneratedWorkoutPlanParams,
  ): Promise<GeneratedWorkoutPlan> {
    const client = getClient();
    if (!client) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert fitness coach. Generate a structured workout plan as JSON.
Return ONLY valid JSON matching this structure (no markdown, no code block):
{
  "name": "string",
  "description": "string or null",
  "days": [
    {
      "name": "string",
      "isRest": boolean,
      "weekDay": "MONDAY"|"TUESDAY"|"WEDNESDAY"|"THURSDAY"|"FRIDAY"|"SATURDAY"|"SUNDAY",
      "estimatedDurationInSeconds": number or null,
      "exercises": [
        {
          "name": "string",
          "order": number,
          "sets": number,
          "reps": number,
          "restTimeInSeconds": number,
          "description": "string or null",
          "notes": "string or null"
        }
      ]
    }
  ]
}
Use weekDay from the list. Rest days can have empty exercises array.`;

    const userPrompt = `Create a workout plan with:
- Objective: ${params.objective}
- Level: ${params.level}
- Days per week: ${params.daysPerWeek}
${params.equipment?.length ? `- Equipment: ${params.equipment.join(", ")}` : ""}
${params.restrictions ? `- Restrictions: ${params.restrictions}` : ""}
Return only the JSON object.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    const parsed = JSON.parse(content) as unknown;
    const validated = generatedWorkoutPlanSchema.parse(parsed) as {
      name: string;
      description: string | null;
      days: Array<{
        name: string;
        isRest: boolean;
        weekDay:
          | "MONDAY"
          | "TUESDAY"
          | "WEDNESDAY"
          | "THURSDAY"
          | "FRIDAY"
          | "SATURDAY"
          | "SUNDAY";
        estimatedDurationInSeconds?: number | null;
        exercises: Array<{
          name: string;
          order: number;
          sets: number;
          reps: number;
          restTimeInSeconds: number;
          description?: string | null;
          notes?: string | null;
        }>;
      }>;
    };

    return {
      name: validated.name,
      description: validated.description,
      days: validated.days.map(
        (d): GeneratedWorkoutDay => ({
          name: d.name,
          isRest: d.isRest,
          weekDay: d.weekDay,
          estimatedDurationInSeconds: d.estimatedDurationInSeconds ?? null,
          exercises: d.exercises.map((e) => ({
            name: e.name,
            order: e.order,
            sets: e.sets,
            reps: e.reps,
            restTimeInSeconds: e.restTimeInSeconds,
            description: e.description ?? null,
            notes: e.notes ?? null,
          })),
        }),
      ),
    };
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const client = getClient();
    if (!client) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const content = completion.choices[0]?.message?.content;
    return content ?? "";
  }

  async getInsights(userId: string): Promise<string> {
    const client = getClient();
    if (!client) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a fitness coach. Provide brief progress insights and recommendations based on the user data.",
        },
        {
          role: "user",
          content: `User ID: ${userId}. No session or assessment data provided yet. Give a short generic motivational message and suggest logging workouts.`,
        },
      ],
    });
    return completion.choices[0]?.message?.content ?? "";
  }
}
