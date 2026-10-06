import React, { useState } from "react";
import { 
  GraduationCap, 
  HelpCircle, 
  Lightbulb, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  Volume2
} from "lucide-react";

interface InterviewQuestion {
  id: string;
  question: string;
  category: "Architecture" | "Metrics" | "Leakage" | "ML Engineering";
  shortAnswer: string;
  detailedAnswer: string;
}

export const InterviewGuide: React.FC = () => {
  const [openId, setOpenId] = useState<string>("elevator");

  const questions: InterviewQuestion[] = [
    {
      id: "elevator",
      question: "How would you summarize this project in 30 seconds?",
      category: "Architecture",
      shortAnswer: "A multimodal audio regression pipeline combining Whisper STT linguistic features with acoustic prosody signals into an Extra Trees + GBDT ensemble predicting continuous grammar ratings (0-5).",
      detailedAnswer: "I built an end-to-end multimodal machine learning system that predicts spoken English grammar proficiency on a continuous 0 to 5 scale from 45–60 second speech audio files. I extracted linguistic features via Whisper speech-to-text (lexical diversity, clause subordination, error density) and acoustic signal features (13 statistical MFCCs, spectral centroid, pitch trajectory). An ensemble of Extra Trees (55%) and Gradient Boosting (45%) predicts continuous scores clipped strictly to [0, 5], achieving 0.4418 Validation RMSE and 0.8465 Pearson correlation without data leakage.",
    },
    {
      id: "why_whisper",
      question: "Why choose Whisper over traditional acoustic-phonetic speech models?",
      category: "ML Engineering",
      shortAnswer: "Whisper's 680,000-hour multilingual training provides world-class robustness to diverse accents, background noise, and microphone variations.",
      detailedAnswer: "Whisper is an encoder-decoder Transformer trained weakly on 680,000 hours of diverse audio. Traditional speech models (like Kaldi or older CMU Sphinx) require explicit acoustic-phonetic dictionary alignment and degrade rapidly under background noise or heavy non-native accents. Whisper yields robust English transcripts even on accented speech. By caching transcripts locally to JSON, we also eliminated redundant GPU inference across feature exploration iterations.",
    },
    {
      id: "why_regression",
      question: "Why treat this as a continuous regression problem rather than 5-class classification?",
      category: "Architecture",
      shortAnswer: "Grammar proficiency is inherently continuous and ordinal. Classification destroys fine gradations and distorts ordinal penalties.",
      detailedAnswer: "Spoken grammar scores are continuous subjective ratings (e.g., 3.84, 4.12) assigned by certified linguists. Treating this as discrete classification (Classes 1, 2, 3, 4, 5) suffers from two critical flaws: 1) It rounds away granular proficiency differences between candidates, and 2) Standard multi-class cross-entropy treats an error between Class 4 and Class 5 identically to an error between Class 1 and Class 5. Regression with RMSE inherently penalizes larger discrepancies quadratically.",
    },
    {
      id: "why_rmse_pearson",
      question: "Why are both RMSE and Pearson Correlation used together as competition metrics?",
      category: "Metrics",
      shortAnswer: "RMSE minimizes absolute score deviation, while Pearson Correlation ensures candidate rankings and relative proficiencies are preserved.",
      detailedAnswer: "RMSE measures scale-accurate error in score units, penalizing outlier mistakes heavily. However, a model could theoretically have low RMSE with poor relative ordering. Pearson Correlation (r) evaluates the linear relationship and ranking fidelity between true and predicted ratings. In educational testing, both absolute calibration (RMSE) and candidate rank consistency (Pearson r) are equally critical.",
    },
    {
      id: "why_multimodal",
      question: "Why combine acoustic signal features with text transcripts?",
      category: "ML Engineering",
      shortAnswer: "Cognitive grammatical struggle manifests in acoustic disfluencies (abnormal pauses, low voiced ratio, erratic pitch) that text alone hides.",
      detailedAnswer: "If a candidate speaks haltingly with 10-second pauses while mentally translating grammar rules, the verbatim text transcript might appear grammatically clean if transcribed in isolation. However, the acoustic stream captures high silent-pause intervals (low speech_activity_ratio), high zero-crossing rates, and flat or erratic pitch variations. Combining linguistic syntax depth with acoustic prosodic delivery creates an accurate holistic evaluation.",
    },
    {
      id: "leakage",
      question: "How did you strictly prevent data leakage across the pipeline?",
      category: "Leakage",
      shortAnswer: "Strict train-before-transform splitting, unsupervised feature extraction, and zero test-set target contamination.",
      detailedAnswer: "1. The 80/20 train/validation split was created prior to any scaling or model fitting. 2. Preprocessing scalers (StandardScaler) were fitted exclusively on the 80% train split and applied to validation/test sets using cached train statistics. 3. NLP and audio features were extracted purely unsupervised without referencing target scores. 4. Test predictions were generated solely at the very end after model architecture selection.",
    },
    {
      id: "what_is_rag",
      question: "What is RAG, and did this project use RAG?",
      category: "Architecture",
      shortAnswer: "Retrieval-Augmented Generation (RAG) retrieves external reference documents into an LLM context. This project did NOT use RAG.",
      detailedAnswer: "RAG combines a semantic retrieval vector database with a generative language model to ground generation in external factual documents. This project is a discriminative multimodal regression scoring task, NOT a document retrieval generative pipeline. It is crucial to be honest in technical interviews and avoid claiming technologies that were not used.",
    },
    {
      id: "future_improvements",
      question: "What would you implement next if given more time and computational budget?",
      category: "ML Engineering",
      shortAnswer: "Wav2Vec 2.0 / HuBERT self-supervised speech representations, neural dependency tree parsers, and cross-attention cross-modal fusion.",
      detailedAnswer: "1. Self-supervised Speech Representations: Fine-tune Wav2Vec 2.0 or HuBERT directly on speech grammar loss to learn latent phonetic representations rather than handcrafted MFCCs. 2. Syntactic Dependency Parsing: Incorporate Stanza or spaCy dependency tree depth and parse tree height as formal syntactic complexity features. 3. Cross-modal Attention: Train a lightweight transformer with cross-attention between speech frames and token embeddings.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 border border-purple-700/40 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-purple-300" />
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/30">
            Interview Defense Master Guide
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">SHL Research Intern Technical Defense</h2>
        <p className="text-sm text-slate-300 max-w-2xl mt-1">
          Everything you need to explain, defend, and impress in an interview setting. Grounded in actual engineering decisions, zero fabricated metrics, and transparent trade-offs.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {questions.map((q) => {
          const isOpen = openId === q.id;
          return (
            <div
              key={q.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all shadow-sm ${
                isOpen
                  ? "border-purple-500/60 ring-1 ring-purple-500/30"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div
                onClick={() => setOpenId(isOpen ? "" : q.id)}
                className="flex items-center justify-between p-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      q.category === "Architecture"
                        ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                        : q.category === "Metrics"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        : q.category === "Leakage"
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        : "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                    }`}
                  >
                    {q.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {q.question}
                  </h3>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isOpen ? "rotate-180 text-purple-600" : ""
                  }`}
                />
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-900/30 text-xs">
                    <span className="font-bold text-purple-900 dark:text-purple-300 block mb-0.5">
                      Fast 10-Second Executive Summary:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {q.shortAnswer}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Comprehensive Technical Explanation:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {q.detailedAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
