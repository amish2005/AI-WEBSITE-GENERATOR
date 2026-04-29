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
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        model: "gemini-2.5-flash",
        messages,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    const nodeStream = response.data;
    const encoder = new TextEncoder();

    let isClosed = false;
    let buffer = "";

    const readable = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer) => {
          if (isClosed) return;

          buffer += chunk.toString();
          const lines = buffer.split("\n");
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith("data:")) continue;

            const payload = trimmedLine.replace("data:", "").trim();

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
