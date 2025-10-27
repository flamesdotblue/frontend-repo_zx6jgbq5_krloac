import { Rocket, Settings, Brain } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-sm">
            <Brain size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Adaptive Python Question Generator
n            </h1>
            <p className="text-sm text-slate-500 -mt-0.5">
              RL-driven personalization using accuracy, speed, and consistency
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-600">
          <Rocket size={18} />
          <span className="text-sm">ε-greedy policy, Q-learning inspired</span>
        </div>
      </div>
    </header>
  );
}
