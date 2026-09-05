# Lumen Chat

A polished, privacy-focused AI chat interface inspired by minimalism and usability. Built with React, TypeScript, and Tailwind CSS.

## Features

- Clean, responsive chat interface with sidebar history
- Model selection (Fable available, GPT-6 coming soon)
- Markdown rendering with syntax highlighting and copy buttons
- Mock streaming responses for quick prototyping
- Local storage by default; optional backend connection
- Settings: theme, font size, spacing, export/import, clear history
- Privacy information panel with no tracking or ads

## Quick Start

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and works without an API key thanks to mock streaming.

## Environment Variables

Create a `.env` file (optional — only needed for real backend integration):

```env
VITE_API_URL=http://localhost:4000/api/chat
VITE_APP_NAME=Lumen Chat
```

## Backend Integration

The adapter layer in `src/lib/adapters.ts` is where real API calls should be added.

Example endpoint structure for a custom backend:

```json
POST /api/chat
{
  "model": "fable",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

For streamed responses, return `Content-Type: text/event-stream` with SSE chunks (`data: {"content":"..."}`).

## Model Configuration

Edit `src/lib/models.ts` to add or update models. The UI picks them up automatically.

```ts
const models = [
  { id: "fable", name: "Fable", description: "General-purpose conversational model", available: true },
  { id: "gpt-6", name: "GPT-6", description: "Advanced reasoning and writing model", available: false }
];
```

## Deployment

This repo includes `.github/workflows/deploy.yml` to publish to GitHub Pages automatically on pushes to `main` or this branch.

Make sure the repository's Pages source is set to **GitHub Actions** in Settings > Pages.

## Accessibility & Design

- WCAG-focused color contrast and keyboard navigation
- ARIA labels and roles throughout
- Responsive from 320px mobile to large desktop
- Original palette (ink, amber, clay, sage) — no copied branding

## License

MIT — use, adapt, and deploy freely.
