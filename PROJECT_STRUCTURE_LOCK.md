# Multi-Asset Trading Dashboard - Project Structure Lock

## Current Date: January 24, 2026

This document captures the current structure of the Multi-Asset Trading Dashboard project before implementing new changes.

## Complete Project Structure

### Root Directory
```
.
├── backend/
│   ├── core/
│   │   ├── ml/
│   │   │   ├── data.py
│   │   │   ├── features.py
│   │   │   ├── feedback.py
│   │   │   └── model.py
│   │   ├── .env
│   │   ├── __init__.py
│   │   ├── mcp_adapter.py
│   │   └── mcp_tools.json
│   ├── data/
│   │   ├── cache/
│   │   ├── features/
│   │   └── logs/
│   ├── models/
│   ├── .env
│   ├── .gitignore
│   ├── README.md
│   ├── Stock_Prediction_API_No_Auth.postman_collection.json
│   ├── api_server.py
│   ├── auth.py
│   ├── auth_routes.py
│   ├── config.py
│   ├── rate_limiter.py
│   ├── requirements.txt
│   ├── server_watchdog.py
│   ├── start_backend.bat
│   ├── supabase_client.py
│   ├── test_integration.py
│   ├── train_model.py
│   └── validators.py
├── data/
│   ├── cache/
│   ├── features/
│   └── logs/
├── models/
│   ├── AAPL_intraday_dqn_agent.pt
│   ├── AAPL_intraday_dqn_features.pkl
│   ├── AAPL_intraday_features.pkl
│   ├── AAPL_intraday_lightgbm.pkl
│   ├── AAPL_intraday_random_forest.pkl
│   ├── AAPL_intraday_scaler.pkl
│   └── AAPL_intraday_xgboost.pkl
├── trading-dashboard/
│   ├── data/logs/
│   ├── dist/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── .env
│   ├── .gitignore
│   ├── BACKEND_API_CONTRACTS.md
│   ├── BACKEND_INTEGRATION_STATUS.md
│   ├── FEATURE_IMPLEMENTATION_STATUS.md
│   ├── FIX_WHITE_SCREEN.md
│   ├── README.md
│   ├── START_FRONTEND.bat
│   ├── TESTING_CHECKLIST.md
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── 00_README_START_HERE.md
├── AI_WORK_PROMPT_STRONG.md
├── ANALYZE_ENDPOINT_STUDY.md
├── API_ENDPOINTS_COMPLETE_REFERENCE.md
├── API_UI_INTEGRATION_SPECIFICATION.md
├── BACKEND_API_ANALYSIS.md
├── BACKEND_FRONTEND_ALIGNMENT_ANALYSIS.md
├── BACKGROUND_FIX_REPORT.md
├── BLINKING_FIX_AND_RESPONSIVE_DESIGN.md
├── CODE_CHANGE_DETAILS.md
├── COMPLETE_ALIGNMENT_REPORT.md
├── COMPLETE_FIX_FINAL.md
├── COMPREHENSIVE_TEST_REPORT_FINAL.md
├── CSS_AND_RESPONSIVE_COMPLETE_SUMMARY.md
├── CSS_ENHANCEMENTS.css
├── CSS_ENHANCEMENTS_PURE.css
├── CSS_INTEGRATION_QUICK_START.md
├── CSS_QUICK_REFERENCE_CARD.md
├── CURRENT_STATUS_REPORT.md
├── DOCUMENTATION_INDEX.md
├── ENDPOINTS_STYLING_PLAN.md
├── ENDPOINT_TEST_REPORT.md
├── EXECUTION_PLAN.md
├── FINAL_CONFIRMATION.md
├── FINAL_IMPLEMENTATION_REPORT.md
├── FINAL_INTEGRATION_VERIFICATION_REPORT.md
├── FINAL_VERIFICATION_REPORT.md
├── FIXES_IMPLEMENTED.md
├── FRONTEND_AUDIT_REPORT.md
├── FRONTEND_COMPLETE_FIX_GUIDE.md
├── FRONTEND_FIXES_REPORT.md
├── FRONTEND_INTEGRATION_AUDIT.md
├── FRONTEND_ISSUES_RESOLVED.md
├── HANDOFF_SUMMARY.md
├── IMPLEMENTATION_SUMMARY.md
├── INTEGRATION_MAPPING_DETAILED.md
├── PHASE_1_IMPLEMENTATION_COMPLETE.md
├── PHASE_2_IMPLEMENTATION_COMPLETE.md
├── PROJECT_COMPLETION_SUMMARY.md
├── PROJECT_STUDY_REPORT.md
├── QUICK_FIX_SUMMARY.md
├── QUICK_REFERENCE.md
├── QUICK_REFERENCE_GUIDE.md
├── QUICK_START.md
├── QUICK_START_FIXED.md
├── QUICK_START_PHASE_1_2.md
├── README.md
├── README_MAIN.md
├── README_RESPONSIVE_SYSTEM.md
├── RESPONSIVE_CSS_NEW_SYSTEM.md
├── RESPONSIVE_CSS_START_HERE.md
├── RESPONSIVE_DESIGN_GUIDE.md
├── RESPONSIVE_IMPLEMENTATION_GUIDE.md
├── RESPONSIVE_IMPLEMENTATION_SUMMARY.md
├── RESPONSIVE_QUICK_REFERENCE.md
├── RESPONSIVE_SYSTEM_CHECKLIST.md
├── RESPONSIVE_VISUAL_REFERENCE.md
├── SETUP_INTEGRATION_GUIDE.md
├── START_HERE.md
├── START_RESPONSIVE_TESTING.md
├── STATUS.md
├── SUMMARY_FIXES.md
├── SUPABASE_SETUP.md
├── SYSTEM_ARCHITECTURE.md
├── SYSTEM_FIX_REPORT_PHASE_1.md
├── SYSTEM_STATUS_REPORT.md
├── TAILWIND_DESIGN_SYSTEM.md
├── TEAM_SUBMISSION_CHECKLIST.md
├── TEST_STATUS_QUICK_REF.md
├── TRADING_HUB_DOCUMENTATION.md
├── VERIFICATION_COMPLETE.md
├── VISUAL_SUMMARY.md
├── api_test_results.json
├── fix_main_try_block.js
├── package-lock.json
├── package.json
├── start_dashboard.bat
├── start_project.bat
├── stock_analysis_complete.py
├── test_all_endpoints.py
├── test_api_endpoints.py
├── test_api_endpoints.ts
├── test_endpoints.js
├── test_endpoints_comprehensive.ts
├── test_endpoints_curl.bat
├── test_predict_fix.py
└── verify_endpoints.py
```

