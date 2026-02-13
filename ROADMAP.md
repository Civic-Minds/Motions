# Future Roadmap: Toronto Council Transparency

This document outlines planned features and architectural improvements for future versions of the Motion Tracker.

## 📍 Near-Term (v0.3.0)
- **Interactive Map Integration**: Add a Leaflet.js map to the Housing and Transit modules to visualize geographical distribution of motions.
- **Historical Backfill**: Expand `scripts/fetch_motions.js` to backfill data from the start of the 2024-2025 session.
- **Improved Scraper Robustness**: Implement a proxy-based or browser-simulated (Playwright) fetching layer to bypass TMMIS 403 errors reliably.

## 🏗️ Mid-Term (v0.4.0)
- **User Watchlists**: Allow users to "follow" specific councillors or topics and receive filtered updates.
- **Voting DNA Expansion**: Add deeper sentiment analysis of mover speeches (extracted from YouTube transcripts or meeting minutes).
- **Consensus Prediction**: Implement a simple ML model to predict voting outcomes based on historical "DNA" alignment.

## 🚀 Long-Term (v1.0.0)
- **Full Backend API**: Transition from a static JSON file to a PostgreSQL/FastAPI backend for real-time multi-user scaling.
- **Community Commentary**: Enable civil discourse threads on individual motions.
- **Open Data Export**: Provide a public API for civic researchers to download the normalized voting records.
