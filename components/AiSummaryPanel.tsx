"use client";
import { useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle2, ArrowRight, Lightbulb, Loader2, RefreshCw, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";

type RiskFlag = { flag: string; severity: "high" | "medium" | "low"; note: string };
type AiSummary = {
  emotional_temperature: { score: number; label: string; color: "red" | "amber" | "green" };
  risk_flags: RiskFlag[];
  key_topics: string[];
  wins: string[];
  next_steps: string[];
  advocate_tip: string;
  session_quality: string;
};

const severityStyle = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
};

const qualityLabel: Record<string, { label: string; color: string }> = {
  crisis_intervention: { label: "Crisis Intervention", color: "bg-red-100 text-red-700" },
  needs_attention: { label: "Needs Attention", color: "bg-amber-100 text-amber-700" },
  on_track: { label: "On Track", color: "bg-blue-100 text-blue-700" },
  strong_engagement: { label: "Strong Engagement", color: "bg-emerald-100 text-emerald-700" },
  program_complete: { label: "Program Complete 🎉", color: "bg-purple-100 text-purple-700" },
};

const tempColor = {
  red: { bar: "#ef4444", bg: "bg-red-50", text: "text-red-700" },
  amber: { bar: "#f59e0b", bg: "bg-amber-50", text: "text-amber-700" },
  green: { bar: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700" },
};

export default function AiSummaryPanel({
  noteId,
  noteText,
  existingSummary,
  existingGeneratedAt,
}: {
  noteId: string;
  noteText: string;
  existingSummary?: AiSummary | null;
  existingGeneratedAt?: string | null;
}) {
  const [summary, setSummary] = useState<AiSummary | null>(existingSummary ?? null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(existingGeneratedAt ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!!existingSummary);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: noteId, note_text: noteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setSummary(data.summary);
      setGeneratedAt(new Date().toISOString());
      setExpanded(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const tc = summary ? tempColor[summary.emotional_temperature.color] : tempColor.green;
  const ql = summary ? (qualityLabel[summary.session_quality] ?? { label: summary.session_quality, color: "bg-gray-100 text-gray-600" }) : null;

  if (!summary) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI analysis available for this session</span>
        </div>
        <button
          onClick={analyze}
          disabled={loading || !noteText}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity disabled:opacity-50"
          style={{ background: "#143637" }}
        >
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</> : <><Sparkles className="w-3.5 h-3.5" /> Analyze with AI</>}
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-[#143637]/20 overflow-hidden" style={{ background: "#f8fdfb" }}>
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer"
        style={{ background: "#143637" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-white text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Analysis
          {ql && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ql.color}`}>{ql.label}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); analyze(); }}
            disabled={loading}
            className="text-white/60 hover:text-white transition-colors"
            title="Re-analyze"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Emotional Temperature */}
          <div className={`rounded-lg p-3 ${tc.bg}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-semibold ${tc.text}`}>Emotional Temperature</span>
              <span className={`text-sm font-bold ${tc.text}`}>{summary.emotional_temperature.score}/10 — {summary.emotional_temperature.label}</span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${(summary.emotional_temperature.score / 10) * 100}%`, background: tc.bar }}
              />
            </div>
          </div>

          {/* Risk Flags */}
          {summary.risk_flags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Risk Flags
              </div>
              <div className="space-y-1.5">
                {summary.risk_flags.map((f, i) => (
                  <div key={i} className={`rounded-lg border px-3 py-2 ${severityStyle[f.severity]}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold uppercase tracking-wide">{f.severity}</span>
                      <span className="text-xs font-semibold">{f.flag}</span>
                    </div>
                    <div className="text-xs opacity-80">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.risk_flags.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              No risk flags identified in this session
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Key Topics */}
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-2">Key Topics</div>
              <div className="flex flex-wrap gap-1.5">
                {summary.key_topics.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full border font-medium bg-white border-gray-200 text-gray-600">{t}</span>
                ))}
              </div>
            </div>

            {/* Wins */}
            {summary.wins.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mb-2">
                  <ThumbsUp className="w-3 h-3" /> Wins
                </div>
                <ul className="space-y-1">
                  {summary.wins.map((w, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
              <ArrowRight className="w-3.5 h-3.5" style={{ color: "#eb462d" }} />
              Suggested Next Steps
            </div>
            <ol className="space-y-1.5">
              {summary.next_steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: "#eb462d" }}>{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* Advocate Tip */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-700 mb-0.5">Advocate Coaching Note</div>
              <div className="text-xs text-amber-800 italic">"{summary.advocate_tip}"</div>
            </div>
          </div>

          {generatedAt && (
            <div className="text-xs text-gray-300 text-right">
              AI analysis · {new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
