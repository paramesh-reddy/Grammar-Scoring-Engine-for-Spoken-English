"""
Speech-to-Text Transcription Module
Wraps OpenAI Whisper with local disk caching to prevent redundant STT computation.
"""

import os
import json
from typing import Dict, Optional, List
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
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    self.cache = json.load(f)
                print(f"[INFO] Loaded {len(self.cache)} cached transcripts from {self.cache_file}")
            except Exception as e:
                print(f"[WARN] Could not load transcript cache: {e}")
                self.cache = {}

    def _save_cache(self):
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[WARN] Failed to write transcript cache: {e}")

    def _load_model(self):
        if self.model is None:
            try:
                import torch
                import whisper
                device = "cuda" if torch.cuda.is_available() else "cpu"
                print(f"[INFO] Loading Whisper ({self.model_name}) on device: {device}...")
                self.model = whisper.load_model(self.model_name, device=device)
            except Exception as e:
                print(f"[ERROR] Whisper initialization failed: {e}")
                raise

    def transcribe(self, audio_path: str, force_recompute: bool = False) -> str:
        """
        Transcribe a single audio file. Uses cache if available.
        """
        filename = os.path.basename(audio_path)
        if not force_recompute and filename in self.cache:
            return self.cache[filename]

        if not os.path.exists(audio_path):
            return ""

        self._load_model()
        try:
            result = self.model.transcribe(
                audio_path,
                language="en",
                temperature=0.0,
                fp16=False if getattr(self.model, "device", "cpu") == "cpu" else True
            )
            text = result.get("text", "").strip()
            self.cache[filename] = text
            self._save_cache()
            return text
        except Exception as e:
            print(f"[WARN] Transcription failed for {filename}: {e}")
            return ""

    def batch_transcribe(
        self,
        audio_paths: List[str],
        force_recompute: bool = False
    ) -> pd.DataFrame:
        """
        Transcribe a batch of audio files with progress tracking.
        """
        results = []
        for path in tqdm(audio_paths, desc="Transcribing audio files"):
            filename = os.path.basename(path)
            transcript = self.transcribe(path, force_recompute=force_recompute)
            results.append({"audio_filename": filename, "transcript": transcript})

        return pd.DataFrame(results)
