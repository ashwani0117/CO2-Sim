# Python AI Backend

FastAPI service for environmental risk detection used by the frontend AI dashboard.

## Features

- Threshold checks for AQI, pH, and turbidity
- Anomaly detection using recent reading history
- Trend detection (increasing/decreasing/stable)
- Alert response with severity, confidence, reasons, and actions

## Requirements

- Python 3.10+
- `pip`

## Setup

Run commands from the repository root.

```bash
cd ./python_backend
python -m venv venv
```

Windows:

```bash
venv\\Scripts\\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the API:

```bash
python main.py
```

Server starts at `http://localhost:8000`.

## API Endpoints

- `GET /health`
- `GET /info`
- `POST /analyze-risk`
- `POST /batch-analyze`

## Local Verification

- Open `http://localhost:8000/docs` for Swagger UI.
- Call `http://localhost:8000/health` and verify `status=healthy`.

## Notes

This module uses in-memory history (`memory_store.py`) for anomaly and trend checks. History resets on service restart.
