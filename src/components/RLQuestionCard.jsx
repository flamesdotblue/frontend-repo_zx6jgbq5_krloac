import { useState } from "react";
import { Clipboard, Check, FileJson } from "lucide-react";

export default function RLQuestionCard({ output }) {
  const [copied, setCopied] = useState(false);

  const pretty = output ? JSON.stringify(output, null, 2) : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pretty);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  if (!output) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
        The generated JSON question will appear here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-700">
          <FileJson size={18} />
          <span className="font-medium">Generated Question (JSON)</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          {copied ? <Check size={16} /> : <Clipboard size={16} />} Copy
        </button>
      </div>
      <pre className="p-4 bg-slate-50 text-xs sm:text-sm overflow-auto max-h-[520px]">
        {pretty}
      </pre>
    </div>
  );
}
