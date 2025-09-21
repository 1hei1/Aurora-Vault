import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { ResourceItem, ResourceStatus, ResourceCategory } from "../types";

interface ImportResourcesDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (resources: ResourceItem[]) => void;
}

const categories: ResourceCategory[] = ["intel", "method", "tutorial", "tool", "file", "idea"];
const statuses: ResourceStatus[] = ["new", "in-review", "verified", "archived"];

export function ImportResourcesDialog({ open, onClose, onImport }: ImportResourcesDialogProps) {
  const [rawContent, setRawContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) {
    return null;
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      setRawContent(text);
      setError(null);
    } catch {
      setError("读取文件失败，请重试或手动粘贴。");
    }
  };

  const handleSubmit = () => {
    if (!rawContent.trim()) {
      setError("请粘贴 JSON 内容或选择文件。");
      return;
    }

    try {
      const parsed = JSON.parse(rawContent);
      if (!Array.isArray(parsed)) {
        setError("JSON 须为资源对象构成的数组。");
        return;
      }

      const normalised = parsed.map((item, index) => normaliseResource(item, index));
      onImport(normalised);
      setRawContent("");
      setError(null);
      onClose();
    } catch (err) {
      setError((err as Error).message || "JSON 解析失败，请检查格式。");
    }
  };

  const handleCancel = () => {
    setRawContent("");
    setError(null);
    onClose();
  };

  const handleUseClipboard = async () => {
    if (!navigator.clipboard) {
      setError("当前浏览器不支持剪贴板读取，建议手动粘贴。");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      setRawContent(text);
      setError(null);
    } catch {
      setError("无法读取剪贴板，请检查权限或手动粘贴。");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleCancel}
      role="presentation"
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">导入资源 JSON</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              选择 JSON 文件或直接粘贴内容，我们会校验必要字段并替换当前收藏。
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="rounded-full border border-[var(--border-subtle)] p-2 text-[var(--text-tertiary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            aria-label="关闭对话框"
            type="button"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-brand-400/40 hover:text-brand-600"
            >
              选择 JSON 文件
            </button>
            <button
              type="button"
              onClick={handleUseClipboard}
              className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-brand-400/40 hover:text-brand-600"
            >
              从剪贴板读取
            </button>
            <input
              type="file"
              accept="application/json,.json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <textarea
            value={rawContent}
            onChange={(event) => setRawContent(event.target.value)}
            placeholder="粘贴 JSON 数组，其中每个元素表示一个资源对象"
            rows={12}
            className="w-full resize-y rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          />

          {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-400"
            >
              导入并替换
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const normaliseResource = (item: unknown, index: number): ResourceItem => {
  if (typeof item !== "object" || item === null) {
    throw new Error(`第 ${index + 1} 条数据不是有效对象`);
  }

  const record = item as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const description = typeof record.description === "string" ? record.description.trim() : "";
  if (!title || !description) {
    throw new Error(`第 ${index + 1} 条缺少标题或描述`);
  }

  const rawType = record.type as ResourceCategory | undefined;
  const type = categories.includes(rawType ?? "" as ResourceCategory) ? rawType! : "intel";

  const rawStatus = record.status as ResourceStatus | undefined;
  const status = statuses.includes(rawStatus ?? "" as ResourceStatus) ? rawStatus! : "new";

  const tagsValue = record.tags;
  const tags: string[] = Array.isArray(tagsValue)
    ? tagsValue.map((tag) => String(tag).trim()).filter(Boolean)
    : typeof tagsValue === "string"
      ? tagsValue
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

  const createdAt = typeof record.createdAt === "string" && !Number.isNaN(Date.parse(record.createdAt))
    ? new Date(record.createdAt).toISOString()
    : new Date().toISOString();

  const rating = typeof record.rating === "number" ? record.rating : undefined;
  const notes = typeof record.notes === "string" ? record.notes : undefined;
  const url = typeof record.url === "string" ? record.url : undefined;
  const source = typeof record.source === "string" ? record.source : undefined;
  const pinned = typeof record.pinned === "boolean" ? record.pinned : false;

  const id = typeof record.id === "string" ? record.id : undefined;

  const generatedId =
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `imported-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 8)}`);

  return {
    id: id ?? generatedId,
    title,
    description,
    url,
    type,
    tags,
    createdAt,
    status,
    rating,
    notes,
    source,
    pinned,
  };
};
