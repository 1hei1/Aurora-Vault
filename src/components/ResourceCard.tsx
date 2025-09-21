import type { ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import type { ResourceItem, ResourceStatus } from "../types";
import { categoryLabels, statusLabels } from "../utils/labels";
import { formatDate, formatRelativeTime } from "../utils/format";

interface ResourceCardProps {
  resource: ResourceItem;
  onTogglePinned: (id: string) => void;
  onStatusChange: (id: string, status: ResourceStatus) => void;
  onSelect?: () => void;
  onEdit?: () => void;
}

const statusOptions: ResourceStatus[] = ["new", "in-review", "verified", "archived"];

export function ResourceCard({ resource, onTogglePinned, onStatusChange, onSelect, onEdit }: ResourceCardProps) {
  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    event.stopPropagation();
    onStatusChange(resource.id, event.target.value as ResourceStatus);
  };

  const handleTogglePinned = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onTogglePinned(resource.id);
  };

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    if (!onEdit) {
      return;
    }
    event.stopPropagation();
    onEdit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onSelect) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      className={`group flex h-full flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]/50 transition duration-200 hover:-translate-y-1 hover:border-brand-300/40 hover:shadow-brand-500/20 ${
        onSelect ? "cursor-pointer" : ""
      }`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={onSelect ? 0 : undefined}
      role={onSelect ? "button" : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-brand-500/12 px-3 py-1 text-xs font-semibold text-brand-600">
              {categoryLabels[resource.type]}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">{formatDate(resource.createdAt)}</span>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{resource.title}</h2>
          {resource.source && (
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">来源：{resource.source}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="rounded-full border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] transition hover:border-brand-400/40 hover:text-brand-600"
              title="编辑"
              type="button"
            >
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
                  strokeWidth={1.6}
                  d="m16.862 4.487 1.651-1.65a1.5 1.5 0 0 1 2.122 2.122l-9.546 9.546a2 2 0 0 1-.894.515l-3.47.868a.5.5 0 0 1-.606-.606l.868-3.47a2 2 0 0 1 .515-.894l9.36-9.421Z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M19 11.5V19A1.5 1.5 0 0 1 17.5 20.5H5.5A1.5 1.5 0 0 1 4 19V6.5" />
              </svg>
            </button>
          )}
          <button
            onClick={handleTogglePinned}
            className={`rounded-full border p-2 transition ${
              resource.pinned
                ? "border-brand-400/60 bg-brand-500/20 text-brand-600"
                : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-tertiary)] hover:border-brand-400/30 hover:text-brand-600"
            }`}
            title={resource.pinned ? "取消置顶" : "置顶"}
            type="button"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill={resource.pinned ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15.172 5.172a4 4 0 0 1 5.656 5.656L12 19.657 3.172 10.828a4 4 0 0 1 5.656-5.656L12 8.172l3.172-3z"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-6">
        {resource.description}
      </p>

      {resource.notes && (
        <div className="mt-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--text-secondary)] line-clamp-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">操作备注</div>
          {resource.notes}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span>{formatRelativeTime(resource.createdAt)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={resource.status}
          onChange={handleStatusChange}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </select>

        {typeof resource.rating === "number" && (
          <span className="inline-flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-500">
            <svg
              className="h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
            </svg>
            {resource.rating.toFixed(1)}
          </span>
        )}

        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/18 px-4 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-500/24"
          >
            访问链接
            <svg
              className="h-3.5 w-3.5"
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
        )}
      </div>
    </article>
  );
}
