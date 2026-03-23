"use client";

import { useState, useEffect } from "react";
import AIToolPanel from "@/src/components/ui/AIToolPanel";
import { Bot, Mail, FileText, CheckCircle, ArrowLeft, Sparkles } from "lucide-react";
import { createClientSupabase } from "@/src/lib/supabase-client";

type ToolType = "email" | "paraphrase" | "grammar" | "prompt";

const TOOLS = [
  {
    type: "email" as ToolType,
    title: "Email Writer",
    description: "Draft professional academic emails quickly based on short instructions.",
    icon: Mail,
    color: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-500"
  },
  {
    type: "paraphrase" as ToolType,
    title: "Paraphraser",
    description: "Rephrase sentences or paragraphs while preserving the core meaning.",
    icon: FileText,
    color: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-500"
  },
  {
    type: "grammar" as ToolType,
    title: "Grammar Fixer",
    description: "Fix typos, grammar rules, and improve sentence clarity effortlessly.",
    icon: CheckCircle,
    color: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500"
  },
  {
    type: "prompt" as ToolType,
    title: "Prompt Writer",
    description: "Generate high-quality structured prompts based on your short ideas.",
    icon: Sparkles,
    color: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500"
  }
];

export default function AILibraryPage() {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);

  const fetchUsage = async () => {
    const supabase = createClientSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("ai_usages")
        .select("usage_count, last_used_at")
        .eq("user_id", user.id)
        .single();
      
      if (data && data.last_used_at === today) {
        setUsageCount(data.usage_count);
      } else {
        setUsageCount(0);
      }
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const activeToolData = TOOLS.find(t => t.type === activeTool);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shadow-sm shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              AI Library
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {activeTool ? `Workspace / ${activeToolData?.title}` : "Smart academic tools to help you write cleaner and faster."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-50/80 dark:bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
            <span>{usageCount}/20 Uses Today</span>
          </div>

          {activeTool && (
            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tools
            </button>
          )}
        </div>
      </div>

      {/* Grid of Compact Cards */}
      {!activeTool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animation-fade-in">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.type}
                onClick={() => setActiveTool(tool.type)}
                className="group flex flex-col p-6 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-2xl text-left hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm dark:hover:shadow-none transition-all duration-150"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-150`}>
                  <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  {tool.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                  {tool.description}
                </p>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto animation-fade-in">
          {activeTool === "email" && (
            <AIToolPanel
              title="Email Writer"
              description="Draft professional academic emails quickly based on short instructions."
              toolType="email"
              showToneSelector={true}
              onSuccess={fetchUsage}
            />
          )}
          
          {activeTool === "paraphrase" && (
            <AIToolPanel
              title="Paraphraser"
              description="Rephrase sentences or paragraphs while preserving the core meaning."
              toolType="paraphrase"
              onSuccess={fetchUsage}
            />
          )}

          {activeTool === "grammar" && (
            <AIToolPanel
              title="Grammar Fixer"
              description="Fix typos, grammar rules, and improve sentence clarity effortlessly."
              toolType="grammar"
              onSuccess={fetchUsage}
            />
          )}

          {activeTool === "prompt" && (
            <AIToolPanel
              title="Prompt Writer"
              description="Generate high-quality structured prompts based on your short ideas."
              toolType="prompt"
              showToneSelector={true}
              onSuccess={fetchUsage}
            />
          )}
        </div>
      )}
    </div>
  );
}
