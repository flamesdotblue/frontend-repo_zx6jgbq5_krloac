export default function SidebarHelp() {
  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-800">Input format</h3>
          <p className="text-sm text-slate-600 mt-2">
            Provide a JSON object with your performance metrics, current difficulty, and topic.
          </p>
          <pre className="mt-3 text-xs bg-slate-50 p-3 rounded-lg overflow-auto">
{`{
  "performanceMetrics": {
    "accuracy": 65,
    "speed": 50,
    "consistency": 60,
    "learningVelocity": 5,
    "conceptMastery": { "arrays": 80, "strings": 40 }
  },
  "currentDifficulty": "medium",
  "topic": "arrays"
}`}
          </pre>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-800">Policy highlights</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 mt-2 space-y-1">
            <li>State encodes accuracy, speed, consistency buckets.</li>
            <li>Actions: upgrade, downgrade, maintain, focus_weak, focus_strong.</li>
            <li>ε-greedy exploration starting at 0.3, decays with consistency.</li>
            <li>Prefer focus_weak when learning velocity is negative.</li>
            <li>All tasks are O(n) and handle up to 1e5 inputs.</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
