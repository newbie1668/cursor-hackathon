import type { SourceKind, TaskCategory } from "../types";

export interface ScreenshotAnalysis {
  sourceKind: SourceKind;
  title: string;
  labels: string[];
  category: TaskCategory;
  ocrText: string;
  summary: string;
}

function uniqueLabels(items: string[], limit = 8): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const label = raw.replace(/\s+/g, " ").trim();
    if (!label || label.length < 2 || label.length > 42) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= limit) break;
  }
  return out;
}

function cleanLine(line: string): string {
  return line.replace(/\s+/g, " ").replace(/[|•·]+/g, " ").trim();
}

function scoreTitleLine(line: string): number {
  const len = line.length;
  if (len < 8 || len > 90) return 0;
  if (/^(home|search|menu|subscribe|follow|like|share|comment)$/i.test(line)) {
    return 0;
  }
  let score = Math.min(len, 48);
  if (/[A-Z]/.test(line[0] ?? "")) score += 8;
  if (/\d/.test(line)) score += 4;
  if (line.split(" ").length >= 3) score += 10;
  if (/views|subscribers|ago|edited|liked/i.test(line)) score -= 20;
  return score;
}

function pickTitle(lines: string[], fallback: string): string {
  let best = fallback;
  let bestScore = 0;
  for (const line of lines) {
    const score = scoreTitleLine(line);
    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
  }
  return best;
}

function detectSource(text: string): SourceKind {
  const t = text.toLowerCase();
  if (
    /\byoutube\b|\bsubscribe\b|\bviews?\b|\bwatch later\b|\bshorts\b|\bchannel\b/.test(
      t,
    )
  ) {
    return "youtube";
  }
  if (
    /\blinkedin\b|\bconnect\b|\bconnections\b|\bexperience\b|\babout\b.*\bprofile\b|\bmessage\b/.test(
      t,
    ) ||
    /\bproduct (lead|manager|designer)\b|\bsoftware engineer\b/.test(t)
  ) {
    return "linkedin";
  }
  if (
    /\bhttps?:\/\/|\bwww\.|\.com\b|\bdocs?\b|\barticle\b|\bblog\b|\bprivacy\b|\bcookie\b/.test(
      t,
    )
  ) {
    return "website";
  }
  return "other";
}

function categoryFor(source: SourceKind, text: string): TaskCategory {
  const t = text.toLowerCase();
  if (source === "youtube" || /\bvideo\b|\bwatch\b/.test(t)) return "Watch";
  if (source === "linkedin" || /\bconnect\b|\brecruiter\b|\bhire\b/.test(t)) {
    return "Follow up";
  }
  if (source === "website" || /\bread\b|\barticle\b|\bguide\b|\bdocs?\b/.test(t)) {
    return "Read";
  }
  if (/\bresearch\b|\bstudy\b/.test(t)) return "Research";
  return "Save";
}

function extractPersonName(lines: string[]): string | null {
  for (const line of lines.slice(0, 12)) {
    if (
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(line) &&
      !/LinkedIn|YouTube|About|Experience|Education/.test(line)
    ) {
      return line;
    }
  }
  return null;
}

function buildLabels(
  source: SourceKind,
  category: TaskCategory,
  title: string,
  lines: string[],
  text: string,
): string[] {
  const labels: string[] = [];
  if (source === "youtube") labels.push("YouTube", "Video");
  if (source === "linkedin") labels.push("LinkedIn", "Profile");
  if (source === "website") labels.push("Website", "Article");
  if (source === "other") labels.push("Screenshot");
  labels.push(category);

  const titleBits = title
    .split(/[:\-–—|]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 2 && p.length < 36);
  labels.push(...titleBits.slice(0, 2));

  for (const line of lines.slice(0, 10)) {
    if (
      /\b(fintech|london|react|design|billing|docs|product|engineer|startup)\b/i.test(
        line,
      )
    ) {
      const m = line.match(
        /\b(Fintech|London|React|Design|Billing|Docs|Product|Engineer|Startup)[a-z]*/i,
      );
      if (m) labels.push(m[0]);
    }
  }

  if (/\b(2\.?\d?M|views)\b/i.test(text)) labels.push("Popular");
  return uniqueLabels(labels);
}

export function interpretOcrText(
  rawText: string,
  fallbackTitle = "Screenshot",
): ScreenshotAnalysis {
  const ocrText = rawText.split(String.fromCharCode(0)).join(" ").trim();
  const lines = ocrText
    .split(/\n+/)
    .map(cleanLine)
    .filter((l) => l.length > 1);

  const sourceKind = detectSource(ocrText);
  const category = categoryFor(sourceKind, ocrText);

  let title = pickTitle(lines, fallbackTitle);
  if (sourceKind === "linkedin") {
    title = extractPersonName(lines) ?? title;
  }

  const labels = buildLabels(sourceKind, category, title, lines, ocrText);
  const summary =
    sourceKind === "youtube"
      ? `Looks like a YouTube video: “${title}”.`
      : sourceKind === "linkedin"
        ? `Looks like a LinkedIn profile: “${title}”.`
        : sourceKind === "website"
          ? `Looks like a web page: “${title}”.`
          : `I read this screenshot as “${title}”.`;

  return {
    sourceKind,
    title,
    labels,
    category,
    ocrText,
    summary,
  };
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = dataUrl;
  });
}

async function resizeForOcr(dataUrl: string, maxWidth = 1280): Promise<string> {
  const img = await loadImage(dataUrl);
  if (img.width <= maxWidth) return dataUrl;
  const scale = maxWidth / img.width;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

type OcrWorker = {
  recognize: (
    image: string,
  ) => Promise<{ data: { text: string } }>;
};

let workerPromise: Promise<OcrWorker> | null = null;

async function getWorker(): Promise<OcrWorker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      return createWorker("eng", 1, {
        logger: () => undefined,
      }) as unknown as Promise<OcrWorker>;
    })();
  }
  return workerPromise;
}

export async function analyzeScreenshot(
  dataUrl: string,
  fallbackTitle = "Screenshot",
): Promise<ScreenshotAnalysis> {
  const resized = await resizeForOcr(dataUrl);
  try {
    const worker = await getWorker();
    const {
      data: { text },
    } = await worker.recognize(resized);
    if (!text.trim()) {
      return interpretOcrText("", fallbackTitle);
    }
    return interpretOcrText(text, fallbackTitle);
  } catch {
    return {
      sourceKind: "other",
      title: fallbackTitle,
      labels: ["Screenshot", "Needs review"],
      category: "Save",
      ocrText: "",
      summary: `Couldn’t fully read the image — labeled as “${fallbackTitle}”. You can still talk to file it.`,
    };
  }
}

export function taskFromAnalysis(analysis: ScreenshotAnalysis): {
  title: string;
  intro: string;
  category: TaskCategory;
  sourceKind: SourceKind;
  labels: string[];
} {
  const prefix =
    analysis.category === "Watch"
      ? "Watch"
      : analysis.category === "Follow up"
        ? "Follow up"
        : analysis.category === "Read"
          ? "Read"
          : analysis.category === "Research"
            ? "Research"
            : analysis.category === "Save"
              ? "Save"
              : "Do";

  const title = analysis.title.toLowerCase().startsWith(prefix.toLowerCase())
    ? analysis.title
    : `${prefix}: ${analysis.title}`;

  return {
    title,
    intro: `${analysis.summary} Labels: ${analysis.labels.join(", ")}. Tap to revisit the screenshot.`,
    category: analysis.category,
    sourceKind: analysis.sourceKind,
    labels: analysis.labels,
  };
}
