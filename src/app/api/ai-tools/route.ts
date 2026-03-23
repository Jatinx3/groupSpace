import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../lib/supabase-server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_BASE_PROMPT = `You are a helpful academic assistant.
* Keep responses under 120 words
* Do not explain anything
* Output only the final result
* Write clearly and naturally`;

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tool, input, tone } = await req.json();

    if (!tool || !input || typeof input !== "string") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const maxChars = tool === "prompt" ? 400 : 500;
    if (input.length > maxChars) {
      return NextResponse.json({ error: `Input exceeds ${maxChars} characters limit` }, { status: 400 });
    }

    // --- 1. Daily Limit Verification ---
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { data: usageData } = await supabase
      .from("ai_usages")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (usageData && usageData.last_used_at === today && usageData.usage_count >= 20) {
      return NextResponse.json(
        { error: "Daily limit of 20 uses reached. Try again tomorrow!" }, 
        { status: 429 }
      );
    }

    let systemPrompt = "";
    if (tool === "prompt") {
      systemPrompt = `You are an expert prompt writer.
Generate a high-quality prompt based on the user's idea.

Rules:
* Do not explain anything
* Output only the final prompt
* Keep it clean and structured
* Adjust detail level based on type:
  short → minimal
  brief → moderate detail
  descriptive → rich detail

Type: ${tone || 'short'}`;
    } else if (tool === "email") {
      systemPrompt = `${SYSTEM_BASE_PROMPT}\n\nWrite a professional academic email based on the request. Include subject line. ${tone ? `Tone: ${tone}` : ""}`;
    } else if (tool === "paraphrase") {
      systemPrompt = `${SYSTEM_BASE_PROMPT}\n\nParaphrase the text while preserving meaning. Keep it clear and concise.`;
    } else if (tool === "grammar") {
      systemPrompt = `${SYSTEM_BASE_PROMPT}\n\nFix grammar and improve clarity without changing meaning.`;
    }

    const incrementUsage = async () => {
      const currentCount = (usageData && usageData.last_used_at === today) ? usageData.usage_count + 1 : 1;
      await supabase
        .from("ai_usages")
        .upsert({
          user_id: user.id,
          usage_count: currentCount,
          last_used_at: today
        });
    };

    // fallback cascade: Gemini -> Groq -> error
    // --- 1. Try Gemini (Primary No-billing) ---
    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nInput: ${input}` }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            await incrementUsage();
            return NextResponse.json({ result: data.candidates[0].content.parts[0].text });
          }
        }
      } catch (err) {
        console.error("Gemini fallback failed:", err);
      }
    }

    // --- 2. Try Groq (Secondary) ---
    if (GROQ_API_KEY) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input }
            ],
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            await incrementUsage();
            return NextResponse.json({ result: data.choices[0].message.content });
          }
        }
      } catch (err) {
        console.error("Groq fallback failed:", err);
      }
    }

    return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 500 });

  } catch (error: any) {
    console.error("AI Tools API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
