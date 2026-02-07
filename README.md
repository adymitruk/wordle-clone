# Wordle Clone

A clean Wordle implementation with 10 years of daily puzzles.

## Features

- 10 years of pre-generated daily words
- Server timezone-aware (America/Los_Angeles)
- Cheat mode for testing: `?pretendDate=2026-02-15`
- Client-side game logic
- Keyboard and click support
- Responsive design

## Setup

```bash
npm install
npm run generate  # Generate words (already done)
npm start         # Start server on port 3000
```

## Deployment

Deploy to apps.dymitruk.com/wordle

## Testing

Access with pretendDate parameter:
- `http://localhost:3000/?pretendDate=2026-02-15`
- `http://apps.dymitruk.com/wordle/?pretendDate=2026-03-01`

## Tech Stack

- Node.js + Express
- Vanilla HTML/CSS/JavaScript
- No frameworks, no build step
