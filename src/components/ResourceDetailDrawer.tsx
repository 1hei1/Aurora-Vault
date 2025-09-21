import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { categoryLabels, statusLabels } from "../utils/labels";
import { formatDate, formatRelativeTime } from "../utils/format";
import type { ResourceItem, ResourceStatus } from "../types";

interface ResourceDetailDrawerProps {
  resource: ResourceItem | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ResourceStatus) => void;
  onTogglePinned: (id: string) => void;
  onEdit: (resource: ResourceItem) => void;
  onDelete: (resource: ResourceItem) => void;
}

const statusOptions: ResourceStatus[] = ["new", "in-review", "verified", "archived"];

export function ResourceDetailDrawer({
  resource,
  onClose,
  onStatusChange,
  onTogglePinned,
  onEdit,
  onDelete,
}: ResourceDetailDrawerProps) {
  useEffect(() => {
    if (!resource || typeof document === "undefined") {
      return;
    }

    const { body } = document;
    const originalOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = originalOverflow;
    };
  }, [resource]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {resource && (
        <>
          <motion.div
            key="drawer-overlay"
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            key="drawer-panel"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] transition-colors duration-300"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <div className="relative flex flex-col gap-8 p-8">
              <header className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-brand-500/12 px-3 py-1 text-xs font-semibold text-brand-600">
                    {categoryLabels[resource.type]}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(resource)}
                      className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-brand-400/40 hover:text-brand-600"
                      type="button"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDelete(resource)}
                      className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:border-red-500 hover:bg-red-500/10"
                      type="button"
                    >
                      删除
                    </button>
                    <button
                      onClick={() => onTogglePinned(resource.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        resource.pinned
                          ? "border-brand-400/60 bg-brand-500/20 text-brand-600"
                          : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-brand-400/40 hover:text-brand-600"
                      }`}
                      type="button"
                    >
                      {resource.pinned ? "已置顶" : "置顶"}
                    </button>
                    <button
                      onClick={onClose}
                      className="rounded-full border border-[var(--border-subtle)] p-2 text-[var(--text-tertiary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                      aria-label="关闭详情"
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
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{resource.title}</h2>
                  {resource.source && (
                    <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                      来源：{resource.source}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1">
                    创立日期 {formatDate(resource.createdAt)}
                  </span>
                  <span>{formatRelativeTime(resource.createdAt)}</span>
                  {typeof resource.rating === "number" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 font-semibold text-amber-500">
                      <svg
                        className="h-3.5 w-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                      </svg>
                      {resource.rating.toFixed(1)} / 5
                    </span>
                  )}
                </div>
              </header>

              <section className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--text-secondary)]">内容简介</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                    {resource.description}
                  </p>
                </div>

                {resource.notes && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)]">操作备注</h3>
                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]">
                      {resource.notes}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">当前状态</span>
                    <select
                      value={resource.status}
                      onChange={(event) => onStatusChange(resource.id, event.target.value as ResourceStatus)}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2 text-sm text-[var(--text-primary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                    >
                      {statusOptions.map((value) => (
                        <option key={value} value={value}>
                          {statusLabels[value]}
                        </option>
                      ))}
                    </select>
                  </label>

                  {resource.url && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-[var(--text-secondary)]">外部链接</span>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/18 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-500/24"
                      >
                        打开资源
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13.5 4.5H19.5V10.5"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M10.5 13.5L19.5 4.5"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19.5 19.5H4.5V4.5"
                          />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {resource.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)]">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
