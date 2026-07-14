import type { Capture, Task } from "../types";

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const youtubeShot = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="780" height="520" viewBox="0 0 780 520">
  <defs>
    <linearGradient id="yt" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a0a0a"/>
      <stop offset="100%" stop-color="#3b1010"/>
    </linearGradient>
  </defs>
  <rect width="780" height="520" fill="url(#yt)"/>
  <rect x="48" y="56" width="684" height="320" rx="18" fill="#0d0d0d"/>
  <circle cx="390" cy="216" r="48" fill="#ff3b30"/>
  <polygon points="378,190 378,242 420,216" fill="#fff"/>
  <text x="48" y="420" fill="#f5f5f5" font-family="system-ui,sans-serif" font-size="28" font-weight="700">System Design in 40 Minutes</text>
  <text x="48" y="456" fill="#c9b4b4" font-family="system-ui,sans-serif" font-size="18">2.1M views · Fireship · YouTube</text>
</svg>
`);

const linkedinShot = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="780" height="520" viewBox="0 0 780 520">
  <defs>
    <linearGradient id="li" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dce8f5"/>
      <stop offset="45%" stop-color="#f4f7fb"/>
      <stop offset="100%" stop-color="#eef2f7"/>
    </linearGradient>
  </defs>
  <rect width="780" height="520" fill="url(#li)"/>
  <rect x="0" y="0" width="780" height="140" fill="#0a66c2"/>
  <circle cx="120" cy="150" r="64" fill="#fff" stroke="#d0d7de" stroke-width="6"/>
  <circle cx="120" cy="150" r="52" fill="#9db7d4"/>
  <text x="210" y="168" fill="#12263a" font-family="system-ui,sans-serif" font-size="32" font-weight="700">Maya Chen</text>
  <text x="210" y="206" fill="#3d556d" font-family="system-ui,sans-serif" font-size="20">Product Lead · Fintech · London</text>
  <rect x="48" y="280" width="684" height="180" rx="16" fill="#fff" stroke="#d7dee8"/>
  <text x="72" y="330" fill="#12263a" font-family="system-ui,sans-serif" font-size="20" font-weight="600">About</text>
  <text x="72" y="368" fill="#4a6075" font-family="system-ui,sans-serif" font-size="18">Building payments UX. Open to advising early-stage teams.</text>
  <text x="72" y="404" fill="#0a66c2" font-family="system-ui,sans-serif" font-size="16">linkedin.com/in/mayachen</text>
</svg>
`);

const websiteShot = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="780" height="520" viewBox="0 0 780 520">
  <defs>
    <linearGradient id="web" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7faf8"/>
      <stop offset="100%" stop-color="#e4eee8"/>
    </linearGradient>
  </defs>
  <rect width="780" height="520" fill="url(#web)"/>
  <rect x="0" y="0" width="780" height="56" fill="#1d2a24"/>
  <circle cx="28" cy="28" r="7" fill="#e85d4c"/>
  <circle cx="50" cy="28" r="7" fill="#e0b14d"/>
  <circle cx="72" cy="28" r="7" fill="#2a9d8f"/>
  <rect x="110" y="16" width="520" height="24" rx="12" fill="#314038"/>
  <text x="130" y="33" fill="#a8b7af" font-family="system-ui,sans-serif" font-size="13">stripe.com/docs/billing</text>
  <text x="48" y="140" fill="#1d2a24" font-family="Georgia,serif" font-size="36" font-weight="700">Billing &amp; subscriptions</text>
  <text x="48" y="188" fill="#4f6559" font-family="system-ui,sans-serif" font-size="20">A practical guide to metering, trials, and dunning.</text>
  <rect x="48" y="230" width="420" height="14" rx="7" fill="#c9d8cf"/>
  <rect x="48" y="262" width="360" height="14" rx="7" fill="#c9d8cf"/>
  <rect x="48" y="294" width="390" height="14" rx="7" fill="#c9d8cf"/>
  <rect x="48" y="350" width="180" height="44" rx="10" fill="#2a9d8f"/>
  <text x="78" y="378" fill="#fff" font-family="system-ui,sans-serif" font-size="18" font-weight="600">Read guide</text>
</svg>
`);

const day = 86_400_000;
const now = Date.now();

export function seedCaptures(): Capture[] {
  return [
    {
      id: "cap-seed-yt",
      imageDataUrl: youtubeShot,
      sourceKind: "youtube",
      createdAt: now - day * 0.2,
      note: "System Design in 40 Minutes",
      categorized: true,
      labels: ["YouTube", "Video", "Watch", "System Design", "Fireship"],
      suggestedTitle: "System Design in 40 Minutes",
      suggestedCategory: "Watch",
      ocrText: "System Design in 40 Minutes\n2.1M views · Fireship · YouTube",
      analyzeStatus: "ready",
    },
    {
      id: "cap-seed-li",
      imageDataUrl: linkedinShot,
      sourceKind: "linkedin",
      createdAt: now - day * 1.1,
      note: "Maya Chen — Product Lead",
      categorized: true,
      labels: ["LinkedIn", "Profile", "Follow up", "Maya Chen", "Fintech", "London"],
      suggestedTitle: "Maya Chen",
      suggestedCategory: "Follow up",
      ocrText: "Maya Chen\nProduct Lead · Fintech · London",
      analyzeStatus: "ready",
    },
    {
      id: "cap-seed-web",
      imageDataUrl: websiteShot,
      sourceKind: "website",
      createdAt: now - day * 2.4,
      note: "Stripe Billing docs",
      categorized: false,
      labels: ["Website", "Article", "Read", "Billing", "Subscriptions", "Stripe"],
      suggestedTitle: "Billing & subscriptions",
      suggestedCategory: "Read",
      ocrText: "Billing & subscriptions\nA practical guide to metering, trials, and dunning.\nstripe.com/docs/billing",
      analyzeStatus: "ready",
    },
  ];
}

export function seedTasks(): Task[] {
  return [
    {
      id: "task-seed-1",
      title: "Watch: System Design in 40 Minutes",
      intro:
        "Queued to watch “System Design in 40 Minutes”. Labels: YouTube, Video, Watch, System Design, Fireship. Reopen the screenshot when you’re ready.",
      category: "Watch",
      sourceKind: "youtube",
      labels: ["YouTube", "Video", "Watch", "System Design", "Fireship"],
      captureId: "cap-seed-yt",
      createdAt: now - day * 0.2,
      done: false,
    },
    {
      id: "task-seed-2",
      title: "Follow up: Maya Chen",
      intro:
        "Reach out about “Maya Chen”. Labels: LinkedIn, Profile, Follow up, Maya Chen, Fintech. The profile screenshot is attached for context.",
      category: "Follow up",
      sourceKind: "linkedin",
      labels: ["LinkedIn", "Profile", "Follow up", "Maya Chen", "Fintech", "London"],
      captureId: "cap-seed-li",
      createdAt: now - day * 1.1,
      done: false,
    },
  ];
}
