export interface ModelMetric {
  name: string;
  type: string;
  rmse: number;
  pearson: number;
  mae: number;
  r2: number;
  isBest?: boolean;
}

export const MODEL_BENCHMARKS: ModelMetric[] = [
  {
    name: "Weighted Ensemble (ExtraTrees + GBDT)",
    type: "Multimodal Ensemble",
    rmse: 0.4418,
    pearson: 0.8465,
    mae: 0.3488,
    r2: 0.7042,
    isBest: true,
  },
  {
    name: "Extra Trees Regressor",
    type: "Randomized Forest",
    rmse: 0.4485,
    pearson: 0.8398,
    mae: 0.3542,
    r2: 0.6954,
  },
  {
    name: "Gradient Boosting Regressor",
    type: "Sequential Boosting",
    rmse: 0.4532,
    pearson: 0.8325,
    mae: 0.3590,
    r2: 0.6890,
  },
  {
    name: "HistGradientBoosting",
    type: "Histogram Boosting",
    rmse: 0.4678,
    pearson: 0.8190,
    mae: 0.3712,
    r2: 0.6685,
  },
  {
    name: "Random Forest Regressor",
    type: "Bagging Ensemble",
    rmse: 0.4815,
    pearson: 0.7984,
    mae: 0.3840,
    r2: 0.6482,
  },
  {
    name: "Dummy Regressor (Mean)",
    type: "Baseline",
    rmse: 0.8142,
    pearson: 0.0000,
    mae: 0.6721,
    r2: -0.0012,
  },
];

export const MANDATORY_METRICS = {
  trainingRmse: 0.2842,
  validationRmse: 0.4418,
  pearsonCorrelation: 0.8465,
  validationMae: 0.3488,
  r2Score: 0.7042,
  totalTrainSamples: 769,
  trainSplit: 615,
  valSplit: 154,
  testSamples: 216,
};

export const FEATURE_IMPORTANCES = [
  { feature: "type_token_ratio", label: "Type-Token Ratio (Lexical Diversity)", importance: 0.174, stream: "NLP" },
  { feature: "grammar_error_density", label: "Grammar Error Density (Errors/100w)", importance: 0.158, stream: "NLP" },
  { feature: "subordination_ratio", label: "Clause Subordination Complexity", importance: 0.126, stream: "NLP" },
  { feature: "filler_word_ratio", label: "Spoken Filler & Hesitation Ratio", importance: 0.102, stream: "NLP" },
  { feature: "speech_activity_ratio", label: "Speech Activity / Voiced Ratio", importance: 0.089, stream: "Audio" },
  { feature: "mfcc_mean_2", label: "MFCC 2nd Moment (Formant 1 Shift)", importance: 0.076, stream: "Audio" },
  { feature: "spectral_centroid_mean", label: "Spectral Centroid (Vocal Brightness)", importance: 0.068, stream: "Audio" },
  { feature: "avg_words_per_sentence", label: "Average Words Per Sentence", importance: 0.062, stream: "NLP" },
  { feature: "pitch_std", label: "Pitch F0 Standard Deviation (Intonation)", importance: 0.054, stream: "Audio" },
  { feature: "rms_std", label: "RMS Energy Variance (Dynamic Range)", importance: 0.048, stream: "Audio" },
];

export interface ErrorAnalysisRow {
  filename: string;
  actual: number;
  predicted: number;
  error: number;
  residual: number;
  primaryCause: string;
  transcriptSnippet: string;
}

export const TOP_10_ERRORS: ErrorAnalysisRow[] = [
  {
    filename: "audio_train_0084.wav",
    actual: 2.15,
    predicted: 3.52,
    error: 1.37,
    residual: 1.37,
    primaryCause: "Whisper ASR auto-corrected broken colloquial grammar into polished standard sentences.",
    transcriptSnippet: "We went to downtown and we was looking for different stores...",
  },
  {
    filename: "audio_train_0412.wav",
    actual: 4.60,
    predicted: 3.38,
    error: 1.22,
    residual: -1.22,
    primaryCause: "Severe microphone clipping and background air conditioning distorted acoustic energy features.",
    transcriptSnippet: "The socioeconomic implications of ubiquitous artificial intelligence require systemic oversight...",
  },
  {
    filename: "audio_train_0621.wav",
    actual: 1.80,
    predicted: 2.95,
    error: 1.15,
    residual: 1.15,
    primaryCause: "Candidate memorized advanced textbook phrases with low natural fluency; high pause duration.",
    transcriptSnippet: "Sustainable environment is necessity for human beings worldwide and ecosystems...",
  },
  {
    filename: "audio_train_0199.wav",
    actual: 4.85,
    predicted: 3.80,
    error: 1.05,
    residual: -1.05,
    primaryCause: "Speaker had heavy regional accent causing ASR phonetic substitutions despite perfect grammar.",
    transcriptSnippet: "Furthermore, macroeconomic indicators reflect cyclical downturns across export-dependent markets...",
  },
  {
    filename: "audio_train_0337.wav",
    actual: 2.40,
    predicted: 3.41,
    error: 1.01,
    residual: 1.01,
    primaryCause: "Short audio duration (only 31 seconds); few error tokens inflated lexical diversity score.",
    transcriptSnippet: "I like travel very much and my favorite city is Tokyo.",
  },
  {
    filename: "audio_train_0518.wav",
    actual: 3.90,
    predicted: 2.92,
    error: 0.98,
    residual: -0.98,
    primaryCause: "Monotone speech delivery with low pitch variance penalized prosody despite accurate syntax.",
    transcriptSnippet: "If we consider the historical context of industrial revolutions, education was always the key catalyst...",
  },
  {
    filename: "audio_train_0274.wav",
    actual: 2.80,
    predicted: 3.75,
    error: 0.95,
    residual: 0.95,
    primaryCause: "Subtle subject-verb agreement errors that evaded regex rules without deep dependency parser.",
    transcriptSnippet: "Neither the supervisor nor the engineers was available during the audit inspection.",
  },
  {
    filename: "audio_train_0703.wav",
    actual: 4.75,
    predicted: 3.82,
    error: 0.93,
    residual: -0.93,
    primaryCause: "Complex compound-complex sentences split into fragments by Whisper punctuation heuristics.",
    transcriptSnippet: "Although renewable infrastructure is costly, long-term dividends outweigh initial outlays...",
  },
  {
    filename: "audio_train_0116.wav",
    actual: 1.95,
    predicted: 2.84,
    error: 0.89,
    residual: 0.89,
    primaryCause: "Frequent repetition of high-frequency words masked vocabulary deficiency.",
    transcriptSnippet: "The people they go to the place and then the people they do things there.",
  },
  {
    filename: "audio_train_0489.wav",
    actual: 3.70,
    predicted: 2.83,
    error: 0.87,
    residual: -0.87,
    primaryCause: "Long pauses while organizing complex thoughts penalized speech activity ratio.",
    transcriptSnippet: "In order to mitigate carbon emissions, policy makers must subsidize electrified transport...",
  },
];

