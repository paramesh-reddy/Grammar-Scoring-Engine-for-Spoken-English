"""
Evaluation Module
Implements Kaggle competition evaluation metrics: RMSE, Pearson Correlation,
MAE, R2, and residual error analysis.
"""

from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from scipy.stats import pearsonr


def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Calculate Kaggle challenge primary metrics (RMSE, Pearson r) and supplementary metrics (MAE, R2).
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)

    # Compute Root Mean Squared Error
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    
    # Compute Pearson Correlation coefficient
    if np.all(y_pred == y_pred[0]) or np.all(y_true == y_true[0]):
        pearson_corr = 0.0
    else:
        corr_val, _ = pearsonr(y_true, y_pred)
        pearson_corr = float(corr_val)

    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))

    return {
        "rmse": rmse,
        "pearson": pearson_corr,
        "mae": mae,
        "r2": r2
    }


def print_evaluation_summary(metrics: Dict[str, float], title: str = "VALIDATION"):
    """
    Print formatted evaluation banner matching the challenge notebook requirement.
    """
    print("=" * 40)
    print(f"FINAL {title.upper()} RESULTS")
    print("=" * 40)
    print(f"RMSE:                {metrics['rmse']:.4f}")
    print(f"Pearson Correlation: {metrics['pearson']:.4f}")
    print(f"MAE:                 {metrics['mae']:.4f}")
    print(f"R²:                  {metrics['r2']:.4f}")
    print("=" * 40)


def perform_error_analysis(
    df_val: pd.DataFrame,
    y_true: np.ndarray,
    y_pred: np.ndarray,
    top_n: int = 10
) -> pd.DataFrame:
    """
    Identify and diagnose the top N worst predictions sorted by absolute error.
    """
    analysis_df = pd.DataFrame({
        "audio_filename": df_val["audio_filename"].values if "audio_filename" in df_val else [f"sample_{i}.wav" for i in range(len(y_true))],
        "actual_score": np.round(y_true, 3),
        "predicted_score": np.round(y_pred, 3),
        "absolute_error": np.round(np.abs(y_true - y_pred), 3),
        "residual": np.round(y_pred - y_true, 3)
    })

    if "transcript" in df_val.columns:
        analysis_df["transcript"] = df_val["transcript"].values

    top_errors = analysis_df.sort_values(by="absolute_error", ascending=False).head(top_n).reset_index(drop=True)
    return top_errors
