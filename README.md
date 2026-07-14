# ShotList

Talk to your screenshots. Capture YouTube, LinkedIn, or any website — then speak or type how to file it. ShotList turns captures into a dated to-do list you can reopen to revisit the original shot.

**One-liner:** Screenshot → talk → categorized, dated tasks with one-tap revisit.

## Quick start

```bash
npm install
npm run dev
```

Open on a phone or narrow browser window. Desktop shows a phone frame.

```bash
npm run build
npm run preview
```

## What you can do

| Action | Result |
|--------|--------|
| **Choose from Photos** | Pick existing screenshots (multi-select) |
| **AI read** | On-device OCR reads the shot, creates labels, shows a preview |
| **Talk** | Type or dictate (“file it”, “Watch this…”) |
| **Tasks** | Dated list with labels + screenshot preview |
| **Tap a task** | Revisit the linked screenshot |

Categories: Watch · Follow up · Read · Research · Save · Do

## Demo flow

1. Open **Captures** — seed YouTube, LinkedIn, and website shots are ready  
2. Open **Talk** — try: `Read the Stripe billing article` (files the open website capture)  
3. Jump to **Tasks** — open an item to revisit the screenshot  
4. Add your own screenshot and say how to categorize it  
5. Use the mic (Chrome / Safari) for hands-free filing  

## Stack

- Vite + React 19 + TypeScript  
- Framer Motion  
- Web Speech API for dictation  
- LocalStorage persistence (no backend / API keys)

## Project layout

```
src/
  App.tsx
  types.ts
  data/seed.ts
  lib/categorize.ts   # conversational filing (local)
  lib/storage.ts
  components/
    AppShell.tsx
    CaptureInbox.tsx
    ChatPanel.tsx
    TodoList.tsx
    DetailSheet.tsx
    CreateTaskSheet.tsx
```

## Notes

Prototype for turning visual clutter (videos, profiles, docs) into an actionable, revisit-able list — built for Cursor mobile hackathon demos.
