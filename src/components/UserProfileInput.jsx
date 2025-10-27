import { useState } from "react";
import { Play, Clipboard, Check, Wand2 } from "lucide-react";

export default function UserProfileInput({ onGenerate, onUseExample }) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handlePasteExample = () => {
    const example = {
      performanceMetrics: {
        accuracy: 65,
        speed: 50,
        consistency: 60,
        learningVelocity: 5,
        conceptMastery: { arrays: 80, strings: 40, hashing: 55 },
      },
      currentDifficulty: "medium",
      topic: "arrays",
    };
    const text = JSON.stringify(example, null, 2);
    setInput(text);
    onUseExample?.(example);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(input);
      onGenerate(parsed);
    } catch (e) {
      alert("Invalid JSON. Please fix errors before generating.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-800">User profile JSON</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePasteExample}
            className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            <Wand2 size={16} /> Example
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            {copied ? <Check size={16} /> : <Clipboard size={16} />} Copy
          </button>
        </div>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste user profile JSON here..."
        className="w-full h-56 sm:h-64 font-mono text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="mt-3 flex items-center justify-end">
        <button
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        >
          <Play size={16} /> Generate
        </button>
      </div>
    </div>
  );
}
