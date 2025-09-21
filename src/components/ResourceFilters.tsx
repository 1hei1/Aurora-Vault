import type { ChangeEvent, RefObject } from "react";
import type { ResourceFilters } from "../types";
import { categoryLabels, statusLabels } from "../utils/labels";

interface ResourceFiltersProps {
  filters: ResourceFilters;
  availableTags: string[];
  onChange: (updated: ResourceFilters) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

export function ResourceFilters({
  filters,
  availableTags,
  onChange,
  searchInputRef,
}: ResourceFiltersProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, searchTerm: event.target.value });
  };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, type: event.target.value as ResourceFilters["type"] });
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: event.target.value as ResourceFilters["status"] });
  };

  const toggleTag = (tag: string) => {
    const nextTags = filters.tags.includes(tag)
      ? filters.tags.filter((item) => item !== tag)
      : [...filters.tags, tag];

    onChange({ ...filters, tags: nextTags });
  };

  const togglePinned = () => {
    onChange({ ...filters, showPinnedOnly: !filters.showPinnedOnly });
  };

  return (
    <section className="space-y-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]/40 transition-colors duration-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]" htmlFor="search">
            <span className="flex items-center justify-between">
              <span>快速检索</span>
              <span className="hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)] sm:flex">
                <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-0.5">⌘</kbd>
                <span>+</span>
                <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-0.5">K</kbd>
              </span>
            </span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="m21 21-4.35-4.35M9.5 17a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
            </span>
            <input
              id="search"
              ref={searchInputRef}
              value={filters.searchTerm}
              onChange={handleSearchChange}
              placeholder="标题、标签、来源、描述关键词"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            />
          </div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]" htmlFor="type-filter">
              类型
            </label>
            <select
              id="type-filter"
              value={filters.type}
              onChange={handleTypeChange}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            >
              <option value="all">全部</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]" htmlFor="status-filter">
              状态
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            >
              <option value="all">全部</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={togglePinned}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
              filters.showPinnedOnly
                ? "border-brand-400/70 bg-brand-500/15 text-brand-600"
                : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-brand-400/40 hover:text-brand-600"
            }`}
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill={filters.showPinnedOnly ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 5.172a4 4 0 0 1 5.656 5.656L12 19.657 3.172 10.828a4 4 0 0 1 5.656-5.656L12 8.172l3.172-3z"
              />
            </svg>
            <span>{filters.showPinnedOnly ? "仅看置顶" : "显示置顶"}</span>
          </button>
        </div>
      </div>
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-[var(--text-secondary)]">标签筛选</div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const active = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  type="button"
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-brand-400/60 bg-brand-500/18 text-brand-600 shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-brand-400/40 hover:text-brand-600"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
