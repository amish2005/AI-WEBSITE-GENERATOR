import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support two payload shapes:
    // 1) { messages: [...] } -> forwarded as-is (existing behavior)
    // 2) { userInput: string, existingCode?: string, replaceMode?: boolean } -> server will build an edit-system instruction

    let messages = body?.messages;

    if (!messages && body?.userInput) {
      const userInput = body.userInput as string;
      const existingCode = body.existingCode as string | undefined;
      const replaceMode = Boolean(body.replaceMode);

      if (existingCode) {
        // Build explicit edit instruction to encourage the model to modify existing HTML
        const editSystem = `You are an expert assistant that edits HTML/CSS based on user requests. The previous HTML code is included below inside triple backticks as an assistant message. Given the user's instruction, produce the complete, updated HTML (only the body content) and wrap it in \`\`\`html ... \`\`\`. Do NOT include any explanation or commentary. Do NOT append duplicate sections; modify the existing structure in-place.`;

        messages = [
          { role: 'system', content: editSystem },
          // include the user message itself so the model sees the desired change
          { role: 'user', content: userInput },
          // include existing code as assistant content
          { role: 'assistant', content: '```html\n' + existingCode.replace(/^```+\w*\n?/, '') + '\n```' },
        ];
      } else {
        // fresh generation
        const system = body?.system ?? `userInput: {userInput}\n\nInstructions: Generate full responsive HTML body based on userInput.`;
        messages = [
          { role: 'system', content: system.replace('{userInput}', userInput) },
          { role: 'user', content: userInput },
        ];
      }
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "xiaomi/mimo-v2-flash:free",
        messages,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "My Next.js App",
        },
        responseType: "stream",
      }
    );

    const nodeStream = response.data;
    const encoder = new TextEncoder();

    let isClosed = false;

    const readable = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer) => {
          if (isClosed) return;

          const lines = chunk.toString().split("\n");

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const payload = line.replace("data:", "").trim();

            if (payload === "[DONE]") {
              isClosed = true;
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(payload);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text && !isClosed) {
                controller.enqueue(encoder.encode(text));
              }
            } catch {
              // ignore malformed chunks
            }
          }
        });

        nodeStream.on("end", () => {
          if (!isClosed) {
            isClosed = true;
            controller.close();
          }
        });

        nodeStream.on("error", (err: any) => {
          if (!isClosed) {
            isClosed = true;
            controller.error(err);
          }
        });
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
