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
      model: anthropic("claude-sonnet-4-6"),
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

    // Await the first chunk to catch auth/billing errors before streaming
    // The SDK throws errors lazily during streaming, so we need to
    // consume at least one chunk to surface them
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Unknown error";
          // If nothing has been sent yet, we can still write an error
          controller.enqueue(
            encoder.encode(`\n\n## ERROR\n\n${msg}`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(`Analysis failed: ${message}`, { status: 500 });
  }
}
