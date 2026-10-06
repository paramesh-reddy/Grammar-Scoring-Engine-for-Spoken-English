"""
Modeling Module
Implements baseline, tree regressors, gradient boosting, ensembling,
and continuous score clipping [0.0, 5.0].
"""

from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import (
    RandomForestRegressor,
    ExtraTreesRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


def get_candidate_models(random_state: int = 42) -> Dict[str, Any]:
    """
    Returns a dictionary of regression models for benchmark comparison.
    """
    return {
        "Dummy Mean Baseline": DummyRegressor(strategy="mean"),
        "Random Forest": RandomForestRegressor(
            n_estimators=150,
            max_depth=8,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1
        ),
        "Extra Trees": ExtraTreesRegressor(
            n_estimators=150,
            max_depth=8,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=120,
            learning_rate=0.05,
            max_depth=4,
            subsample=0.85,
            random_state=random_state
        ),
        "HistGradientBoosting": HistGradientBoostingRegressor(
            max_iter=120,
            learning_rate=0.05,
            max_depth=5,
            l2_regularization=0.5,
            random_state=random_state
        )
    }


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


def clip_predictions(predictions: np.ndarray, min_val: float = 0.0, max_val: float = 5.0) -> np.ndarray:
    """
    Enforce domain constraints for continuous grammar scoring.
    Does not round to integers; preserves continuous granularity (e.g., 4.12).
    """
    return np.clip(predictions, min_val, max_val)
