export interface CodeFile {
  id: string;
  filename: string;
  path: string;
  description: string;
  language: string;
  code: string;
}

export const CODE_FILES: CodeFile[] = [
  {
    id: "preprocessing",
    filename: "preprocessing.py",
    path: "src/preprocessing.py",
    description: "Audio downmixing to mono, 16kHz resampling, duration validation, and amplitude normalization.",
    language: "python",
    code: `"""
Audio Preprocessing Module
Handles reliable loading, validation, mono conversion, and sample-rate normalization.
"""

import os
from typing import Tuple, Optional
import numpy as np
import soundfile as sf

try:
    import librosa
except ImportError:
    librosa = None


def load_audio(
    file_path: str,
    target_sr: int = 16000,
    mono: bool = True
) -> Tuple[Optional[np.ndarray], int]:
    """
    Safely load an audio file, convert to mono, and resample to target_sr.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    try:
        data, sr = sf.read(file_path, dtype="float32")
        if mono and data.ndim > 1:
            data = np.mean(data, axis=1)

        if sr != target_sr and librosa is not None:
            data = librosa.resample(data, orig_sr=sr, target_sr=target_sr)
            sr = target_sr
            
        max_val = np.max(np.abs(data))
        if max_val > 1e-6:
            data = data / max_val
            
        return data, sr
    except Exception as e:
        if librosa is not None:
            data, sr = librosa.load(file_path, sr=target_sr, mono=mono)
            return data, sr
        return None, 0


def get_audio_duration(file_path: str) -> float:
    """Quickly retrieve audio duration in seconds without loading raw signal."""
    if not os.path.exists(file_path):
        return 0.0
    try:
        info = sf.info(file_path)
        return float(info.duration)
    except Exception:
        return 0.0


def validate_audio(file_path: str, min_duration: float = 5.0, max_duration: float = 120.0) -> bool:
    """Check existence, header validity, and duration boundaries."""
    if not os.path.exists(file_path):
        return False
    duration = get_audio_duration(file_path)
    return min_duration <= duration <= max_duration
`
  },
  {
    id: "transcription",
    filename: "transcription.py",
    path: "src/transcription.py",
    description: "Whisper ASR pipeline with local disk caching to prevent re-computation.",
    language: "python",
    code: `"""
Speech-to-Text Transcription Module
Wraps OpenAI Whisper with local disk caching to prevent redundant STT computation.
"""

import os
import json
from typing import Dict, List
import pandas as pd
from tqdm import tqdm


class WhisperTranscriber:
    """
    OpenAI Whisper transcriber with disk caching and hardware detection.
    """

    def __init__(self, model_name: str = "base", cache_dir: str = "./cache"):
        self.model_name = model_name
        self.cache_dir = cache_dir
        self.cache_file = os.path.join(cache_dir, f"transcripts_{model_name}.json")
        self.cache: Dict[str, str] = {}
        self.model = None

        os.makedirs(self.cache_dir, exist_ok=True)
        self._load_cache()

    def _load_cache(self):
        if os.path.exists(self.cache_file):
            with open(self.cache_file, "r", encoding="utf-8") as f:
                self.cache = json.load(f)

    def _save_cache(self):
        with open(self.cache_file, "w", encoding="utf-8") as f:
            json.dump(self.cache, f, indent=2, ensure_ascii=False)

    def _load_model(self):
        if self.model is None:
            import torch
            import whisper
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model = whisper.load_model(self.model_name, device=device)

    def transcribe(self, audio_path: str, force_recompute: bool = False) -> str:
        filename = os.path.basename(audio_path)
        if not force_recompute and filename in self.cache:
            return self.cache[filename]

        self._load_model()
        result = self.model.transcribe(audio_path, language="en", temperature=0.0)
        text = result.get("text", "").strip()
        self.cache[filename] = text
        self._save_cache()
        return text
`
  },
  {
    id: "features",
    filename: "features.py",
    path: "src/features.py",
    description: "Linguistic (TTR, clause subordination, error density) and acoustic (MFCCs, Spectral Centroid, Energy) extraction.",
    language: "python",
    code: `"""
Feature Engineering Module
Extracts linguistic/NLP features from text transcripts and acoustic features from audio signals.
Combines both representations into a multimodal feature vector.
"""

import re
import numpy as np
import pandas as pd

FILLER_WORDS = {"uh", "um", "er", "ah", "like", "you know", "i mean", "basically", "actually"}
PRONOUNS = {"i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them"}
CONJUNCTIONS = {"and", "but", "or", "so", "because", "although", "since", "unless", "while"}


def extract_text_features(text: str) -> dict:
    if not text:
        return {k: 0.0 for k in ["word_count", "sentence_count", "type_token_ratio", "grammar_error_density"]}

    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    sentence_count = max(1, len(sentences))
    words = re.findall(r"\\b[A-Za-z'-]+\\b", text.lower())
    word_count = len(words)

    if word_count == 0:
        return {}

    unique_words = set(words)
    type_token_ratio = len(unique_words) / word_count
    vocabulary_richness = len(unique_words) / np.sqrt(word_count)
    filler_ratio = sum(1 for w in words if w in FILLER_WORDS) / word_count

    # Grammar error heuristics
    error_patterns = [
        r"\\b(he|she|it)\\s+(don't|have|were|are)\\b",
        r"\\b(i|we|they|you)\\s+(does|has|is|was)\\b",
        r"\\b(a)\\s+[aeiou]\\w+\\b",
        r"\\b(an)\\s+[b-df-hj-np-tv-z]\\w+\\b"
    ]
    error_count = sum(len(re.findall(p, text.lower())) for p in error_patterns)
    grammar_error_density = (error_count / word_count) * 100.0

    return {
        "word_count": float(word_count),
        "sentence_count": float(sentence_count),
        "type_token_ratio": float(type_token_ratio),
        "vocabulary_richness": float(vocabulary_richness),
        "filler_word_ratio": float(filler_ratio),
        "grammar_error_density": float(grammar_error_density)
    }
`
  },
  {
    id: "model",
    filename: "model.py",
    path: "src/model.py",
    description: "Ensemble modeling, candidate regressors, and domain score clipping [0.0, 5.0].",
    language: "python",
    code: `"""
Modeling Module
Implements baseline, tree regressors, gradient boosting, ensembling,
and continuous score clipping [0.0, 5.0].
"""

import numpy as np
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import (
    RandomForestRegressor,
    ExtraTreesRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor
)


class WeightedEnsembleRegressor:
    """
    Weighted ensemble of top regression models with automatic [0, 5] continuous clipping.
    """

    def __init__(self, models: list, weights: list = None):
        self.models = models
        if weights is None:
            self.weights = [1.0 / len(models)] * len(models)
        else:
            total_weight = sum(weights)
            self.weights = [w / total_weight for w in weights]

    def fit(self, X, y):
        for model in self.models:
            model.fit(X, y)
        return self

    def predict(self, X) -> np.ndarray:
        preds = np.zeros(len(X))
        for model, weight in zip(self.models, self.weights):
            preds += weight * model.predict(X)
        # Continuous target score domain clipping strictly between 0 and 5
        return np.clip(preds, 0.0, 5.0)
`
  },
  {
    id: "evaluation",
    filename: "evaluation.py",
    path: "src/evaluation.py",
    description: "Kaggle RMSE and Pearson Correlation evaluation, residual plots, and top 10 error diagnosis.",
    language: "python",
    code: `"""
Evaluation Module
Implements Kaggle competition evaluation metrics: RMSE, Pearson Correlation,
MAE, R2, and residual error analysis.
"""

import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from scipy.stats import pearsonr


def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    if np.all(y_pred == y_pred[0]):
        pearson_corr = 0.0
    else:
        pearson_corr = float(pearsonr(y_true, y_pred)[0])
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))

    return {
        "rmse": rmse,
        "pearson": pearson_corr,
        "mae": mae,
        "r2": r2
    }


def print_evaluation_summary(metrics: dict, title: str = "VALIDATION"):
    print("=" * 40)
    print(f"FINAL {title.upper()} RESULTS")
    print("=" * 40)
    print(f"RMSE:                {metrics['rmse']:.4f}")
    print(f"Pearson Correlation: {metrics['pearson']:.4f}")
    print(f"MAE:                 {metrics['mae']:.4f}")
    print(f"R²:                  {metrics['r2']:.4f}")
    print("=" * 40)
`
  }
];
