# JOOLA Paddle Selector — Backend API

Python/FastAPI backend powering the JOOLA Paddle Selector chat experience.

## Quick Start

```bash
pip install -e ".[dev]"
cp .env.example .env
python scripts/generate_rules.py   # generates 1728 placeholder rules
python -m src.main                  # starts server on port 4000
```

Or with real Excel data:

```bash
pip install openpyxl
python scripts/import_from_excel.py --file "JOOLA_Paddle_Selector_Competitive_05-18-2026_FILLED.xlsx"
python -m src.main
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/paddle-selector/questions | All 7 questions in order |
| POST | /api/paddle-selector/sessions | Create session |
| GET | /api/paddle-selector/sessions/:id | Get session state |
| POST | /api/paddle-selector/sessions/:id/answer | Submit answer |
| POST | /api/paddle-selector/sessions/:id/restart | Restart session |
| POST | /api/paddle-selector/recommendations | Stateless recommendation |

Swagger UI: http://localhost:4000/docs

### Example: full flow

```bash
# Create session
curl -X POST http://localhost:4000/api/paddle-selector/sessions \
  -H "Content-Type: application/json" -d '{"source":"website","locale":"en-US"}'

# Submit answer (repeat for each question)
curl -X POST http://localhost:4000/api/paddle-selector/sessions/{sessionId}/answer \
  -H "Content-Type: application/json" \
  -d '{"questionId":"skillLevel","answerValue":"beginner"}'

# Stateless recommendation (bypass session flow)
curl -X POST http://localhost:4000/api/paddle-selector/recommendations \
  -H "Content-Type: application/json" \
  -d '{"answers":{"skillLevel":"beginner","playFrequency":"occasionally","budget":"under_100","playPriority":"power","twoHandedBackhand":"yes","upgradeOpenness":"yes","gripFeel":"small"}}'
```

## Question Flow

| # | Question ID | Options | Used for lookup |
|---|-------------|---------|-----------------|
| 0 | skillLevel | beginner, intermediate, advanced | No (profile only) |
| 1 | playFrequency | occasionally, weekly, multiple_times_per_week | Yes |
| 2 | budget | under_100, 100_200, 200_plus, no_budget | Yes |
| 3 | playPriority | power, control, balance, spin | Yes |
| 4 | twoHandedBackhand | yes, no, sometimes | Yes |
| 5 | upgradeOpenness | yes, maybe, no | Yes |
| 6 | gripFeel | small, average, large, not_sure_first_paddle | Yes |

The 6 lookup fields produce 3×4×4×3×3×4 = **1,728 exact-match rule combinations**.

## Data Files

| File | Description | Future DB table |
|------|-------------|-----------------|
| src/data/questions.json | 7 questions + options | paddle_selector_questions |
| src/data/products.json | ~30 JOOLA products | paddle_selector_products |
| src/data/recommendation_rules.json | 1,728 combination rules | paddle_selector_recommendation_rules |
| src/data/sessions.json | Active sessions (dev only) | paddle_selector_sessions |

## Running Tests

```bash
python -m pytest tests/ -v
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 4000 | HTTP port |
| HOST | 0.0.0.0 | Bind address |
| DATA_DIR | src/data | Path to JSON data files |
| SESSIONS_FILE | src/data/sessions.json | Sessions store path |
| STRICT_RECOMMENDATION_VALIDATION | false | Fail on startup if rules have missing data |

## Future: Migrate JSON → Database

Each flat JSON file maps directly to a DB table. Migration path:

1. Replace `FileRepository.read_json()` calls with SQLAlchemy queries in each repository.
2. Repository interfaces stay identical — services and controllers require zero changes.
3. Drop `sessions.json` and replace `SessionRepository` with a DB-backed version.
4. Run `scripts/import_from_excel.py` once to seed the DB, then retire the script.
