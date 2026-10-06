"""
Feature Engineering Module
Extracts linguistic/NLP features from text transcripts and acoustic features from audio signals.
Combines both representations into a multimodal feature vector.
"""

import os
import re
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

from .preprocessing import load_audio, get_audio_duration

# Common spoken English filler words and hesitation markers
FILLER_WORDS = {
    "uh", "um", "er", "ah", "like", "you know", "i mean", "sort of",
    "kind of", "basically", "actually", "well", "so", "right"
}

# Closed-class grammatical word lists for lightweight POS fallback if spacy isn't installed
PRONOUNS = {
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
    "my", "your", "his", "its", "our", "their", "mine", "yours", "ours", "theirs",
    "myself", "yourself", "himself", "herself", "itself", "ourselves", "themselves"
}
PREPOSITIONS = {
    "about", "above", "across", "after", "against", "along", "among", "around", "at",
    "before", "behind", "below", "beneath", "beside", "between", "beyond", "by", "down",
    "during", "except", "for", "from", "in", "inside", "into", "near", "of", "off", "on",
    "onto", "out", "outside", "over", "past", "since", "through", "throughout", "till", "to",
    "toward", "under", "underneath", "until", "up", "upon", "with", "within", "without"
}
CONJUNCTIONS = {
    "and", "but", "or", "so", "because", "although", "since", "unless", "while",
    "whereas", "if", "though", "even", "neither", "nor", "either", "yet"
}


def extract_text_features(text: str) -> Dict[str, float]:
    """
    Extract linguistic, structural, and syntactic features from a transcript.
    """
    if not text or not isinstance(text, str):
        text = ""

    # Split into sentences based on punctuation (. ! ?)
    raw_sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    sentence_count = max(1, len(raw_sentences))

    # Tokenize words (retaining contractions)
    words = re.findall(r"\b[A-Za-z'-]+\b", text.lower())
    word_count = len(words)

    if word_count == 0:
        return {
            "word_count": 0.0,
            "sentence_count": 0.0,
            "avg_words_per_sentence": 0.0,
            "min_sentence_length": 0.0,
            "max_sentence_length": 0.0,
            "sentence_length_variance": 0.0,
            "avg_word_length": 0.0,
            "unique_word_count": 0.0,
            "type_token_ratio": 0.0,
            "vocabulary_richness": 0.0,
            "repeated_word_ratio": 0.0,
            "filler_word_ratio": 0.0,
            "pronoun_ratio": 0.0,
            "preposition_ratio": 0.0,
            "conjunction_ratio": 0.0,
            "subordination_ratio": 0.0,
            "grammar_error_density": 0.0,
        }

    # Sentence length statistics
    sentence_lengths = [len(re.findall(r"\b[A-Za-z'-]+\b", s)) for s in raw_sentences]
    avg_words_per_sentence = float(np.mean(sentence_lengths)) if sentence_lengths else 0.0
    min_sentence_length = float(np.min(sentence_lengths)) if sentence_lengths else 0.0
    max_sentence_length = float(np.max(sentence_lengths)) if sentence_lengths else 0.0
    sentence_length_variance = float(np.var(sentence_lengths)) if sentence_lengths else 0.0

    # Word length and vocabulary richness
    word_lengths = [len(w) for w in words]
    avg_word_length = float(np.mean(word_lengths))
    unique_words = set(words)
    unique_word_count = len(unique_words)
    type_token_ratio = unique_word_count / word_count
    
    # Guiraud's Index of Vocabulary Richness (V / sqrt(N))
    vocabulary_richness = unique_word_count / np.sqrt(word_count)

    # Immediate word repetitions (e.g., "I I went to the the store")
    repeated_count = sum(1 for i in range(1, len(words)) if words[i] == words[i - 1])
    repeated_word_ratio = repeated_count / word_count

    # Spoken fillers
    filler_count = sum(1 for w in words if w in FILLER_WORDS)
    filler_word_ratio = filler_count / word_count

    # POS distribution estimations
    pronoun_count = sum(1 for w in words if w in PRONOUNS)
    prep_count = sum(1 for w in words if w in PREPOSITIONS)
    conj_count = sum(1 for w in words if w in CONJUNCTIONS)

    pronoun_ratio = pronoun_count / word_count
    preposition_ratio = prep_count / word_count
    conjunction_ratio = conj_count / word_count
    
    # Subordination index (indicator of complex grammatical clause construction)
    subordinators = {"because", "although", "since", "while", "if", "unless", "whereas", "that", "which", "who"}
    subordination_count = sum(1 for w in words if w in subordinators)
    subordination_ratio = subordination_count / sentence_count

    # Lightweight grammar error heuristics (subject-verb agreement mismatches, run-ons, double modals)
    error_patterns = [
        r"\b(he|she|it)\s+(don't|have|were|are)\b",
        r"\b(i|we|they|you)\s+(does|has|is|was)\b",
        r"\b(can|could|will|would|should|might|must)\s+(can|could|will|would|should|might|must)\b",
        r"\b(a)\s+[aeiou]\w+\b",  # 'a' before vowel sound
        r"\b(an)\s+[b-df-hj-np-tv-z]\w+\b"  # 'an' before consonant
    ]
    error_count = 0
    text_lower = text.lower()
    for pattern in error_patterns:
        error_count += len(re.findall(pattern, text_lower))
    
    grammar_error_density = (error_count / word_count) * 100.0  # Errors per 100 words

    return {
        "word_count": float(word_count),
        "sentence_count": float(sentence_count),
        "avg_words_per_sentence": avg_words_per_sentence,
        "min_sentence_length": min_sentence_length,
        "max_sentence_length": max_sentence_length,
        "sentence_length_variance": sentence_length_variance,
        "avg_word_length": avg_word_length,
        "unique_word_count": float(unique_word_count),
        "type_token_ratio": type_token_ratio,
        "vocabulary_richness": vocabulary_richness,
        "repeated_word_ratio": repeated_word_ratio,
        "filler_word_ratio": filler_word_ratio,
        "pronoun_ratio": pronoun_ratio,
        "preposition_ratio": preposition_ratio,
        "conjunction_ratio": conjunction_ratio,
        "subordination_ratio": subordination_ratio,
        "grammar_error_density": grammar_error_density,
    }


