import type { ResourceCategory, ResourceStatus } from "../types";

export const categoryLabels: Record<ResourceCategory, string> = {
  intel: "线报",
  method: "方法",
  tutorial: "教程",
  tool: "工具",
  file: "文件",
  idea: "思路",
};

export const statusLabels: Record<ResourceStatus, string> = {
  new: "待跟进",
  "in-review": "核查中",
  verified: "已验证",
  archived: "封存",
};
