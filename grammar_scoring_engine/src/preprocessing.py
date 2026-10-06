"""
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
    
    Args:
        file_path: Path to the .wav audio file.
        target_sr: Target sampling rate in Hz (default 16000 for Whisper).
        mono: Whether to downmix multi-channel audio to single-channel mono.
        
    Returns:
        (audio_array, sample_rate) or (None, 0) if reading fails.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    try:
        # Prefer soundfile for fast I/O
        data, sr = sf.read(file_path, dtype="float32")
        
        # Convert stereo/multichannel to mono
        if mono and data.ndim > 1:
            data = np.mean(data, axis=1)

        # Resample if sample rate doesn't match
        if sr != target_sr and librosa is not None:
            data = librosa.resample(data, orig_sr=sr, target_sr=target_sr)
            sr = target_sr
            
        # Peak normalization to [-1, 1] avoiding zero division
        max_val = np.max(np.abs(data))
        if max_val > 1e-6:
            data = data / max_val
            
        return data, sr

    except Exception as e:
        # Fallback to librosa if soundfile fails on non-standard WAV headers
        if librosa is not None:
            try:
                data, sr = librosa.load(file_path, sr=target_sr, mono=mono)
                max_val = np.max(np.abs(data))
                if max_val > 1e-6:
                    data = data / max_val
                return data, sr
            except Exception as inner_e:
                print(f"[WARN] Failed to load {file_path}: {inner_e}")
                return None, 0
        else:
            print(f"[WARN] Failed to load {file_path}: {e}")
            return None, 0


def get_audio_duration(file_path: str) -> float:
    """
    Quickly retrieve audio duration in seconds without loading raw signal into memory.
    """
    if not os.path.exists(file_path):
        return 0.0
    try:
        info = sf.info(file_path)
        return float(info.duration)
    except Exception:
        # Fallback using librosa
        if librosa is not None:
            try:
                return float(librosa.get_duration(path=file_path))
            except Exception:
                return 0.0
        return 0.0


def validate_audio(file_path: str, min_duration: float = 5.0, max_duration: float = 120.0) -> bool:
    """
    Validate that an audio file exists, has a valid header, and duration is within bounds.
    """
    if not os.path.exists(file_path):
        return False
    duration = get_audio_duration(file_path)
    return min_duration <= duration <= max_duration
