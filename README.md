# Run Gap Calculator

Tiny React + Tailwind tool. Enter a start and end point of a T20 innings (over, ball, runs) and instantly see:

- **Runs gap** between the two points
- **Balls between** them (and over.ball notation)
- **Required run rate** to get from start to end

## Run locally

```bash
npm install
npm run dev
# -> http://127.0.0.1:5174
```

## Build for deployment

```bash
npm run build
# -> dist/ ready to deploy to Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.
```

## Stack

- Vite
- React 18
- Tailwind CSS 3
- lucide-react

## Convention

Over field is **0-indexed completed overs**. So "after 4 overs and 5 balls" → `over=4, ball=5` (29 legal balls bowled). After the 6th ball, it rolls over to `over=5, ball=0`.