## Key Components Summary

### Backend Architecture
- **Main API Server**: `api_server.py` - FastAPI application with comprehensive endpoints
- **ML Pipeline**: `core/mcp_adapter.py` - Orchestrates ML model training and prediction
- **Authentication**: `auth.py`, `auth_routes.py` - JWT-based authentication system
- **Rate Limiting**: `rate_limiter.py` - Per-minute/hour request limiting
- **Validation**: `validators.py` - Input validation utilities
- **Configuration**: `config.py` - Centralized configuration management

### Frontend Architecture
- **Main App**: `trading-dashboard/src/App.tsx` - Root application component
- **Routing**: `trading-dashboard/src/routes.tsx` - All route definitions
- **API Service**: `trading-dashboard/src/services/api.ts` - Backend communication layer
- **Context Providers**: `trading-dashboard/src/contexts/` - State management
- **Pages**: `trading-dashboard/src/pages/` - All UI pages
- **Components**: `trading-dashboard/src/components/` - Reusable UI components

### ML Components
- **Data Ingestion**: `backend/core/ml/data.py` - Fetches and caches market data
- **Feature Engineering**: `backend/core/ml/features.py` - Calculates technical indicators
- **Model Training/Prediction**: `backend/core/ml/model.py` - ML model implementations
- **Feedback System**: `backend/core/ml/feedback.py` - RL feedback processing
- **Complete System**: `stock_analysis_complete.py` - Full implementation of ML pipeline

### Configuration Files
- **Backend**: `.env` (root and backend directories) - Environment variables
- **Frontend**: `.env` (trading-dashboard) - API base URL and feature flags
- **Requirements**: `backend/requirements.txt` - Python dependencies
- **Package**: `trading-dashboard/package.json` - Frontend dependencies

## API Endpoints Reference
- `/tools/predict` - Generate stock predictions
- `/tools/scan_all` - Scan multiple symbols
- `/tools/analyze` - Detailed analysis with risk parameters
- `/tools/feedback` - Submit feedback for model improvement
- `/tools/train_rl` - Train reinforcement learning models
- `/api/risk/assess` - Risk assessment
- `/api/risk/stop-loss` - Stop loss management
- `/tools/execute` - Execute trades
- `/api/ai/chat` - AI trading assistant

## File Types and Technologies
- **Backend**: Python (FastAPI, pandas, scikit-learn, yfinance)
- **Frontend**: TypeScript, React, Tailwind CSS, Vite
- **ML Models**: Pickle files (.pkl), PyTorch files (.pt)
- **Data**: JSON, Parquet, CSV formats
- **Documentation**: Markdown files (.md)
- **Configuration**: Environment files (.env), JSON, TS/JS configs

## Current State Lock
This structure represents the project in its current state. Any new changes or experiments should be built considering this existing architecture while preserving the core functionality.

## Important Directories to Preserve
- `backend/models/` - Contains trained ML models
- `backend/data/` - Contains cached market data
- `trading-dashboard/src/` - Contains frontend source code
- `backend/core/` - Contains core ML logic

This structure is now locked as a reference point for your new experiments.