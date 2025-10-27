import { useMemo, useState } from "react";
import Header from "./components/Header";
import SidebarHelp from "./components/SidebarHelp";
import UserProfileInput from "./components/UserProfileInput";
import RLQuestionCard from "./components/RLQuestionCard";

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function bucket(v, low, high) {
  if (v < low) return "low";
  if (v >= high) return "high";
  return "mid";
}

function chooseAction(profile) {
  const { performanceMetrics, currentDifficulty, topic } = profile;
  const { accuracy = 0, speed = 0, consistency = 0, learningVelocity = 0, conceptMastery = {} } = performanceMetrics || {};
  const masteryEntries = Object.entries(conceptMastery || {});

  const state = `${bucket(accuracy, 50, 80)}_acc_${bucket(speed, 40, 70)}_spd_${bucket(consistency, 50, 75)}_con`;

  // epsilon decays with consistency (start 0.3 -> 0.05)
  const eps = clamp(0.3 - (consistency / 100) * 0.25, 0.05, 0.3);
  const rngSeed = Math.abs(
    Math.sin((accuracy + 3 * speed + 7 * consistency + 11 * learningVelocity) * 0.017) * 10000
  );
  const explore = rngSeed % 1 < eps;

  const weakConcepts = masteryEntries.filter(([, v]) => v < 70).map(([k]) => k);
  const strongConcepts = masteryEntries.filter(([, v]) => v >= 70).map(([k]) => k);

  // Greedy heuristic for action
  let greedyAction = "maintain";
  if (learningVelocity < 0) {
    greedyAction = "focus_weak";
  } else if (accuracy > 85 && speed > 65 && consistency > 75) {
    greedyAction = "upgrade";
  } else if (accuracy < 50 || consistency < 50) {
    greedyAction = "downgrade";
  } else if (weakConcepts.length > 0) {
    greedyAction = "focus_weak";
  } else if (strongConcepts.length > 0) {
    greedyAction = "focus_strong";
  }

  const actionSpace = ["upgrade", "downgrade", "maintain", "focus_weak", "focus_strong"];
  const action = explore ? actionSpace[Math.floor(rngSeed) % actionSpace.length] : greedyAction;

  // Decide difficulty
  let difficulty = currentDifficulty || "medium";
  const order = ["easy", "medium", "hard"];
  const idx = order.indexOf(difficulty);
  const bump = (d, delta) => order[clamp(order.indexOf(d) + delta, 0, order.length - 1)];

  if (action === "upgrade") difficulty = bump(difficulty, 1);
  if (action === "downgrade") difficulty = bump(difficulty, -1);

  // Choose concept to emphasize
  let focusConcept = topic || (weakConcepts[0] || strongConcepts[0] || "arrays");
  if (action === "focus_weak" && weakConcepts.length) focusConcept = weakConcepts[0];
  if (action === "focus_strong" && strongConcepts.length) focusConcept = strongConcepts[0];

  return { state, action, difficulty, focusConcept };
}

