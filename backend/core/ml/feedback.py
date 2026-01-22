"""
This module handles user feedback for model fine-tuning and validation.
"""
import logging
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Directory configuration
DATA_DIR = Path("data")
LOGS_DIR = DATA_DIR / "logs"

# Create directories if they don't exist
for directory in [LOGS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


def provide_feedback(
    symbol: str,
    predicted_action: str,
    user_feedback: str,
    actual_return: Optional[float] = None
) -> Dict[str, Any]:
    """
    Process user feedback for model fine-tuning and validation.
    
    This function stores user feedback in memory and can be used to
    improve model predictions through reinforcement learning.
    
    Args:
        symbol: Stock symbol (e.g., "AAPL")
        predicted_action: Predicted action ("LONG", "SHORT", or "HOLD")
        user_feedback: User's feedback ("correct" or "incorrect")
        actual_return: Actual return percentage (optional)
    
    Returns:
        Dict with feedback processing status and statistics
    """
    try:
        # Validate inputs
        if not symbol or not isinstance(symbol, str):
            return {
                'status': 'error',
                'error': 'Invalid symbol',
                'validation_warning': 'Symbol must be a non-empty string',
                'suggested_feedback': None
            }
        
        if predicted_action.upper() not in ['LONG', 'SHORT', 'HOLD']:
            return {
                'status': 'error',
                'error': 'Invalid predicted action',
                'validation_warning': f'Action must be LONG, SHORT, or HOLD. Got: {predicted_action}',
                'suggested_feedback': None
            }
        
        if user_feedback.lower() not in ['correct', 'incorrect']:
            return {
                'status': 'error',
                'error': 'Invalid feedback',
                'validation_warning': f'Feedback must be "correct" or "incorrect". Got: {user_feedback}',
                'suggested_feedback': None
            }
        
        # Create feedback record
        feedback_record = {
            'symbol': symbol.upper(),
            'predicted_action': predicted_action.upper(),
            'user_feedback': user_feedback.lower(),
            'actual_return': actual_return,
            'timestamp': datetime.now().isoformat()
        }
        
        # Log the feedback
        feedback_log_path = LOGS_DIR / 'user_feedback.jsonl'
        with open(feedback_log_path, 'a') as f:
            f.write(json.dumps(feedback_record) + '\n')
        
        # Calculate statistics
        is_correct = user_feedback.lower() == 'correct'
        
        return {
            'status': 'success',
            'message': f'Feedback recorded for {symbol}: {user_feedback}',
            'symbol': symbol.upper(),
            'predicted_action': predicted_action.upper(),
            'user_feedback': user_feedback.lower(),
            'actual_return': actual_return,
            'is_correct': is_correct,
            'timestamp': datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error processing feedback: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'validation_warning': f'Error processing feedback: {str(e)}',
            'suggested_feedback': None
        }


def load_feedback_memory(symbol: Optional[str] = None) -> Dict[str, Any]:
    """
    Load feedback history from storage.
    
    Args:
        symbol: Optional symbol to filter feedback for. If None, loads all feedback.
    
    Returns:
        Dict with feedback statistics and history
    """
    try:
        feedback_log_path = LOGS_DIR / 'user_feedback.jsonl'
        
        if not feedback_log_path.exists():
            return {
                'status': 'success',
                'total_feedback': 0,
                'correct_predictions': 0,
                'incorrect_predictions': 0,
                'accuracy': 0.0,
                'feedback_records': []
            }
        
        # Load all feedback records
        feedback_records = []
        with open(feedback_log_path, 'r') as f:
            for line in f:
                try:
                    record = json.loads(line.strip())
                    if symbol is None or record.get('symbol') == symbol.upper():
                        feedback_records.append(record)
                except json.JSONDecodeError:
                    continue
        
        # Calculate statistics
        total = len(feedback_records)
        correct = sum(1 for r in feedback_records if r.get('user_feedback') == 'correct')
        incorrect = total - correct
        accuracy = (correct / total * 100) if total > 0 else 0.0
        
        return {
            'status': 'success',
            'symbol': symbol,
            'total_feedback': total,
            'correct_predictions': correct,
            'incorrect_predictions': incorrect,
            'accuracy': round(accuracy, 2),
            'feedback_records': feedback_records[-100:]  # Return last 100 records
        }
    
    except Exception as e:
        logger.error(f"Error loading feedback memory: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'feedback_records': []
        }
