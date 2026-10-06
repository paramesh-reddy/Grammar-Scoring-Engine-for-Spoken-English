import React, { useState } from "react";
import { 
  Sparkles, 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap, 
  FileCode, 
  Download, 
  Github, 
  ExternalLink,
  Layers,
  Activity,
  Archive,
  Volume2
} from "lucide-react";
import { AudioPlayground } from "./components/AudioPlayground";
import { BenchmarkLeaderboard } from "./components/BenchmarkLeaderboard";
import { NotebookViewer } from "./components/NotebookViewer";
import { SubmissionValidator } from "./components/SubmissionValidator";
import { InterviewGuide } from "./components/InterviewGuide";
import { ProjectFilesViewer } from "./components/ProjectFilesViewer";

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    "playground" | "leaderboard" | "notebook" | "submission" | "interview" | "code"
  >("playground");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
                  Grammar Scoring Engine
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  SHL Research Intern
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Continuous Spoken English Proficiency Benchmark [0.0 – 5.0]
              </p>
            </div>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-400">Val RMSE:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">0.4418</span>
            </div>
            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-400">Pearson r:</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">0.8465</span>
            </div>
            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-400">Test Samples:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">216</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none text-xs font-semibold">
              <button
                onClick={() => setCurrentTab("playground")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                  currentTab === "playground"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Live Audio Playground & Stages
              </button>

              <button
                onClick={() => setCurrentTab("leaderboard")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                  currentTab === "leaderboard"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Trophy className="w-4 h-4" />
                Kaggle Benchmark & RMSE Verification
              </button>

              <button
                onClick={() => setCurrentTab("notebook")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                  currentTab === "notebook"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Jupyter Notebook (.ipynb)
              </button>

              <button
                onClick={() => setCurrentTab("submission")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                  currentTab === "submission"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Submission Validator & ZIP Export
              </button>

              <button
                onClick={() => setCurrentTab("interview")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                  currentTab === "interview"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                SHL Interview Guide
              </button>

              <button
                onClick={() => setCurrentTab("code")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                  currentTab === "code"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <FileCode className="w-4 h-4" />
                src/ Python Modules
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === "playground" && <AudioPlayground />}
        {currentTab === "leaderboard" && <BenchmarkLeaderboard />}
        {currentTab === "notebook" && <NotebookViewer />}
        {currentTab === "submission" && <SubmissionValidator />}
        {currentTab === "interview" && <InterviewGuide />}
        {currentTab === "code" && <ProjectFilesViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Grammar Scoring Engine for Spoken English
            </span>
            <span>•</span>
            <span>SHL Research Intern ML Benchmark</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>RMSE: 0.4418</span>
            <span>•</span>
            <span>Pearson r: 0.8465</span>
            <span>•</span>
            <span>Reproducible Seed: 42</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
