import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { MessageSquare, Send, Sparkles, Leaf, Trash2, AlertCircle, X } from "lucide-react";

interface CarbonCoachProps {
  userId: string;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export default function CarbonCoach({ userId }: CarbonCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", text: "Hello! I am your **EcoTracker AI Carbon Coach**, powered by Google Gemini. Ask me anything about tracking your emissions, strategic micro-habits, or details on carbon offset options! How can I guide you today?" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggestions for prompt triggers
  const promptSuggestions = [
    "What are 3 quick daily ways to reduce electricity?",
    "How can I cut down on my food emissions?",
    "Is recycling waste better than avoiding plastic?",
    "Explain standard carbon offset calculations?"
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const response = await axios.post("/api/carbon/coach", {
        userId,
        message: textToSend,
        chatHistory: messages
      });

      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { role: "model", text: response.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "model", text: "I analyzed your request but had a slight connection hitch. Let's try again!" }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I am facing connectivity issues to my Gemini core right now. Please try again soon." }]);
    } finally {
      setLoading(false);
    }
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearConfirm = () => {
    setMessages([
      { role: "model", text: "History cleared. I am your EcoTracker Coach! What green projects should we explore next?" }
    ]);
    setShowClearConfirm(false);
  };

  // Basic lightweight markdown renderer for simple bold formatting & lists
  const renderMessageText = (txt: string) => {
    const lines = txt.split("\n");
    return lines.map((line, idx) => {
      // Handle simple markdown line prefixes
      let parsedLine = line;
      let isBullet = false;
      let isHeading = false;

      if (line.startsWith("- ") || line.startsWith("* ")) {
        parsedLine = line.substring(2);
        isBullet = true;
      } else if (line.startsWith("### ")) {
        parsedLine = line.substring(4);
        isHeading = true;
      } else if (line.startsWith("## ")) {
        parsedLine = line.substring(3);
        isHeading = true;
      }

      // Handle raw inline bold formatting (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(parsedLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(parsedLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-emerald-700 font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < parsedLine.length) {
        parts.push(parsedLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : parsedLine;

      if (isHeading) {
        return <h4 key={idx} className="text-emerald-700 font-bold text-sm mt-3 mb-1.5">{content}</h4>;
      }
      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-600 text-[11.5px] leading-relaxed my-1">
            {content}
          </li>
        );
      }
      return (
        <p key={idx} className="text-slate-700 text-[11.5px] leading-relaxed my-1 min-h-[1.2rem]">
          {content}
        </p>
      );
    });
  };

  return (
    <div id="ai-coach-panel" className="bg-white border border-slate-200 rounded-3xl p-6 h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden relative shadow-xs">
      {/* Upper header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-250">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              AI Carbon Coach <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
            </h3>
            <p className="text-[10px] text-slate-500">Ask strategic questions powered by Google Gemini</p>
          </div>
        </div>
        <button 
          onClick={() => setShowClearConfirm(true)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
          title="Clear logs history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages track */}
      <div className="grow overflow-y-auto py-4 space-y-4 pr-1 my-2">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div 
              key={idx} 
              className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5 transition-all animate-fadeIn`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              )}
              <div className={`p-4 rounded-2xl max-w-[80%] ${
                isUser 
                  ? "bg-emerald-600 text-white rounded-tr-none border border-emerald-700/10 shadow-xs" 
                  : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-200 shadow-xs"
              }`}>
                {renderMessageText(m.text)}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-250 flex items-center justify-center shrink-0">
              <Leaf className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            </div>
            <div className="bg-slate-50 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 text-xs flex items-center gap-2 shadow-xs">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span>Analyzing carbon variables...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* QuickSuggestions & Input */}
      <div className="shrink-0 space-y-3">
        {/* Quick Question Prompts */}
        {messages.length <= 2 && (
          <div className="grid grid-cols-2 gap-2">
            {promptSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(suggestion)}
                className="p-2.5 text-left text-[10.5px] bg-slate-50 hover:bg-slate-100 text-emerald-700 hover:text-emerald-800 rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-ellipsis overflow-hidden whitespace-nowrap cursor-pointer font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Form Input fields */}
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(inputVal); }}
          className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl overflow-hidden"
        >
          <input
            type="text"
            placeholder="Ask AI coach about your footprint (e.g. reduction plan)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            className="grow bg-transparent text-xs text-slate-800 placeholder-slate-400 px-3 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || loading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white rounded-xl disabled:text-slate-400 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Elegant Custom Confirmation Modal for Clearing Chat History */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative bg-white border border-slate-200 rounded-3xl max-w-[90%] w-full p-5 shadow-xl flex flex-col gap-3.5 z-10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-250 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Clear chat history?</h4>
                </div>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                Are you sure you want to clear your current conversation history with the EcoTracker Carbon Coach? This action cannot be undone.
              </p>

              <div className="flex items-center gap-2.5 justify-end mt-1">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearConfirm}
                  className="bg-rose-650 hover:bg-rose-600 text-white font-bold text-[10.5px] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Clear Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
