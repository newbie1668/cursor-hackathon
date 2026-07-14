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
| **Add screenshot** | Upload / camera capture lands in Captures |
| **Talk** | Type or dictate (“Watch the YouTube video about system design”) |
| **Tasks** | Dated list with a brief intro per item |
| **Tap a task** | Revisit the linked screenshot |
| **New task** | Create a manual task without a capture |

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
