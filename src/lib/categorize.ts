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

function inferCategory(text: string, capture?: Capture): TaskCategory {
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
  return capture?.suggestedCategory ?? "Do";
}

function topicFromCapture(capture: Capture, quoted: string | null): string {
  return (
    quoted ??
    capture.suggestedTitle ??
    capture.note ??
    capture.labels.find((l) => !["YouTube", "LinkedIn", "Website", "Screenshot", "Video", "Profile", "Article", "Watch", "Follow up", "Read", "Research", "Save", "Do"].includes(l)) ??
    SOURCE_LABEL[capture.sourceKind]
  );
}

function defaultTitle(
  category: TaskCategory,
  sourceLabel: string,
  topic: string,
): string {
  if (topic.toLowerCase().startsWith(category.toLowerCase())) return topic;
  if (category === "Watch") return `Watch: ${topic}`;
  if (category === "Follow up") return `Follow up: ${topic}`;
  if (category === "Read") return `Read: ${topic}`;
  if (category === "Research") return `Research: ${topic}`;
  if (category === "Save") return `Save: ${topic}`;
  return topic || `Task from ${sourceLabel}`;
}

function defaultIntro(
  category: TaskCategory,
  topic: string,
  userText: string,
  labels: string[],
): string {
  const labelBit = labels.length ? ` Labels: ${labels.slice(0, 5).join(", ")}.` : "";
  if (category === "Watch") {
    return `Queued to watch “${topic}”.${labelBit} Reopen the screenshot when you’re ready.`;
  }
  if (category === "Follow up") {
    return `Reach out about “${topic}”.${labelBit} The profile screenshot is attached for context.`;
  }
  if (category === "Read") {
    return `Reading list: “${topic}”.${labelBit} Tap to revisit the page screenshot.`;
  }
  if (category === "Research") {
    return `Dig into “${topic}”.${labelBit} Kept the original capture for reference.`;
  }
  if (category === "Save") {
    return `Saved for later — “${topic}”.${labelBit}`;
  }
  const clipped = userText.trim().slice(0, 120);
  return clipped.length > 0
    ? `From your note: ${clipped}${userText.trim().length > 120 ? "…" : ""}${labelBit}`
    : `Task filed from a screenshot.${labelBit}`;
}

function pickCaptures(text: string, captures: Capture[]): Capture[] {
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
  return (
    /\b(show|list|what('s| is)|my)\b.*\b(todo|to-?do|task|list)\b/i.test(text) ||
    /\bwhat do i (have|need)\b/i.test(text)
  );
}

function wantsHelp(text: string): boolean {
  return /\b(help|how (do|does|can)|what can you)\b/i.test(text);
}

function wantsAutoFile(text: string): boolean {
  return /\b(file|categorize|sort|add|create|make)\b.*\b(task|todo|to-?do|all)\b/i.test(
    text,
  ) || /^(file (it|them|this|all)|add (it|them|this)|categorize( (it|them|this|all))?)$/i.test(
    text.trim(),
  );
}

export function categorizeFromTalk(
  text: string,
  captures: Capture[],
  existingTasks: Task[],
): CategorizeResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      reply:
        "Say what you want to do with a screenshot — watch, follow up, read, research, or save. Or say “file it” to use the labels I already read.",
      tasks: [],
      captureIds: [],
    };
  }

  if (isGreeting(trimmed)) {
    const open = captures.filter((c) => !c.categorized).length;
    return {
      reply:
        open > 0
          ? `Hey — you’ve got ${open} uncategorized capture${open === 1 ? "" : "s"} with labels from the screenshots. Say “file it” or tell me how to sort them.`
          : "Hey — drop a screenshot and I’ll read it, label it, and show a preview.",
      tasks: [],
      captureIds: [],
    };
  }

  if (wantsHelp(trimmed)) {
    return {
      reply:
        "Upload screenshots — I read them with on-device OCR, create labels, and show a preview. Then talk to me (“file it”, “Watch this”, “Follow up”) and I’ll date each task.",
      tasks: [],
      captureIds: [],
    };
  }

  if (wantsList(trimmed)) {
    const openTasks = existingTasks.filter((t) => !t.done);
    if (openTasks.length === 0) {
      return {
        reply:
          "Your to-do list is empty. Capture something and I’ll read + label it.",
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
        "I don’t see an open screenshot to attach. Capture one first — I’ll read it and label it — or create a task manually.",
      tasks: [],
      captureIds: [],
    };
  }

  const quoted = extractQuoted(trimmed);
  const auto = wantsAutoFile(trimmed);
  const tasks: Task[] = selected.map((capture) => {
    const sourceHint =
      detectSourceFromText(trimmed) ?? capture.sourceKind;
    const category = auto
      ? (capture.suggestedCategory ?? inferCategory(trimmed, capture))
      : inferCategory(trimmed, capture);
    const sourceLabel = SOURCE_LABEL[sourceHint];
    const topic = topicFromCapture(capture, quoted);
    const labels =
      capture.labels.length > 0
        ? capture.labels
        : [SOURCE_LABEL[sourceHint], category];
    return {
      id: uid("task"),
      title: defaultTitle(category, sourceLabel, topic),
      intro: defaultIntro(category, topic, trimmed, labels),
      category,
      sourceKind: sourceHint,
      labels,
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
    text: "Drop screenshots of YouTube, LinkedIn, or the web. I’ll read them, create labels, show a preview, then help you file dated to-dos.",
    at: Date.now(),
  };
}
