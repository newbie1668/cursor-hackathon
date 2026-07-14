import type { SourceKind, TaskCategory } from "../types";

export const SOURCE_LABEL: Record<SourceKind, string> = {
  youtube: "YouTube",
  linkedin: "LinkedIn",
  website: "Website",
  other: "Screenshot",
};

export const CATEGORY_ORDER: TaskCategory[] = [
  "Watch",
  "Follow up",
  "Read",
  "Research",
  "Save",
  "Do",
];

export function detectSourceFromText(text: string): SourceKind | null {
  const t = text.toLowerCase();
  if (
    /\byoutube\b|\byt\b|\bvideo\b|\bwatch later\b|\bchannel\b/.test(t)
  ) {
    return "youtube";
  }
  if (
    /\blinkedin\b|\bprofile\b|\brecruiter\b|\bconnection\b|\bdm\b/.test(t)
  ) {
    return "linkedin";
  }
  if (
    /\bwebsite\b|\barticle\b|\bblog\b|\bpage\b|\bsite\b|\burl\b/.test(t)
  ) {
    return "website";
  }
  return null;
}

export function detectSourceFromFilename(name: string): SourceKind {
  const n = name.toLowerCase();
  if (n.includes("youtube") || n.includes("yt")) return "youtube";
  if (n.includes("linkedin") || n.includes("li-")) return "linkedin";
  if (
    n.includes("web") ||
    n.includes("site") ||
    n.includes("article") ||
    n.includes("http")
  ) {
    return "website";
  }
  return "other";
}
