# Approval Mode

Tinder-style swipe review for Cursor agent diffs — a hackathon prototype for the London iOS Cursor Hackathon **Review + QA** track.

**One-liner:** Swipe right to merge, left to reject, up to keep going — with Tinder-style buttons and swipe history.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL on a phone or a narrow browser window. On desktop, the UI is framed as a phone.

```bash
npm run build    # production build
npm run preview  # preview the build
```

## Gestures

| Gesture / button | Action |
|------------------|--------|
| Swipe right / ♥ **Merge** | Approve and merge the agent PR |
| Swipe left / ✕ **Reject** | Reject / discard |
| Swipe up / ★ **Keep going** | Open follow-up sheet → agent resumes (waiting) |
| ↺ **Rewind** | Undo the last swipe |
| History (clock) | Browse every swipe and restore any card |

Cards show risk, CI, +/- lines, and expandable unified diffs before you decide. Circular action buttons mirror Tinder’s layout so left / right / up are obvious. Toasts and Rewind support **Undo**; History keeps a full session log.

## Demo script (≤2 min Loom)

1. **0:00–0:20** — iOS Cursor: launch agent(s) that built/iterated this prototype  
2. **0:20–0:35** — Pitch: “Approval Mode — Tinder for agent PRs. Review+QA for the phone.”  
3. **0:35–1:10** — Expand a diff hunk → swipe **right** to merge → swipe **left** to reject  
4. **1:10–1:40** — Swipe **up** → chip follow-up (e.g. Add tests) → waiting / agent resumed  
5. **1:40–2:00** — Open **History** → restore a card → Rewind → “All caught up” → Reset demo  

## Stack

- Vite + React + TypeScript  
- Framer Motion (swipe + sheet)  
- Mock review queue in `src/data/reviews.ts` (no auth / APIs)  
- Cursor-inspired tokens: cream `#f7f7f4`, ink `#26251e`, orange `#f54e00`

## Project layout

```
src/
  App.tsx
  data/reviews.ts
  styles/tokens.css
  components/
    ApprovalShell.tsx
    CardStack.tsx
    ReviewCard.tsx
    DiffHunk.tsx
    KeepGoingSheet.tsx
    HistorySheet.tsx
    ActionHints.tsx
    ActionIcons.tsx
    Toast.tsx
```

## Notes

- This is a **concept prototype** for what Cursor Mobile Approval Mode could feel like — not the official app.  
- On hackathon night, drive changes via the **iOS Cursor** app so the Loom shows phone-based building.
