export type ResourceCategory =
  | "intel"
  | "method"
  | "tutorial"
  | "tool"
  | "file"
  | "idea";

export type ResourceStatus = "new" | "in-review" | "verified" | "archived";

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: ResourceCategory;
  tags: string[];
  createdAt: string;
  status: ResourceStatus;
  rating?: number;
  pinned?: boolean;
  notes?: string;
  source?: string;
}

export interface ResourceFilters {
  searchTerm: string;
  type: ResourceCategory | "all";
  status: ResourceStatus | "all";
  tags: string[];
  showPinnedOnly: boolean;
}
