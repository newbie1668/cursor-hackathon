export type SourceKind = "youtube" | "linkedin" | "website" | "other";

export type TaskCategory =
  | "Watch"
  | "Follow up"
  | "Read"
  | "Research"
  | "Save"
  | "Do";

export type AnalyzeStatus = "pending" | "reading" | "ready" | "error";

export interface Capture {
  id: string;
  imageDataUrl: string;
  sourceKind: SourceKind;
  createdAt: number;
  note?: string;
  categorized: boolean;
  labels: string[];
  ocrText?: string;
  suggestedTitle?: string;
  suggestedCategory?: TaskCategory;
  analyzeStatus: AnalyzeStatus;
}

export interface Task {
  id: string;
  title: string;
  intro: string;
  category: TaskCategory;
  sourceKind: SourceKind;
  labels: string[];
  captureId?: string;
  createdAt: number;
  done: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: number;
  taskIds?: string[];
  previewUrl?: string;
  labels?: string[];
  captureId?: string;
}

export type TabId = "captures" | "talk" | "tasks";
