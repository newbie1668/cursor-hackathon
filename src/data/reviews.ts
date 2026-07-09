export type RiskLevel = "safe" | "needs_eyes" | "dangerous";
export type CiStatus = "passing" | "failing" | "pending";
export type CardStatus = "ready" | "waiting" | "merged" | "rejected";

export interface DiffFile {
  path: string;
  additions: number;
  deletions: number;
  hunks: string[];
}

export interface ReviewCard {
  id: string;
  title: string;
  summary: string;
  repo: string;
  branch: string;
  model: string;
  risk: RiskLevel;
  ci: CiStatus;
  files: DiffFile[];
  status: CardStatus;
}

export const INITIAL_REVIEWS: ReviewCard[] = [
  {
    id: "rev-1",
    title: "Fix empty-cart checkout crash",
    summary:
      "Guards checkout when the cart is empty and shows a clear empty state instead of throwing.",
    repo: "acme/storefront",
    branch: "agent/fix-empty-cart",
    model: "Composer 2.5",
    risk: "safe",
    ci: "passing",
    status: "ready",
    files: [
      {
        path: "src/pages/Checkout.tsx",
        additions: 18,
        deletions: 4,
        hunks: [
          `@@ -42,8 +42,22 @@ export function Checkout({ cart }: Props) {
-  const total = cart.items.reduce((s, i) => s + i.price, 0)
+  if (!cart.items.length) {
+    return (
+      <EmptyState
+        title="Your cart is empty"
+        action={<Link to="/">Continue shopping</Link>}
+      />
+    )
+  }
+  const total = cart.items.reduce((s, i) => s + i.price, 0)`,
        ],
      },
      {
        path: "src/pages/Checkout.test.tsx",
        additions: 24,
        deletions: 0,
        hunks: [
          `@@ -0,0 +1,24 @@
+it('renders empty state when cart has no items', () => {
+  render(<Checkout cart={{ items: [] }} />)
+  expect(screen.getByText(/cart is empty/i)).toBeInTheDocument()
+})`,
        ],
      },
    ],
  },
  {
    id: "rev-2",
    title: "Refactor auth session refresh",
    summary:
      "Moves token refresh into a shared hook and retries once on 401. Touches middleware and client.",
    repo: "acme/api-gateway",
    branch: "agent/auth-refresh",
    model: "Claude Opus",
    risk: "needs_eyes",
    ci: "passing",
    status: "ready",
    files: [
      {
        path: "src/hooks/useSessionRefresh.ts",
        additions: 46,
        deletions: 0,
        hunks: [
          `@@ -0,0 +1,46 @@
+export function useSessionRefresh() {
+  const refresh = useCallback(async () => {
+    const res = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' })
+    if (!res.ok) throw new SessionExpiredError()
+    return res.json()
+  }, [])
+  return { refresh }
+}`,
        ],
      },
      {
        path: "src/middleware/auth.ts",
        additions: 12,
        deletions: 31,
        hunks: [
          `@@ -18,28 +18,14 @@ export async function requireAuth(req, res, next) {
-  // inline refresh logic (legacy)
-  if (expired) {
-    const token = await refreshLegacy(req)
-    ...
-  }
+  if (expired) {
+    await refreshSession(req)
+  }`,
        ],
      },
      {
        path: "src/client/api.ts",
        additions: 9,
        deletions: 3,
        hunks: [
          `@@ -55,6 +55,12 @@ async function request(path, opts) {
+  if (res.status === 401 && !opts._retried) {
+    await refreshSession()
+    return request(path, { ...opts, _retried: true })
+  }`,
        ],
      },
    ],
  },
  {
    id: "rev-3",
    title: "Unblock CI: flaky timezone test",
    summary:
      "Pins the test clock to UTC and replaces Date.now() with a controllable fake timer.",
    repo: "acme/billing",
    branch: "agent/fix-ci-timezone",
    model: "Composer 2.5",
    risk: "safe",
    ci: "passing",
    status: "ready",
    files: [
      {
        path: "tests/invoice-due.test.ts",
        additions: 14,
        deletions: 7,
        hunks: [
          `@@ -10,12 +10,19 @@ describe('invoice due dates', () => {
-  const now = Date.now()
+  beforeEach(() => {
+    vi.useFakeTimers()
+    vi.setSystemTime(new Date('2026-07-09T12:00:00Z'))
+  })
+  afterEach(() => vi.useRealTimers())`,
        ],
      },
    ],
  },
  {
    id: "rev-4",
    title: "Tighten CORS and add rate limits",
    summary:
      "Restricts allowed origins and adds per-IP rate limiting on /api. High blast radius — review carefully.",
    repo: "acme/api-gateway",
    branch: "agent/cors-ratelimit",
    model: "GPT-5.4",
    risk: "dangerous",
    ci: "failing",
    status: "ready",
    files: [
      {
        path: "src/middleware/cors.ts",
        additions: 22,
        deletions: 8,
        hunks: [
          `@@ -4,10 +4,18 @@ export const corsOptions = {
-  origin: '*',
+  origin: (origin, cb) => {
+    if (!origin || ALLOWED.has(origin)) return cb(null, true)
+    return cb(new Error('Not allowed by CORS'))
+  },
   credentials: true,`,
        ],
      },
      {
        path: "src/middleware/rateLimit.ts",
        additions: 38,
        deletions: 0,
        hunks: [
          `@@ -0,0 +1,38 @@
+export const apiLimiter = rateLimit({
+  windowMs: 60_000,
+  max: 120,
+  standardHeaders: true,
+  legacyHeaders: false,
+})`,
        ],
      },
      {
        path: "src/app.ts",
        additions: 4,
        deletions: 1,
        hunks: [
          `@@ -20,6 +20,9 @@ app.use(cors(corsOptions))
+app.use('/api', apiLimiter)`,
        ],
      },
    ],
  },
  {
    id: "rev-5",
    title: "Polish settings empty state copy",
    summary:
      "Updates empty-state headline and supporting line on the team settings page. Copy-only change.",
    repo: "acme/dashboard",
    branch: "agent/settings-copy",
    model: "Composer 2.5",
    risk: "safe",
    ci: "passing",
    status: "ready",
    files: [
      {
        path: "src/pages/TeamSettings.tsx",
        additions: 3,
        deletions: 3,
        hunks: [
          `@@ -88,8 +88,8 @@ function EmptyMembers() {
-      <h2>No members yet</h2>
-      <p>Invite teammates to collaborate.</p>
+      <h2>Your team is empty</h2>
+      <p>Invite people to share projects and reviews.</p>`,
        ],
      },
    ],
  },
  {
    id: "rev-6",
    title: "Add webhook signature verification",
    summary:
      "Verifies Stripe webhook signatures before processing events. Pending CI on the integration suite.",
    repo: "acme/billing",
    branch: "agent/webhook-verify",
    model: "Claude Opus",
    risk: "needs_eyes",
    ci: "pending",
    status: "ready",
    files: [
      {
        path: "src/webhooks/stripe.ts",
        additions: 27,
        deletions: 6,
        hunks: [
          `@@ -12,9 +12,28 @@ export async function handleStripe(req, res) {
-  const event = req.body
+  const sig = req.headers['stripe-signature']
+  let event
+  try {
+    event = stripe.webhooks.constructEvent(req.rawBody, sig, secret)
+  } catch (err) {
+    return res.status(400).send('Invalid signature')
+  }`,
        ],
      },
      {
        path: "src/webhooks/stripe.test.ts",
        additions: 31,
        deletions: 0,
        hunks: [
          `@@ -0,0 +1,31 @@
+it('rejects requests with a bad signature', async () => {
+  const res = await postWebhook({ signature: 'bad' })
+  expect(res.status).toBe(400)
+})`,
        ],
      },
    ],
  },
  {
    id: "rev-7",
    title: "Migrate list endpoint to cursor pagination",
    summary:
      "Replaces offset pagination with cursor-based pages on /projects. Clients still on offset need a follow-up.",
    repo: "acme/dashboard",
    branch: "agent/cursor-pagination",
    model: "GPT-5.4",
    risk: "needs_eyes",
    ci: "passing",
    status: "ready",
    files: [
      {
        path: "src/api/projects.ts",
        additions: 41,
        deletions: 19,
        hunks: [
          `@@ -30,22 +30,44 @@ export async function listProjects(req) {
-  const { page = 1, limit = 20 } = req.query
-  const offset = (page - 1) * limit
+  const { cursor, limit = 20 } = req.query
+  const items = await db.projects.findMany({
+    take: Number(limit) + 1,
+    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
+    orderBy: { id: 'asc' },
+  })`,
        ],
      },
      {
        path: "src/components/ProjectList.tsx",
        additions: 16,
        deletions: 11,
        hunks: [
          `@@ -14,12 +14,17 @@ export function ProjectList() {
-  const [page, setPage] = useState(1)
+  const [cursor, setCursor] = useState<string | undefined>()
   const { data } = useProjects({ cursor, limit: 20 })`,
        ],
      },
    ],
  },
];

export function cloneReviews(): ReviewCard[] {
  return structuredClone(INITIAL_REVIEWS);
}

export function cardStats(card: ReviewCard) {
  const additions = card.files.reduce((s, f) => s + f.additions, 0);
  const deletions = card.files.reduce((s, f) => s + f.deletions, 0);
  return { additions, deletions, fileCount: card.files.length };
}
