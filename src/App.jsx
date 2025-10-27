import { useState } from "react";
import Header from "./components/Header";
import SidebarHelp from "./components/SidebarHelp";
import UserProfileInput from "./components/UserProfileInput";
import RLQuestionCard from "./components/RLQuestionCard";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [output, setOutput] = useState(null);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (profile) => {
    try {
      setLoading(true);
      setOutput(null);
      setDecision(null);

      const userId = profile.userId || profile.user_id || "demo-user";
      const res = await fetch(`${BACKEND_URL}/api/generate-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, profile }),
      });
      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }
      const data = await res.json();
      setDecision({ ...data.decision, state: data.state });
      setOutput(data.question);
    } catch (e) {
      console.error(e);
      alert("Failed to generate from backend. Make sure the backend URL is set and running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <UserProfileInput onGenerate={handleGenerate} />

            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Generating with RL policy…</div>
            )}

            {decision && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-700">
                  <span className="font-semibold mr-2">Policy decision:</span>
                  action = <span className="font-mono">{decision.action}</span>,
                  difficulty = <span className="font-mono">{decision.difficulty}</span>,
                  focus = <span className="font-mono">{decision.focusConcept}</span>,
                  state = <span className="font-mono">{decision.state}</span>
                </div>
              </div>
            )}

            <RLQuestionCard output={output} />
          </div>
          <SidebarHelp />
        </div>
      </main>
    </div>
  );
}
