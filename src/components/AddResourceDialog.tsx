import { useEffect, useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { ResourceCategory, ResourceItem, ResourceStatus } from "../types";
import { categoryLabels, statusLabels } from "../utils/labels";

export interface AddResourcePayload {
  title: string;
  description: string;
  url?: string;
  type: ResourceCategory;
  tags: string[];
  status: ResourceStatus;
  rating?: number;
  notes?: string;
  source?: string;
}

interface AddResourceDialogProps {
  open: boolean;
  mode: "create" | "edit";
  resource?: ResourceItem;
  onClose: () => void;
  onSubmit: (payload: AddResourcePayload) => void;
  onDelete?: () => void;
  recommendedTags: string[];
}

const defaultValues: AddResourcePayload = {
  title: "",
  description: "",
  type: "intel",
  tags: [],
  status: "new",
};

const statusOptions: ResourceStatus[] = ["new", "in-review", "verified", "archived"];

export function AddResourceDialog({
  open,
  mode,
  resource,
  onClose,
  onSubmit,
  onDelete,
  recommendedTags,
}: AddResourceDialogProps) {
  const [formValues, setFormValues] = useState<AddResourcePayload>(defaultValues);
  const [tagInput, setTagInput] = useState("");

  const isEditMode = mode === "edit" && Boolean(resource);

  useEffect(() => {
    if (!open) {
      setFormValues(defaultValues);
      setTagInput("");
      return;
    }

    if (isEditMode && resource) {
      const { title, description, url, type, tags, status, rating, notes, source } = resource;
      setFormValues({
        title,
        description,
        url,
        type,
        tags: [...tags],
        status,
        rating,
        notes,
        source,
      });
      setTagInput("");
    } else {
      setFormValues(defaultValues);
      setTagInput("");
    }
  }, [open, isEditMode, resource]);

  const ratingDisplay = useMemo(() => {
    if (!formValues.rating) {
      return "未评级";
    }
    return `${formValues.rating.toFixed(1)} / 5`;
  }, [formValues.rating]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.title.trim() || !formValues.description.trim()) {
      return;
    }

    onSubmit({
      ...formValues,
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      url: formValues.url?.trim() || undefined,
      source: formValues.source?.trim() || undefined,
      tags: formValues.tags.map((tag) => tag.trim()).filter(Boolean),
    });

    onClose();
  };

  const updateField = <K extends keyof AddResourcePayload>(key: K, value: AddResourcePayload[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized || formValues.tags.includes(normalized)) {
      return;
    }
    setFormValues((prev) => ({ ...prev, tags: [...prev.tags, normalized] }));
  };

  const removeTag = (tag: string) => {
    setFormValues((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
  };

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (tagInput) {
        addTag(tagInput);
        setTagInput("");
      }
    }
  };

  if (!open) {
    return null;
  }

  const formTitle = isEditMode ? "编辑资源" : "新增资源";
  const formDescription = isEditMode
    ? "修改当前条目的详细信息，更新后自动同步至收藏库。"
    : "记录你捕捉到的线报、方法或教程，方便后续追踪。";
  const submitLabel = isEditMode ? "保存修改" : "保存资源";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-card)] transition-colors duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{formTitle}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{formDescription}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[var(--border-subtle)] p-2 text-[var(--text-tertiary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            aria-label="关闭窗口"
            type="button"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">标题 *</span>
              <input
                value={formValues.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="例如：Telegram 线报抓取脚本"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">资源类型 *</span>
              <select
                value={formValues.type}
                onChange={(event) => updateField("type", event.target.value as ResourceCategory)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">资源描述 *</span>
            <textarea
              value={formValues.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="简要说明内容亮点、应用场景、风险点等"
              rows={4}
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">链接</span>
              <input
                value={formValues.url ?? ""}
                onChange={(event) => updateField("url", event.target.value)}
                placeholder="https://"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">来源</span>
              <input
                value={formValues.source ?? ""}
                onChange={(event) => updateField("source", event.target.value)}
                placeholder="例如：Twitter @account 或 内部渠道"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">标签</span>
              <div className="flex flex-wrap gap-2">
                {formValues.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-brand-400/40 hover:text-brand-600"
                  >
                    #{tag}
                    <span className="text-[var(--text-tertiary)]">×</span>
                  </button>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="输入标签后回车或逗号确认"
                className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              />
              {recommendedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {recommendedTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-brand-400/40 hover:text-brand-600"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">当前状态</span>
                <select
                  value={formValues.status}
                  onChange={(event) => updateField("status", event.target.value as ResourceStatus)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                >
                  {statusOptions.map((value) => (
                    <option key={value} value={value}>
                      {statusLabels[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">价值评级</span>
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3">
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={formValues.rating ?? 0}
                    onChange={(event) => updateField("rating", Number(event.target.value) || undefined)}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-brand-600">{ratingDisplay}</span>
                </div>
              </label>
            </div>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">操作备注</span>
            <textarea
              value={formValues.notes ?? ""}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="执行提醒、踩坑记录、后续动作..."
              rows={3}
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            />
          </label>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {isEditMode && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-500 transition hover:border-red-500 hover:bg-red-500/10"
              >
                删除
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-400"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
