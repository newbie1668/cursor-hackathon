export type SourceKind = "youtube" | "linkedin" | "website" | "other";

export type TaskCategory =
  | "Watch"
  | "Follow up"
  | "Read"
  | "Research"
  | "Save"
  | "Do";

export interface Capture {
  id: string;
  imageDataUrl: string;
  sourceKind: SourceKind;
  createdAt: number;
  note?: string;
  categorized: boolean;
}

export interface Task {
  id: string;
  title: string;
  intro: string;
  category: TaskCategory;
  sourceKind: SourceKind;
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
}

export type TabId = "captures" | "talk" | "tasks";
