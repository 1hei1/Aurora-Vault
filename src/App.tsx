import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AddResourceDialog } from "./components/AddResourceDialog";
import { ResourceCard } from "./components/ResourceCard";
import { ResourceDetailDrawer } from "./components/ResourceDetailDrawer";
import { ResourceFilters } from "./components/ResourceFilters";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { TreasureChestCTA } from "./components/TreasureChestCTA";
import { AnimatedBackdrop } from "./components/AnimatedBackdrop";
import { ImportResourcesDialog } from "./components/ImportResourcesDialog";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { AddResourcePayload } from "./components/AddResourceDialog";
import type { ResourceFilters as ResourceFiltersType, ResourceItem, ResourceStatus } from "./types";
import "./index.css";

const STORAGE_KEY = "resource-hub-items";
const THEME_STORAGE_KEY = "resource-hub-theme";

const defaultFilters: ResourceFiltersType = {
  searchTerm: "",
  type: "all",
  status: "all",
  tags: [],
  showPinnedOnly: false,
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `res-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

type Theme = "light" | "dark";

function App() {
  const [resources, setResources] = useLocalStorage<ResourceItem[]>(
    STORAGE_KEY,
    [],
  );
  const [filters, setFilters] = useState<ResourceFiltersType>(defaultFilters);
  const getSystemTheme = () =>
    (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light") as Theme;
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_STORAGE_KEY, getSystemTheme());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);

    if (typeof window === "undefined") {
      return;
    }

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingResourceId(null);
    setDialogMode("create");
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingResourceId(null);
    setIsDialogOpen(true);
  };

  const openImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    setDialogMode("edit");
    setEditingResourceId(id);
    setIsDialogOpen(true);
    setActiveResourceId(null);
  };

  const activeResource = useMemo(
    () => resources.find((item) => item.id === activeResourceId) ?? null,
    [resources, activeResourceId],
  );

  const editingResource = useMemo(
    () => resources.find((item) => item.id === editingResourceId) ?? null,
    [resources, editingResourceId],
  );

  const pendingDeleteResource = useMemo(
    () => resources.find((item) => item.id === pendingDeleteId) ?? null,
    [resources, pendingDeleteId],
  );

  const handleDialogSubmit = (payload: AddResourcePayload) => {
    if (dialogMode === "edit" && editingResourceId) {
      setResources((prev) =>
        prev.map((resource) =>
          resource.id === editingResourceId
            ? {
                ...resource,
                ...payload,
              }
            : resource,
        ),
      );
      showToast("资源已更新");
    } else {
      const newResource: ResourceItem = {
        id: createId(),
        createdAt: new Date().toISOString(),
        pinned: false,
        ...payload,
      };
      setResources((prev) => [newResource, ...prev]);
      showToast("已保存资源");
    }

    closeDialog();
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((resource) => resource.id !== id));
    setActiveResourceId((current) => (current === id ? null : current));

    if (editingResourceId === id) {
      closeDialog();
    }

    showToast("资源已删除");
  };

  const handleImportResources = (items: ResourceItem[]) => {
    setResources(() => items);
    setFilters(defaultFilters);
    setActiveResourceId(null);
    setEditingResourceId(null);
    setIsDialogOpen(false);
    setIsImportDialogOpen(false);
    showToast(`已导入 ${items.length} 条资源`);
  };

  const handleDialogDelete = () => {
    if (!editingResourceId) {
      return;
    }

    setPendingDeleteId(editingResourceId);
  };

  const handleDetailDelete = (resource: ResourceItem) => {
    setPendingDeleteId(resource.id);
  };

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handleGlobalHotkeys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setDialogMode("create");
        setEditingResourceId(null);
        setIsDialogOpen(true);
        return;
      }

      if (event.key === "Escape") {
        if (activeResourceId) {
          event.preventDefault();
          setActiveResourceId(null);
          return;
        }
        if (isDialogOpen) {
          event.preventDefault();
          setIsDialogOpen(false);
          setEditingResourceId(null);
          setDialogMode("create");
        }
      }
    };

    window.addEventListener("keydown", handleGlobalHotkeys);
    return () => window.removeEventListener("keydown", handleGlobalHotkeys);
  }, [isDialogOpen, activeResourceId]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const closeDeleteDialog = () => {
    setPendingDeleteId(null);
  };

  const confirmDeleteResource = () => {
    if (!pendingDeleteResource) {
      return;
    }

    handleDeleteResource(pendingDeleteResource.id);
    setPendingDeleteId(null);
  };

  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    resources.forEach((resource) => {
      resource.tags.forEach((tag) => {
        const count = tagCounts.get(tag) ?? 0;
        tagCounts.set(tag, count + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [resources]);

  const summary = useMemo(() => {
    const total = resources.length;
    const pinnedCount = resources.filter((resource) => resource.pinned).length;
    const verifiedCount = resources.filter((resource) => resource.status === "verified").length;
    return { total, pinnedCount, verifiedCount };
  }, [resources]);

  const filteredResources = useMemo(() => {
    const searchTerm = filters.searchTerm.trim().toLowerCase();

    return resources
      .filter((resource) => {
        if (filters.type !== "all" && resource.type !== filters.type) {
          return false;
        }
        if (filters.status !== "all" && resource.status !== filters.status) {
          return false;
        }
        if (filters.showPinnedOnly && !resource.pinned) {
          return false;
        }
        if (filters.tags.length > 0 && !filters.tags.every((tag) => resource.tags.includes(tag))) {
          return false;
        }

        if (!searchTerm) {
          return true;
        }

        const haystack = [
          resource.title,
          resource.description,
          resource.tags.join(" "),
          resource.source ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchTerm);
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;

        const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (dateDiff !== 0) return dateDiff;

        return a.title.localeCompare(b.title, "zh-CN");
      });
  }, [resources, filters]);

  const handleTogglePinned = (id: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id ? { ...resource, pinned: !resource.pinned } : resource,
      ),
    );
  };

  const handleStatusChange = (id: string, status: ResourceStatus) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              status,
            }
          : resource,
      ),
    );
  };

  const handleExport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(resources, null, 2));
      showToast("已复制到剪贴板");
    } catch (error) {
      console.warn("Export failed", error);
      showToast("复制失败，请手动使用开发者工具导出");
    }
  };

  const hasFilteredResults = filteredResources.length > 0;

  return (
    <div className="relative z-0 min-h-screen bg-[var(--surface-body)] pb-16 transition-colors duration-500">
      <div className="relative z-0 mx-auto w-full max-w-[1680px] px-6 sm:px-12 pt-12">
        <AnimatedBackdrop />
        <motion.header
          className="relative z-10 overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-8 shadow-[var(--shadow-card)] transition-colors duration-300"
          style={{ backgroundColor: "var(--surface-panel)" }}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <motion.span
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--brand-soft),transparent_70%)]"
            initial={{ opacity: 0.3, scale: 0.8, x: 60, y: -60 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.45em] text-brand-500/70">Aurora Vault</p>
              <h1 className="text-3xl font-semibold text-[var(--text-primary)]">太极之势的情报收藏</h1>
              <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
                以黑白平衡之意重新诠释资源管理：结构化卡片、抽屉详情与宝箱式新增共同流转，既稳重又保持灵动仪式感。
              </p>
              <dl className="flex flex-wrap gap-4 text-xs text-[var(--text-tertiary)]">
                <motion.div
                  className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-[var(--text-secondary)]">总数</span>
                  <span className="font-semibold text-[var(--text-primary)]">{summary.total}</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-[var(--text-secondary)]">置顶</span>
                  <span className="font-semibold text-[var(--text-primary)]">{summary.pinnedCount}</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-[var(--text-secondary)]">已验证</span>
                  <span className="font-semibold text-[var(--text-primary)]">{summary.verifiedCount}</span>
                </motion.div>
              </dl>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <motion.button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                type="button"
                aria-label={theme === "light" ? "切换至暗色模式" : "切换至浅色模式"}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
              >
                {theme === "light" ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.75V3M12 21v-1.75M6.364 6.364 5.01 5.01m13.98 13.98-1.354-1.354M4.75 12H3m18 0h-1.75M6.364 17.636 5.01 18.99m13.98-13.98-1.354 1.354M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
                    />
                  </svg>
                )}
                <span>{theme === "light" ? "浅色" : "夜间"}</span>
              </motion.button>
              <motion.button
                onClick={handleExport}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
              >
                导出 JSON
              </motion.button>
              <motion.button
                onClick={openImportDialog}
                className="rounded-xl border border-brand-400/40 bg-brand-500/15 px-5 py-3 text-sm font-medium text-brand-600 transition hover:bg-brand-500/20"
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
              >
                导入 JSON
              </motion.button>
              <TreasureChestCTA onOpen={openCreateDialog} />
            </div>
          </div>
        </motion.header>

        <main className="relative z-10 mt-10 space-y-8">
          <ResourceFilters
            filters={filters}
            availableTags={allTags}
            onChange={setFilters}
            searchInputRef={searchInputRef}
          />

          <section className="min-h-[320px]">
            {hasFilteredResults ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence initial={false}>
                  {filteredResources.map((resource, index) => (
                    <motion.div
                      key={resource.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                    >
                  <ResourceCard
                    resource={resource}
                    onTogglePinned={handleTogglePinned}
                    onStatusChange={handleStatusChange}
                    onSelect={() => setActiveResourceId(resource.id)}
                    onEdit={() => openEditDialog(resource.id)}
                  />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-16 text-center shadow-[var(--shadow-card)]/40"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-full border border-brand-400/40 bg-brand-500/15 p-4 text-brand-600">
                  <svg
                    className="h-8 w-8"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M12 6v6h6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-[var(--text-primary)]">暂无匹配的资源</p>
                  <p className="text-sm text-[var(--text-tertiary)]">尝试调整筛选条件，或添加新的资源条目。</p>
                </div>
                <motion.button
                  onClick={openCreateDialog}
                  className="rounded-xl border border-brand-400/40 bg-brand-500/18 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-500/24"
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.05 }}
                >
                  添加第一条资源
                </motion.button>
              </motion.div>
            )}
          </section>
        </main>

        <AnimatePresence initial={false}>
          {toastMessage && (
            <motion.div
              className="fixed bottom-8 right-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-card)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmDialog
        open={Boolean(pendingDeleteResource)}
        title={pendingDeleteResource?.title ?? ""}
        description={pendingDeleteResource?.description}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDeleteResource}
      />

      <AddResourceDialog
        open={isDialogOpen}
        mode={dialogMode}
        resource={dialogMode === "edit" ? editingResource ?? undefined : undefined}
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
        onDelete={dialogMode === "edit" ? handleDialogDelete : undefined}
        recommendedTags={allTags}
      />

      <ImportResourcesDialog
        open={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportResources}
      />

      <ResourceDetailDrawer
        resource={activeResource}
        onClose={() => setActiveResourceId(null)}
        onStatusChange={handleStatusChange}
        onTogglePinned={handleTogglePinned}
        onEdit={(resource) => openEditDialog(resource.id)}
        onDelete={handleDetailDelete}
      />
    </div>
  );
}

export default App;
