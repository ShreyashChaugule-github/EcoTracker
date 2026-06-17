import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Leaf, BookOpen, ChevronRight, AlertCircle } from "lucide-react";

interface AssessmentReportProps {
  userId: string;
}

export default function AssessmentReport({ userId }: AssessmentReportProps) {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const triggerAssessment = async () => {
    try {
      setLoading(true);
      setError("");
      // Call Express assessment endpoint
      const response = await axios.post("/api/carbon/assessment", { userId });
      if (response.data && response.data.report) {
        setReport(response.data.report);
      } else {
        setReport("### 🪵 Analytics Connection Lagged\n\nUnable to generate Gemini profile context right now.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate custom assessment report. Ensure you have submitted log entries in the dashboard!");
    } finally {
      setLoading(false);
    }
  };

  // Basic lightweight renderer for Gemini Assessment markdown
  const renderMarkdown = (txt: string) => {
    const lines = txt.split("\n");
    return lines.map((line, idx) => {
      let isHeading = false;
      let isNumBullet = false;
      let isBullet = false;
      let cleanLine = line;

      if (line.startsWith("### ")) {
        cleanLine = line.substring(4);
        isHeading = true;
      } else if (line.startsWith("## ")) {
        cleanLine = line.substring(3);
        isHeading = true;
      } else if (line.match(/^\d+\.\s/)) {
        cleanLine = line.replace(/^\d+\.\s/, "");
        isNumBullet = true;
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        cleanLine = line.substring(2);
        isBullet = true;
      }

      // Inline strong helpers
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-emerald-700 font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : cleanLine;

      if (isHeading) {
        return (
          <h4 key={idx} className="text-emerald-700 font-bold font-sans text-sm mt-5 mb-2.5 border-b border-slate-250 pb-1.5 select-none uppercase tracking-wide">
            {content}
          </h4>
        );
      }
      if (isNumBullet) {
        return (
          <div key={idx} className="flex gap-2 items-start my-1.5 text-[11.5px] leading-relaxed text-slate-750">
            <span className="font-mono text-emerald-600 font-bold shrink-0">{line.match(/^\d+/)?.[0]}.</span>
            <span>{content}</span>
          </div>
        );
      }
      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-600 text-[11.5px] leading-relaxed my-1">
            {content}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-700 text-[11.5px] leading-relaxed my-2.5 min-h-[1.1rem]">
          {content}
        </p>
      );
    });
  };

  return (
    <div id="assessment-report-panel" className="bg-white border border-slate-200 p-6 rounded-3xl h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden shadow-xs">
      
      {/* Title */}
      <div className="shrink-0 border-b border-slate-100 pb-4 mb-4 select-none">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          Intelligent AI Carbon Assessment <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
        </h3>
        <p className="text-[10px] text-slate-500">Deep audit scans of your real logs to identify biggest consumer categories & emission trends</p>
      </div>

      {/* Main viewer */}
      <div className="grow overflow-y-auto space-y-4 pr-1">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center py-10 select-none">
            <div className="relative w-16 h-16 flex items-center justify-center mb-4">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <Leaf className="w-6 h-6 text-emerald-600 animate-pulse" />
            </div>
            <h4 className="text-sm text-slate-900 font-bold mb-1">Synthesizing Carbon Audit Data...</h4>
            <p className="text-[10.5px] text-slate-500 font-mono text-center max-w-sm px-4">
              Google Gemini is parsing active databases, categories, offsets, and avoidance habits to generate actionable micro-strategies.
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : report ? (
          <div id="markdown-scroller" className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-inner relative animate-fadeIn">
            {renderMarkdown(report)}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-10 text-center select-none bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
            <Sparkles className="w-10 h-10 text-emerald-600 mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">No Active Assessment Report</h4>
            <p className="text-[11px] text-slate-500 max-w-md leading-relaxed mb-4">
              Unlock a full diagnostics evaluation based on your logged carbon events. Our AI coach analyzes weekly stats to emit micro-audits!
            </p>
            <button
              onClick={triggerAssessment}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              Request AI Footprint Assessment <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {report && !loading && (
        <div className="shrink-0 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={triggerAssessment}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Re-run Carbon Audit Scanner
          </button>
        </div>
      )}

    </div>
  );
}
