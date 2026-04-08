import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPT, USER_PROMPT } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("ANTHROPIC_API_KEY is not set", { status: 500 });
  }

  try {
    const { image, mimeType } = await req.json();

    if (!image || !mimeType) {
      return new Response("Missing image or mimeType in request body", {
        status: 400,
      });
    }

    const dataUrl = `data:${mimeType};base64,${image}`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-5-20250514"),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: dataUrl,
            },
            {
              type: "text",
              text: USER_PROMPT,
            },
          ],
        },
      ],
    });

    // Use the SDK's built-in text stream response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(`Analysis failed: ${message}`, { status: 500 });
  }
}
