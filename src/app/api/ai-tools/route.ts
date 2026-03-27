import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../lib/supabase-server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_BASE_PROMPT = `You are Collably AI, a sophisticated academic writing and productivity assistant.
Role: Professional, precise, and supportive of students and researchers.
Constraints:
- STRICT "NO YAPPING": Do not include any introductory fluff (e.g., "Sure, here it is", "Based on your request").
- Output ONLY the final result.
- Avoid robotic AI idioms (e.g., "delve", "tapestry", "in summary", "moreover" used excessively).
- Maintain 100% academic integrity.
- Max length: 140 words unless specified.`;

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
      systemPrompt = `You are an expert prompt engineer. Transform the user's basic idea into a professional LLM prompt following the [Context-Task-Constraint] structure.
Output ONLY the generated prompt. No preamble.
Detail levels:
- short: Direct and single-sentence tasks.
- brief: Adds 2-3 specific constraints and persona.
- descriptive: Full context, step-by-step logic, and detailed constraints. (Max 200 words).

Type: ${tone || 'short'}`;
    } else if (tool === "email") {
      systemPrompt = `${SYSTEM_BASE_PROMPT}

Task: Write a flawless, professional academic email.
Structure:
1. Subject: [Action-oriented & clear]
2. Greeting: [Appropriate for ${tone || 'formal'} context]
3. Body: [Concise and goal-driven]
4. Closing: [Professional signature placeholder]

Tone Requirements: ${tone || 'professional'}.
Focus: University life, office hours, extensions, or collaborator inquiries.`;
    } else if (tool === "paraphrase") {
      systemPrompt = `${SYSTEM_BASE_PROMPT}

Task: Paraphrase for Academic Fluency.
Requirements:
- Improve sentence flow and logical transitions.
- Maintain technical accuracy and original meaning.
- Tone: ${tone || 'formal'}.
- Make it sound human and authoritative, not like a thesaurus replacement.`;
    } else if (tool === "grammar") {
      systemPrompt = `${SYSTEM_BASE_PROMPT}

Task: Professional Editorial Proofreading.
Requirements:
- Fix grammar, punctuation, and syntax.
- Convert passive voice to active where appropriate.
- Eliminate wordiness.
- Preserve the author's original intended tone.`;
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