function buildQuestion({ topic, action, difficulty, focusConcept }) {
  const concept = focusConcept || topic || "arrays";

  // Factory for different topics/difficulties
  const builders = {
    arrays: {
      easy: () => ({
        title: "Running Sum of Array",
        description:
          "Given an array of integers, return the running sum (prefix sums).\n\nConstraints:\n- 1 <= n <= 1e5\n- O(n) time, O(1) extra space\n\nInput: space-separated integers\nOutput: space-separated running sums",
        starterCode:
          "def running_sum(nums):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    nums = list(map(int, sys.stdin.read().strip().split()))\n    res = running_sum(nums)\n    print(' '.join(map(str, res)))\n",
        solutionCode:
          "def running_sum(nums):\n    s = 0\n    for i in range(len(nums)):\n        s += nums[i]\n        nums[i] = s\n    return nums\n\nif __name__ == '__main__':\n    import sys\n    nums = list(map(int, sys.stdin.read().strip().split()))\n    res = running_sum(nums)\n    print(' '.join(map(str, res)))\n",
        expectedOutput: "1 3 6 10",
        testCases: [
          { input: "1 2 3 4", expectedOutput: "1 3 6 10" },
          { input: "5", expectedOutput: "5" },
        ],
        tags: ["arrays", "prefix-sum", difficulty, action],
      }),
      medium: () => ({
        title: "Count Subarrays with Sum = K",
        description:
          "Given an integer array and integer K, return the number of continuous subarrays whose sum equals K.\n\nConstraints:\n- 1 <= n <= 1e5\n- Elements can be negative\n- O(n) time using prefix sums + hashmap\n\nInput: first line n and K, second line n integers\nOutput: single integer count",
        starterCode:
          "def subarray_sum_equals_k(nums, k):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    data = sys.stdin.read().strip().split()\n    n, k = map(int, data[:2])\n    nums = list(map(int, data[2:2+n]))\n    print(subarray_sum_equals_k(nums, k))\n",
        solutionCode:
          "from collections import defaultdict\n\ndef subarray_sum_equals_k(nums, k):\n    pref = 0\n    freq = defaultdict(int)\n    freq[0] = 1\n    ans = 0\n    for x in nums:\n        pref += x\n        ans += freq[pref - k]\n        freq[pref] += 1\n    return ans\n\nif __name__ == '__main__':\n    import sys\n    data = sys.stdin.read().strip().split()\n    n, k = map(int, data[:2])\n    nums = list(map(int, data[2:2+n]))\n    print(subarray_sum_equals_k(nums, k))\n",
        expectedOutput: "2",
        testCases: [
          { input: "5 7\n1 2 3 4 -3", expectedOutput: "2" },
          { input: "3 3\n1 1 1", expectedOutput: "3" },
        ],
        tags: ["arrays", "hashmap", "prefix-sum", difficulty, action],
      }),
      hard: () => ({
        title: "Minimum Length Subarray with Sum ≥ S",
        description:
          "Given an array of positive integers and a target S, find the minimal length of a contiguous subarray of which the sum ≥ S. Return 0 if none. Use a sliding window.\n\nConstraints:\n- 1 <= n <= 1e5\n- O(n) time, O(1) extra space\n\nInput: first line n and S, second line n integers\nOutput: minimal length (integer)",
        starterCode:
          "def min_subarray_len(nums, s):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    data = sys.stdin.read().strip().split()\n    n, s = map(int, data[:2])\n    nums = list(map(int, data[2:2+n]))\n    print(min_subarray_len(nums, s))\n",
        solutionCode:
          "def min_subarray_len(nums, s):\n    left = 0\n    SUM = 0\n    ans = float('inf')\n    for right, x in enumerate(nums):\n        SUM += x\n        while SUM >= s:\n            ans = min(ans, right - left + 1)\n            SUM -= nums[left]\n            left += 1\n    return 0 if ans == float('inf') else ans\n\nif __name__ == '__main__':\n    import sys\n    data = sys.stdin.read().strip().split()\n    n, s = map(int, data[:2])\n    nums = list(map(int, data[2:2+n]))\n    print(min_subarray_len(nums, s))\n",
        expectedOutput: "2",
        testCases: [
          { input: "6 7\n2 3 1 2 4 3", expectedOutput: "2" },
          { input: "3 100\n1 2 3", expectedOutput: "0" },
        ],
        tags: ["arrays", "two-pointers", "sliding-window", difficulty, action],
      }),
    },
    strings: {
      easy: () => ({
        title: "Valid Anagram",
        description:
          "Given two strings s and t, return true if t is an anagram of s. Assume lowercase ASCII.\n\nConstraints:\n- 1 <= |s|,|t| <= 1e5\n- O(n) time\n\nInput: two lines s and t\nOutput: true/false",
        starterCode:
          "def is_anagram(s, t):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    s, t = sys.stdin.read().strip().split('\n')\n    print(str(is_anagram(s, t)).lower())\n",
        solutionCode:
          "def is_anagram(s, t):\n    if len(s) != len(t):\n        return False\n    freq = [0]*26\n    for ch in s:\n        freq[ord(ch)-97] += 1\n    for ch in t:\n        i = ord(ch)-97\n        freq[i] -= 1\n        if freq[i] < 0:\n            return False\n    return True\n\nif __name__ == '__main__':\n    import sys\n    s, t = sys.stdin.read().strip().split('\n')\n    print(str(is_anagram(s, t)).lower())\n",
        expectedOutput: "true",
        testCases: [
          { input: "anagram\nnagaram", expectedOutput: "true" },
          { input: "rat\ncar", expectedOutput: "false" },
        ],
        tags: ["strings", "hashing", difficulty, action],
      }),
      medium: () => ({
        title: "Longest Substring Without Repeating Characters",
        description:
          "Given a string s, find the length of the longest substring without repeating characters using sliding window.\n\nConstraints:\n- 1 <= |s| <= 1e5\n- O(n) time\n\nInput: single line string\nOutput: integer length",
        starterCode:
          "def length_of_longest_substring(s):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    print(length_of_longest_substring(s))\n",
        solutionCode:
          "def length_of_longest_substring(s):\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    print(length_of_longest_substring(s))\n",
        expectedOutput: "3",
        testCases: [
          { input: "abcabcbb", expectedOutput: "3" },
          { input: "bbbbb", expectedOutput: "1" },
        ],
        tags: ["strings", "sliding-window", difficulty, action],
      }),
      hard: () => ({
        title: "Find All Anagrams in a String",
        description:
          "Given two strings s and p, return all start indices of p's anagrams in s. Use sliding window with counts.\n\nConstraints:\n- 1 <= |s|,|p| <= 1e5\n- O(n) time\n\nInput: two lines s and p\nOutput: space-separated indices",
        starterCode:
          "def find_anagrams(s, p):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    s, p = sys.stdin.read().strip().split('\n')\n    print(' '.join(map(str, find_anagrams(s, p))))\n",
        solutionCode:
          "def find_anagrams(s, p):\n    need = [0]*26\n    for ch in p:\n        need[ord(ch)-97] += 1\n    have = [0]*26\n    res = []\n    m = len(p)\n    for i, ch in enumerate(s):\n        have[ord(ch)-97] += 1\n        if i >= m:\n            have[ord(s[i-m])-97] -= 1\n        if i+1 >= m and have == need:\n            res.append(i-m+1)\n    return res\n\nif __name__ == '__main__':\n    import sys\n    s, p = sys.stdin.read().strip().split('\n')\n    print(' '.join(map(str, find_anagrams(s, p))))\n",
        expectedOutput: "0 6",
        testCases: [
          { input: "cbaebabacd\nabc", expectedOutput: "0 6" },
          { input: "abab\nab", expectedOutput: "0 1 2" },
        ],
        tags: ["strings", "sliding-window", difficulty, action],
      }),
    },
  };

  const topicKey = ["arrays", "strings"].includes(concept) ? concept : (concept.includes("string") ? "strings" : "arrays");
  const maker = builders[topicKey][difficulty] || builders[topicKey].medium;
  return maker();
}

export default function App() {
  const [output, setOutput] = useState(null);
  const [decision, setDecision] = useState(null);

  const handleGenerate = (profile) => {
    try {
      const decisionLocal = chooseAction(profile);
      const question = buildQuestion({
        topic: profile.topic,
        action: decisionLocal.action,
        difficulty: decisionLocal.difficulty,
        focusConcept: decisionLocal.focusConcept,
      });
      setDecision(decisionLocal);
      setOutput(question);
    } catch (e) {
      console.error(e);
      alert("Failed to generate question. Check your input JSON.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <UserProfileInput onGenerate={handleGenerate} />

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
