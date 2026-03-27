"use client";

import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";

interface AIToolPanelProps {
  title: string;
  description: string;
  toolType: "email" | "paraphrase" | "grammar" | "prompt";
  showToneSelector?: boolean;
  onSuccess?: () => void;
}

export default function AIToolPanel({
  title,
  description,
  toolType,
  showToneSelector = false,
  onSuccess,
}: AIToolPanelProps) {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  const placeholders = {
    email: "Request a thesis meeting with Dr. Smith...",
    paraphrase: "The resulting data suggests a strong correlation between...",
    grammar: "I has many ideas for the research project...",
    prompt: "A specialized AI tutor for database normalization...",
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Please enter some text.");
      return;
    }
    const maxChars = toolType === "prompt" ? 400 : 500;
    if (input.length > maxChars) {
      setError(`Input must be under ${maxChars} characters.`);
      return;
    }

    setError("");
    setLoading(true);
    setOutput("");

    try {
      const response = await fetch("/api/ai-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: toolType,
          input: input.trim(),
          ...(showToneSelector && { tone }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response.");
      }

      onSuccess?.();
      setOutput(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 transition-all hover:border-gray-200 dark:hover:border-white/10 relative overflow-hidden flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5">
        {description}
      </p>

      <div className="space-y-4 flex-1 flex flex-col">
        {showToneSelector && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1.5">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition"
            >
              {toolType === "prompt" ? (
                <>
                  <option value="short">Short</option>
                  <option value="brief">Brief</option>
                  <option value="descriptive">Descriptive</option>
                </>
              ) : (
                <>
                  <option value="formal">Formal</option>
                  <option value="polite">Polite</option>
                  <option value="casual">Casual</option>
                </>
              )}
            </select>
          </div>
        )}

        <div className="flex-1">
           <div className="flex justify-between items-center mb-1.5">
             <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400">
               Input
             </label>
             <span className={`text-xs ${input.length > (toolType === "prompt" ? 400 : 500) ? 'text-red-500' : 'text-gray-400 dark:text-zinc-500'} font-medium`}>
               {input.length}/{toolType === "prompt" ? 400 : 500}
             </span>
           </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholders[toolType]}
            rows={4}
            className="w-full h-32 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-500/10 p-2 rounded-lg border border-red-100 dark:border-red-500/20">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading || input.length === 0 || input.length > (toolType === "prompt" ? 400 : 500)}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold py-2.5 px-4 rounded-xl text-sm transition disabled:opacity-50 mt-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </button>

        {output && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                  Output
                </label>
                <span className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-zinc-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                  Collably AI
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition bg-gray-100 dark:bg-white/5 py-1 px-2.5 rounded-lg"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3.5 shadow-inner">
               <p className="text-sm text-gray-900 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">{output}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
