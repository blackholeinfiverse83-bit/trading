#!/usr/bin/env python3
"""
Quick script to train models for common symbols
"""
import requests
import sys
import time

BASE_URL = "http://127.0.0.1:8000"

def train_model(symbol, horizon='intraday', n_episodes=10):
    """Train a model for a symbol"""
    print(f"\nTraining model for {symbol} ({horizon})...")
    print("This may take 60-90 seconds...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/tools/train_rl",
            json={
                "symbol": symbol,
                "horizon": horizon,
                "n_episodes": n_episodes,
                "force_retrain": False
            },
            timeout=120  # 2 minutes timeout for training
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Training completed for {symbol}!")
            if 'message' in data:
                print(f"   {data['message']}")
            return True
        else:
            print(f"❌ Training failed: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"⏱️  Training is taking longer than expected for {symbol}")
        print("   This is normal - training can take 60-90 seconds per symbol")
        return False
    except Exception as e:
        print(f"❌ Error training {symbol}: {e}")
        return False

def main():
    # Common symbols to train
    symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']
    horizon = 'intraday'
    
    print("="*60)
    print("MODEL TRAINING SCRIPT")
    print("="*60)
    print(f"Training models for: {', '.join(symbols)}")
    print(f"Horizon: {horizon}")
    print("="*60)
    
    if len(sys.argv) > 1:
        # Train specific symbol from command line
        symbol = sys.argv[1].upper()
        train_model(symbol, horizon)
    else:
        # Train all common symbols
        for symbol in symbols:
            success = train_model(symbol, horizon)
            if success:
                time.sleep(2)  # Brief pause between trainings
            else:
                print(f"⚠️  Continuing with next symbol...")
    
    print("\n" + "="*60)
    print("Training complete!")
    print("="*60)

if __name__ == "__main__":
    main()

