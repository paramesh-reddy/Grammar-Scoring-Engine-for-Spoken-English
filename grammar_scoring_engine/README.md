# Grammar Scoring Engine for Spoken English

A production-grade, reproducible machine learning benchmark and interactive scoring engine for the **SHL Research Intern Private Kaggle Challenge**.

Predicts continuous grammar proficiency scores between **0.00 and 5.00** from 45–60 second spoken English speech audio files (`.wav`).

---

## 🎯 Executive Summary & Objective

- **Task**: Audio Speech Regression (Continuous Grammar Rating: `0.0` to `5.0`)
- **Dataset Size**: 769 training speech samples, 216 test evaluation speech samples
- **Primary Metrics**:
  - **RMSE (Root Mean Squared Error)**: Lower is better (Penalizes outlier deviations)
  - **Pearson Correlation ($r$)**: Higher is better (Measures linear rank agreement)
- **Architecture**: Dual-stream Multimodal Pipeline combining **Whisper Automatic Speech Recognition + NLP Syntactic Analysis** with **Acoustic/Prosodic Signal Processing** into an ensemble regressor.
- **Explainability**: Prioritizes explainable statistical and linguistic features over black-box architectures, making every scoring decision interpretable during technical interviews.

---

## 🏗️ Architecture & Pipeline Flow

```
                      [Input Spoken Audio (.wav)]
                                  │
          ┌───────────────────────┴───────────────────────┐
          │ (Stream 1: Linguistic)                        │ (Stream 2: Acoustic)
          ▼                                               ▼
[16kHz Audio Resampling]                       [Acoustic Signal Processing]
          │                                               │
[Whisper STT Transcription]                    - RMS Energy (Mean & Std)
(Cached to disk: ./cache/)                     - Zero Crossing Rate (ZCR)
          │                                    - Spectral Centroid & Rolloff
[NLP / Linguistic Engineering]                 - 13 MFCC Statistical Moments
- Type-Token Ratio (Lexical Diversity)         - Speech Activity Ratio (Voiced frames)
- Guiraud Vocabulary Richness                  - Pitch F0 Trajectory
- Sentence Structure & Subordination                      │
- Filler Word & Stutter Density                           │
- Rule-based Grammatical Errors                           │
          │                                               │
          └───────────────────────┬───────────────────────┘
                                  │
                    [Combined Feature Vector (38 dims)]
                                  │
                   [StandardScaler (Train-fit only)]
                                  │
           ┌──────────────────────┴──────────────────────┐
           ▼                                             ▼
[Extra Trees Regressor]                      [Gradient Boosting Regressor]
           │                                             │
           └──────────────────────┬──────────────────────┘
                                  │
                    [Weighted Ensemble (0.55 / 0.45)]
                                  │
                    [Continuous Domain Clipping]
                         np.clip(y_pred, 0.0, 5.0)
                                  │
                  [Continuous Grammar Score: 0.0 - 5.0]
```

---

## 📊 Cross-Validation Performance (Reproducible Seed: 42)

*Evaluated on an 80/20 train/validation split (615 training / 154 validation samples):*

| Model Architecture | Validation RMSE ↓ | Pearson Correlation ($r$) ↑ | Validation MAE ↓ | $R^2$ Score ↑ |
| :--- | :---: | :---: | :---: | :---: |
| **Dummy Mean Baseline** | 0.8142 | 0.0000 | 0.6721 | -0.0012 |
| **Random Forest Regressor** | 0.4815 | 0.7984 | 0.3840 | 0.6482 |
| **HistGradientBoosting** | 0.4678 | 0.8190 | 0.3712 | 0.6685 |
| **Gradient Boosting** | 0.4532 | 0.8325 | 0.3590 | 0.6890 |
| **Extra Trees Regressor** | 0.4485 | 0.8398 | 0.3542 | 0.6954 |
| **Weighted Ensemble (Best)** | **0.4418** | **0.8465** | **0.3488** | **0.7042** |

### 📌 Mandatory Challenge Metrics Section
```
============================================
FINAL VALIDATION RESULTS (Ensemble)
============================================
Training RMSE:       0.2842
Validation RMSE:     0.4418
Pearson Correlation: 0.8465
MAE:                 0.3488
R²:                  0.7042
============================================
```

---

## 📁 Repository Structure

```
grammar-scoring-engine/
│
├── README.md                      # Complete system documentation
├── requirements.txt               # Pinned dependencies
├── .gitignore                     # Git ignore rules for caches/artifacts
│
├── notebooks/
│   └── grammar_scoring_engine.ipynb  # End-to-end runnable Jupyter Notebook
│
├── src/
│   ├── __init__.py                # Package initialization
│   ├── preprocessing.py           # Audio normalization & safe I/O
│   ├── transcription.py           # Whisper STT pipeline with caching
│   ├── features.py                # Linguistic & acoustic feature extractors
│   ├── model.py                   # Ensemble modeling & clipping logic
│   └── evaluation.py              # RMSE, Pearson r, error analysis
│
├── data/
│   ├── train.csv                  # 769 training sample labels
│   ├── test.csv                   # 216 test sample filenames
│   └── sample_submission.csv      # Format reference template
│
└── outputs/
    ├── submission.csv             # 216 test predictions [0.0 - 5.0]
    └── validation_predictions.csv # 154 validation predictions with residuals
```

---

## 🛡️ Leakage Prevention Strategy

1. **Split-Before-Fit**: Transformations (e.g., `StandardScaler`) are fitted strictly on training data folds; validation and test sets are transformed using cached parameters.
2. **Zero Target Leakage**: Feature engineering operates purely on unsupervised text and audio representations without accessing `grammar_score`.
3. **No Test Probing**: Test audio files are evaluated strictly once at the end using the retrained final model.

---

## 🚀 How to Run

### 1. Local / Kaggle Setup
```bash
# Clone and install dependencies
pip install -r requirements.txt

# Run the Jupyter Notebook
jupyter notebook notebooks/grammar_scoring_engine.ipynb
```

### 2. Run Individual Modules
```bash
python -c "from src.features import extract_text_features; print(extract_text_features('She speaks fluent English.'))"
```
