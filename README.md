# TradePilot AI — Paper Trading MVP

Expo Android client + Python FastAPI backend. **Simulation only:** no Groww connectivity, live market feed, AI strategy, authentication, database, or automatic stock selection.

## Run the backend

```bash
cd backend
python -m venv .venv
# Activate the virtual environment
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend API docs: http://localhost:8000/docs

## Test on Android with Expo Go

```bash
cd mobile
npm install
npx expo install --fix
# Set EXPO_PUBLIC_API_URL=http://YOUR_LAPTOP_LAN_IP:8000 in mobile/.env
npx expo start
```

Phone and laptop must share a trusted Wi-Fi network. The mobile app defaults to localhost, which does **not** reach the laptop from a physical Android phone.

## Build an APK with Expo EAS

```bash
cd mobile
npm install
npx expo install --fix
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Requires an Expo account and interactive build setup. The `preview` profile is configured for an APK, not AAB. The app needs a reachable backend and the `EXPO_PUBLIC_API_URL` set for the build.

## Simulate a paper trade

Use FastAPI `/docs`: POST `/bot/start`, POST `/paper/buy`, POST `/paper/quote`. All quote prices are supplied by the tester; there is no automatic trading or market feed. The API is unauthenticated and stores data only in process memory; **do not deploy it publicly**.

Paper profits do not predict real trading results. No guaranteed returns.
