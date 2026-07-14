import type { Capture, ChatMessage, Task, TaskCategory } from "../types";
import { detectSourceFromText, SOURCE_LABEL } from "./source";
import { uid } from "./id";

export interface CategorizeResult {
  reply: string;
  tasks: Task[];
  captureIds: string[];
}

function extractQuoted(text: string): string | null {
  const m =
    text.match(/[“"]([^”"]+)[”"]/) ??
    text.match(/called\s+(.+?)(?:\.|$)/i) ??
    text.match(/about\s+(.+?)(?:\.|$)/i) ??
    text.match(/titled\s+(.+?)(?:\.|$)/i);
  return m?.[1]?.trim() ?? null;
}

function inferCategory(text: string): TaskCategory {
  const t = text.toLowerCase();
  if (/\bwatch\b|\bvideo\b|\byoutube\b|\bstream\b/.test(t)) return "Watch";
  if (
    /\bfollow\s*up\b|\breach\s*out\b|\bmessage\b|\bdm\b|\bconnect\b|\blinkedin\b|\bemail\b/.test(
      t,
    )
  ) {
    return "Follow up";
  }
  if (/\bread\b|\barticle\b|\bblog\b|\bessay\b/.test(t)) return "Read";
  if (/\bresearch\b|\blook\s*into\b|\binvestigate\b|\bstudy\b/.test(t)) {
    return "Research";
  }
  if (/\bsave\b|\bbookmark\b|\bkeep\b|\breference\b/.test(t)) return "Save";
  return "Do";
}

function defaultTitle(
  category: TaskCategory,
  sourceLabel: string,
  quoted: string | null,
): string {
  if (quoted) {
    if (category === "Watch") return `Watch: ${quoted}`;
    if (category === "Follow up") return `Follow up: ${quoted}`;
    if (category === "Read") return `Read: ${quoted}`;
    if (category === "Research") return `Research: ${quoted}`;
    if (category === "Save") return `Save: ${quoted}`;
    return quoted;
  }
  if (category === "Watch") return `Watch ${sourceLabel} video`;
  if (category === "Follow up") return `Follow up on ${sourceLabel}`;
  if (category === "Read") return `Read ${sourceLabel} page`;
  if (category === "Research") return `Research from ${sourceLabel}`;
  if (category === "Save") return `Saved ${sourceLabel} capture`;
  return `Task from ${sourceLabel}`;
}

function defaultIntro(
  category: TaskCategory,
  sourceLabel: string,
  quoted: string | null,
  userText: string,
): string {
  const topic = quoted ? `“${quoted}”` : `this ${sourceLabel.toLowerCase()} capture`;
  if (category === "Watch") {
    return `Queued to watch ${topic}. Reopen the screenshot when you’re ready.`;
  }
  if (category === "Follow up") {
    return `Reach out about ${topic}. The profile screenshot is attached for context.`;
  }
  if (category === "Read") {
    return `Reading list: ${topic}. Tap to revisit the page screenshot.`;
  }
  if (category === "Research") {
    return `Dig into ${topic}. Kept the original capture for reference.`;
  }
  if (category === "Save") {
    return `Saved for later — ${topic}.`;
  }
  const clipped = userText.trim().slice(0, 120);
  return clipped.length > 0
    ? `From your note: ${clipped}${userText.trim().length > 120 ? "…" : ""}`
    : `Task filed from a ${sourceLabel.toLowerCase()} screenshot.`;
}

function pickCaptures(
  text: string,
  captures: Capture[],
): Capture[] {
  const open = captures.filter((c) => !c.categorized);
  if (open.length === 0) return [];

  const source = detectSourceFromText(text);
  if (source) {
    const matched = open.filter((c) => c.sourceKind === source);
    if (matched.length > 0) return [matched[0]];
  }

  if (/\ball\b|\beverything\b|\bthese\b|\bthem\b/.test(text.toLowerCase())) {
    return open.slice(0, 5);
  }

  return [open[0]];
}

function isGreeting(text: string): boolean {
  return /^(hi|hello|hey|yo|sup)\b/i.test(text.trim());
}

function wantsList(text: string): boolean {
  return /\b(show|list|what('s| is)|my)\b.*\b(todo|to-?do|task|list)\b/i.test(
    text,
  ) || /\bwhat do i (have|need)\b/i.test(text);
}

function wantsHelp(text: string): boolean {
  return /\b(help|how (do|does|can)|what can you)\b/i.test(text);
}

export function categorizeFromTalk(
  text: string,
  captures: Capture[],
  existingTasks: Task[],
): CategorizeResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      reply: "Say what you want to do with a screenshot — watch, follow up, read, research, or save.",
      tasks: [],
      captureIds: [],
    };
  }

  if (isGreeting(trimmed)) {
    const open = captures.filter((c) => !c.categorized).length;
    return {
      reply:
        open > 0
          ? `Hey — you’ve got ${open} uncategorized capture${open === 1 ? "" : "s"}. Tell me how to file them, e.g. “Watch the YouTube video about React hooks.”`
          : "Hey — drop a screenshot, then tell me how to turn it into a task.",
      tasks: [],
      captureIds: [],
    };
  }

  if (wantsHelp(trimmed)) {
    return {
      reply:
        "Upload screenshots of YouTube, LinkedIn, or websites. Then talk to me: “Add this LinkedIn profile to follow up” or “Read this article about pricing.” I’ll date each task and keep the shot so you can revisit.",
      tasks: [],
      captureIds: [],
    };
  }

  if (wantsList(trimmed)) {
    const openTasks = existingTasks.filter((t) => !t.done);
    if (openTasks.length === 0) {
      return {
        reply: "Your to-do list is empty. Capture something and tell me how to categorize it.",
        tasks: [],
        captureIds: [],
      };
    }
    const lines = openTasks
      .slice(0, 6)
      .map((t) => `• ${t.category}: ${t.title}`)
      .join("\n");
    return {
      reply: `Here’s what’s on your list:\n${lines}${openTasks.length > 6 ? "\n…" : ""}`,
      tasks: [],
      captureIds: [],
    };
  }

  const selected = pickCaptures(trimmed, captures);
  if (selected.length === 0) {
    return {
      reply:
        "I don’t see an open screenshot to attach. Capture one first, then tell me how to categorize it — or create a task manually.",
      tasks: [],
      captureIds: [],
    };
  }

  const quoted = extractQuoted(trimmed);
  const tasks: Task[] = selected.map((capture) => {
    const sourceHint =
      detectSourceFromText(trimmed) ?? capture.sourceKind;
    const category = inferCategory(trimmed);
    const sourceLabel = SOURCE_LABEL[sourceHint];
    return {
      id: uid("task"),
      title: defaultTitle(category, sourceLabel, quoted),
      intro: defaultIntro(category, sourceLabel, quoted, trimmed),
      category,
      sourceKind: sourceHint,
      captureId: capture.id,
      createdAt: Date.now(),
      done: false,
    };
  });

  const captureIds = selected.map((c) => c.id);
  const summary = tasks
    .map((t) => `“${t.title}” under ${t.category}`)
    .join("; ");

  return {
    reply: `Got it — filed ${summary}. Open Tasks to revisit the screenshot anytime.`,
    tasks,
    captureIds,
  };
}

export function assistantWelcome(): ChatMessage {
  return {
    id: uid("msg"),
    role: "assistant",
    text: "Drop screenshots of YouTube, LinkedIn, or the web — then talk to me. I’ll sort them into a dated to-do list you can reopen later.",
    at: Date.now(),
  };
}