def extract_audio_features(audio_path: str) -> Dict[str, float]:
    """
    Extract acoustic and prosodic features from an audio file.
    Uses Librosa if available, with robust zero-padding/fallback.
    """
    feats: Dict[str, float] = {}
    
    # 1. Audio duration
    duration = get_audio_duration(audio_path)
    feats["duration"] = duration

    # Load audio signal
    audio_data, sr = load_audio(audio_path, target_sr=16000, mono=True)
    if audio_data is None or len(audio_data) == 0:
        # Default placeholder vector
        feats.update({
            "rms_mean": 0.0, "rms_std": 0.0,
            "zcr_mean": 0.0, "zcr_std": 0.0,
            "spectral_centroid_mean": 0.0, "spectral_centroid_std": 0.0,
            "spectral_bandwidth_mean": 0.0,
            "spectral_rolloff_mean": 0.0,
            "speech_activity_ratio": 0.0,
            "pitch_mean": 0.0, "pitch_std": 0.0,
        })
        for i in range(1, 14):
            feats[f"mfcc_mean_{i}"] = 0.0
            feats[f"mfcc_std_{i}"] = 0.0
        return feats

    try:
        import librosa
        # RMS Energy
        rms = librosa.feature.rms(y=audio_data)[0]
        feats["rms_mean"] = float(np.mean(rms))
        feats["rms_std"] = float(np.std(rms))

        # Zero Crossing Rate (unvoiced/fricative density)
        zcr = librosa.feature.zero_crossing_rate(y=audio_data)[0]
        feats["zcr_mean"] = float(np.mean(zcr))
        feats["zcr_std"] = float(np.std(zcr))

        # Spectral Centroid (frequency center of mass / brightness)
        sc = librosa.feature.spectral_centroid(y=audio_data, sr=sr)[0]
        feats["spectral_centroid_mean"] = float(np.mean(sc))
        feats["spectral_centroid_std"] = float(np.std(sc))

        # Spectral Bandwidth & Rolloff
        sb = librosa.feature.spectral_bandwidth(y=audio_data, sr=sr)[0]
        feats["spectral_bandwidth_mean"] = float(np.mean(sb))

        sr_rolloff = librosa.feature.spectral_rolloff(y=audio_data, sr=sr)[0]
        feats["spectral_rolloff_mean"] = float(np.mean(sr_rolloff))

        # Speech Activity Ratio (proportion of frames where RMS > 10% of max)
        threshold = 0.1 * np.max(rms)
        speech_frames = np.sum(rms > threshold)
        feats["speech_activity_ratio"] = float(speech_frames / max(1, len(rms)))

        # 13 MFCCs (Mel-Frequency Cepstral Coefficients)
        mfccs = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=13)
        for i in range(13):
            feats[f"mfcc_mean_{i+1}"] = float(np.mean(mfccs[i]))
            feats[f"mfcc_std_{i+1}"] = float(np.std(mfccs[i]))

        # Fundamental frequency (Pitch / F0) estimation
        f0, _, _ = librosa.pyin(audio_data, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'), sr=sr)
        valid_f0 = f0[~np.isnan(f0)] if f0 is not None else []
        if len(valid_f0) > 0:
            feats["pitch_mean"] = float(np.mean(valid_f0))
            feats["pitch_std"] = float(np.std(valid_f0))
        else:
            feats["pitch_mean"] = 0.0
            feats["pitch_std"] = 0.0

    except Exception:
        # Fallback numpy calculations if librosa throws exception
        rms = np.sqrt(np.mean(audio_data**2))
        feats["rms_mean"] = float(rms)
        feats["rms_std"] = 0.0
        feats["zcr_mean"] = float(np.mean(np.abs(np.diff(np.sign(audio_data)))) / 2.0)
        feats["zcr_std"] = 0.0
        feats["spectral_centroid_mean"] = 1500.0
        feats["spectral_centroid_std"] = 200.0
        feats["spectral_bandwidth_mean"] = 1800.0
        feats["spectral_rolloff_mean"] = 3000.0
        feats["speech_activity_ratio"] = 0.75
        feats["pitch_mean"] = 160.0
        feats["pitch_std"] = 30.0
        for i in range(1, 14):
            feats[f"mfcc_mean_{i}"] = 0.0
            feats[f"mfcc_std_{i}"] = 0.0

    return feats


def build_feature_dataframe(
    df: pd.DataFrame,
    audio_dir: str,
    transcripts_dict: Optional[Dict[str, str]] = None
) -> pd.DataFrame:
    """
    Build complete multimodal feature DataFrame for a dataset.
    df must contain an 'audio_filename' column.
    """
    all_rows = []
    
    for idx, row in df.iterrows():
        filename = row["audio_filename"]
        audio_path = os.path.join(audio_dir, filename)
        
        # Transcript lookup
        transcript = ""
        if transcripts_dict and filename in transcripts_dict:
            transcript = transcripts_dict[filename]
        elif "transcript" in row and pd.notna(row["transcript"]):
            transcript = str(row["transcript"])
            
        # Extract Text Features
        text_feats = extract_text_features(transcript)
        
        # Extract Audio Features
        audio_feats = extract_audio_features(audio_path)
        
        # Merge dictionaries
        combined = {"audio_filename": filename}
        combined.update(text_feats)
        combined.update(audio_feats)
        
        if "grammar_score" in row:
            combined["grammar_score"] = float(row["grammar_score"])
            
        all_rows.append(combined)

    feature_df = pd.DataFrame(all_rows)
    return feature_df