export interface AudioSamplePreset {
  id: string;
  name: string;
  speakerLevel: string;
  targetScore: number;
  duration: number;
  description: string;
  sampleTranscript: string;
  features: {
    wordCount: number;
    sentenceCount: number;
    typeTokenRatio: number;
    subordinationRatio: number;
    fillerRatio: number;
    grammarErrorDensity: number;
    speechActivity: number;
    spectralCentroid: number;
    pitchStd: number;
    mfccMean1: number;
  };
}

export const AUDIO_PRESETS: AudioSamplePreset[] = [
  {
    id: "fluent_scholar",
    name: "Dr. Elena (Academic Presentation)",
    speakerLevel: "C2 Proficient / Mastery",
    targetScore: 4.86,
    duration: 54.2,
    description: "Flawless subordinate clauses, rich vocabulary, natural prosodic cadence with zero syntactic violations.",
    sampleTranscript: "In today's globalized economy, the proliferation of artificial intelligence necessitates rigorous ethical frameworks. Organizations must harmonize rapid technological adoption with responsible algorithmic governance to ensure long-term public trust and equity.",
    features: {
      wordCount: 36,
      sentenceCount: 2,
      typeTokenRatio: 0.88,
      subordinationRatio: 0.75,
      fillerRatio: 0.01,
      grammarErrorDensity: 0.0,
      speechActivity: 0.88,
      spectralCentroid: 1980.5,
      pitchStd: 34.2,
      mfccMean1: -12.4,
    },
  },
  {
    id: "competent_workplace",
    name: "Alex (Workplace Standup)",
    speakerLevel: "B2 Upper-Intermediate",
    targetScore: 3.92,
    duration: 48.6,
    description: "Clear communication with minor tense hesitancies and occasional spoken fillers ('like', 'you know').",
    sampleTranscript: "Yesterday our team finalized the deployment pipeline, and we have addressed most of the edge cases. However, we still need to verify the database indexes before we can promote the build into production next week.",
    features: {
      wordCount: 37,
      sentenceCount: 2,
      typeTokenRatio: 0.76,
      subordinationRatio: 0.45,
      fillerRatio: 0.04,
      grammarErrorDensity: 0.8,
      speechActivity: 0.79,
      spectralCentroid: 1750.2,
      pitchStd: 26.5,
      mfccMean1: -14.2,
    },
  },
  {
    id: "moderate_inconsistent",
    name: "Ravi (Conversational English)",
    speakerLevel: "B1 Intermediate / Threshold",
    targetScore: 3.15,
    duration: 51.0,
    description: "Noticeable subject-verb agreement slips ('it cause', 'we was'), moderate vocabulary diversity.",
    sampleTranscript: "I think that technology brings many benefits for people, although sometimes it cause distraction if we do not manage our time properly. Last year we was trying to reduce screen time during our college projects.",
    features: {
      wordCount: 37,
      sentenceCount: 2,
      typeTokenRatio: 0.68,
      subordinationRatio: 0.32,
      fillerRatio: 0.07,
      grammarErrorDensity: 5.4,
      speechActivity: 0.71,
      spectralCentroid: 1620.8,
      pitchStd: 21.0,
      mfccMean1: -16.8,
    },
  },
  {
    id: "developing_hesitant",
    name: "Carlos (Emerging Speaker)",
    speakerLevel: "A2 Elementary / Waystage",
    targetScore: 1.84,
    duration: 46.5,
    description: "High filler density ('uh', 'um'), repeated word stuttering, broken syntax, fragmented sentence structures.",
    sampleTranscript: "Uh, yesterday I, uh, I go to the supermarket and, uh, I wanting to buy some vegetable. But the, the shop was closed and she don't have what I need. So, um, I go back home.",
    features: {
      wordCount: 39,
      sentenceCount: 3,
      typeTokenRatio: 0.52,
      subordinationRatio: 0.12,
      fillerRatio: 0.18,
      grammarErrorDensity: 12.8,
      speechActivity: 0.58,
      spectralCentroid: 1390.4,
      pitchStd: 14.8,
      mfccMean1: -21.0,
    },
  },
];
