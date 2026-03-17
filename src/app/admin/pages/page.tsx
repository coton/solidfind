"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type FilterOption = { id: string; label: string };
type Filter = { id: string; title: string; options: FilterOption[] };
type PageConfig = {
  _id: Id<"pageConfigs">;
  categoryId: string;
  label: string;
  subtitle: string;
  visible: boolean;
  sortOrder: number;
  filters: Filter[];
  updatedAt: number;
};

export default function AdminPagesPage() {
  const pages = useQuery(api.pageConfigs.list);
  const upsert = useMutation(api.pageConfigs.upsert);
  const updateVisibility = useMutation(api.pageConfigs.updateVisibility);
  const addPageMut = useMutation(api.pageConfigs.addPage);
  const removePage = useMutation(api.pageConfigs.removePage);
  const seed = useMutation(api.pageConfigs.seed);

  const [selectedId, setSelectedId] = useState<Id<"pageConfigs"> | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editFilters, setEditFilters] = useState<Filter[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add page modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"pageConfigs"> | null>(null);

  const selectedPage = pages?.find((p) => p._id === selectedId);

  const selectPage = (page: PageConfig) => {
    setSelectedId(page._id);
    setEditLabel(page.label);
    setEditSubtitle(page.subtitle);
    setEditFilters(JSON.parse(JSON.stringify(page.filters)));
    setDirty(false);
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);
    await upsert({
      categoryId: selectedPage.categoryId,
      label: editLabel,
      subtitle: editSubtitle,
      visible: selectedPage.visible,
      sortOrder: selectedPage.sortOrder,
      filters: editFilters,
    });
    setDirty(false);
    setSaving(false);
  };

  const handleAddPage = async () => {
    if (!newCategoryId.trim() || !newLabel.trim()) return;
    await addPageMut({
      categoryId: newCategoryId.trim(),
      label: newLabel.trim(),
      subtitle: newSubtitle.trim(),
    });
    setShowAddModal(false);
    setNewCategoryId("");
    setNewLabel("");
    setNewSubtitle("");
  };

  const handleDelete = async (id: Id<"pageConfigs">) => {
    await removePage({ id });
    if (selectedId === id) {
      setSelectedId(null);
    }
    setDeleteConfirmId(null);
  };

  const handleToggleVisibility = async (page: PageConfig) => {
    await updateVisibility({ id: page._id, visible: !page.visible });
  };

  // Filter editing helpers
  const updateFilterTitle = (filterIndex: number, title: string) => {
    const updated = [...editFilters];
    updated[filterIndex] = { ...updated[filterIndex], title };
    setEditFilters(updated);
    setDirty(true);
  };

  const updateOptionLabel = (filterIndex: number, optionIndex: number, label: string) => {
    const updated = [...editFilters];
    updated[filterIndex] = {
      ...updated[filterIndex],
      options: updated[filterIndex].options.map((o, i) =>
        i === optionIndex ? { ...o, label } : o
      ),
    };
    setEditFilters(updated);
    setDirty(true);
  };

  const updateOptionId = (filterIndex: number, optionIndex: number, id: string) => {
    const updated = [...editFilters];
    updated[filterIndex] = {
      ...updated[filterIndex],
      options: updated[filterIndex].options.map((o, i) =>
        i === optionIndex ? { ...o, id } : o
      ),
    };
    setEditFilters(updated);
    setDirty(true);
  };

  const removeOption = (filterIndex: number, optionIndex: number) => {
    const updated = [...editFilters];
    updated[filterIndex] = {
      ...updated[filterIndex],
      options: updated[filterIndex].options.filter((_, i) => i !== optionIndex),
    };
    setEditFilters(updated);
    setDirty(true);
  };

  const addOption = (filterIndex: number) => {
    const updated = [...editFilters];
    updated[filterIndex] = {
      ...updated[filterIndex],
      options: [...updated[filterIndex].options, { id: "", label: "" }],
    };
    setEditFilters(updated);
    setDirty(true);
  };

  const moveOption = (filterIndex: number, optionIndex: number, direction: "up" | "down") => {
    const updated = [...editFilters];
    const opts = [...updated[filterIndex].options];
    const targetIndex = direction === "up" ? optionIndex - 1 : optionIndex + 1;
    if (targetIndex < 0 || targetIndex >= opts.length) return;
    [opts[optionIndex], opts[targetIndex]] = [opts[targetIndex], opts[optionIndex]];
    updated[filterIndex] = { ...updated[filterIndex], options: opts };
    setEditFilters(updated);
    setDirty(true);
  };

  const addFilter = () => {
    setEditFilters([...editFilters, { id: "", title: "", options: [] }]);
    setDirty(true);
  };

  const updateFilterId = (filterIndex: number, id: string) => {
    const updated = [...editFilters];
    updated[filterIndex] = { ...updated[filterIndex], id };
    setEditFilters(updated);
    setDirty(true);
  };

  const removeFilter = (filterIndex: number) => {
    setEditFilters(editFilters.filter((_, i) => i !== filterIndex));
    setDirty(true);
  };

  if (pages === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold text-[#333] tracking-[0.32px]">Pages</h1>
        <div className="flex gap-2">
          {pages.length === 0 && (
            <button
              onClick={() => seed({})}
              className="h-9 px-4 bg-[#333] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#222] transition-colors"
            >
              Seed Defaults
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 bg-[#333] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#222] transition-colors"
          >
            Add Page
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left column: Page list */}
        <div className="w-[280px] flex-shrink-0">
          <div className="bg-white rounded-[8px] border border-[#e4e4e4] overflow-hidden">
            {pages.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-[#333]/50">
                No pages configured. Click &quot;Seed Defaults&quot; to initialize.
              </div>
            ) : (
              pages.map((page) => (
                <div
                  key={page._id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-[#e4e4e4] last:border-b-0 cursor-pointer transition-colors ${
                    selectedId === page._id ? "bg-[#f5f5f5]" : "hover:bg-[#fafafa]"
                  }`}
                  onClick={() => selectPage(page as PageConfig)}
                >
                  {/* Visibility toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(page as PageConfig);
                    }}
                    className={`w-8 h-4 rounded-full flex-shrink-0 transition-colors ${
                      page.visible ? "bg-gradient-to-l from-[#f14110] to-[#e9a28e]" : "bg-[#333]/20"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-all ${
                        page.visible ? "ml-4.5" : "ml-0.5"
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#333] truncate">{page.label}</p>
                    <p className="text-[10px] text-[#333]/50 truncate">{page.categoryId}</p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(page._id);
                    }}
                    className="text-[#333]/30 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Editor */}
        <div className="flex-1">
          {!selectedPage ? (
            <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-8 text-center text-[12px] text-[#333]/50">
              Select a page from the list to edit its configuration.
            </div>
          ) : (
            <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6">
              {/* Label */}
              <div className="mb-4">
                <label className="block text-[11px] font-medium text-[#333]/60 mb-1">Label</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => { setEditLabel(e.target.value); setDirty(true); }}
                  className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[13px] text-[#333] outline-none focus:border-[#333] transition-colors"
                />
              </div>

              {/* Subtitle */}
              <div className="mb-6">
                <label className="block text-[11px] font-medium text-[#333]/60 mb-1">Subtitle</label>
                <textarea
                  value={editSubtitle}
                  onChange={(e) => { setEditSubtitle(e.target.value); setDirty(true); }}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#e4e4e4] rounded-[6px] text-[13px] text-[#333] outline-none focus:border-[#333] transition-colors resize-none"
                />
              </div>

              {/* Filters */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-semibold text-[#333]">Filters</h3>
                  <button
                    onClick={addFilter}
                    className="text-[11px] text-[#333]/60 hover:text-[#333] transition-colors underline"
                  >
                    + Add Filter
                  </button>
                </div>

                {editFilters.map((filter, fi) => (
                  <div key={fi} className="mb-5 border border-[#e4e4e4] rounded-[6px] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={filter.id}
                        onChange={(e) => updateFilterId(fi, e.target.value)}
                        placeholder="Filter ID"
                        className="w-[140px] h-8 px-2 border border-[#e4e4e4] rounded-[4px] text-[11px] text-[#333]/60 outline-none focus:border-[#333]"
                      />
                      <input
                        type="text"
                        value={filter.title}
                        onChange={(e) => updateFilterTitle(fi, e.target.value)}
                        placeholder="Filter Title"
                        className="flex-1 h-8 px-2 border border-[#e4e4e4] rounded-[4px] text-[12px] font-medium text-[#333] outline-none focus:border-[#333]"
                      />
                      <button
                        onClick={() => removeFilter(fi)}
                        className="text-[#333]/30 hover:text-red-500 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Options */}
                    {filter.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2 mb-1.5">
                        <input
                          type="text"
                          value={opt.id}
                          onChange={(e) => updateOptionId(fi, oi, e.target.value)}
                          placeholder="id"
                          className="w-[120px] h-7 px-2 border border-[#e4e4e4] rounded-[4px] text-[11px] text-[#333]/60 outline-none focus:border-[#333]"
                        />
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => updateOptionLabel(fi, oi, e.target.value)}
                          placeholder="Label"
                          className="flex-1 h-7 px-2 border border-[#e4e4e4] rounded-[4px] text-[11px] text-[#333] outline-none focus:border-[#333]"
                        />
                        <button
                          onClick={() => moveOption(fi, oi, "up")}
                          disabled={oi === 0}
                          className="text-[#333]/30 hover:text-[#333] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 15l-6-6-6 6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveOption(fi, oi, "down")}
                          disabled={oi === filter.options.length - 1}
                          className="text-[#333]/30 hover:text-[#333] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeOption(fi, oi)}
                          className="text-[#333]/30 hover:text-red-500 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addOption(fi)}
                      className="mt-2 text-[11px] text-[#333]/50 hover:text-[#333] transition-colors"
                    >
                      + Add Option
                    </button>
                  </div>
                ))}
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={!dirty || saving}
                className={`h-9 px-6 rounded-[6px] text-[12px] font-medium transition-colors ${
                  dirty
                    ? "bg-[#333] text-white hover:bg-[#222]"
                    : "bg-[#e4e4e4] text-[#333]/40 cursor-not-allowed"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-[8px] p-6 w-[400px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[16px] font-bold text-[#333] mb-4">Add New Page</h2>
            <div className="mb-3">
              <label className="block text-[11px] font-medium text-[#333]/60 mb-1">Category ID</label>
              <input
                type="text"
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                placeholder="e.g. landscaping"
                className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[13px] text-[#333] outline-none focus:border-[#333]"
              />
            </div>
            <div className="mb-3">
              <label className="block text-[11px] font-medium text-[#333]/60 mb-1">Label</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. 06. Landscaping"
                className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[13px] text-[#333] outline-none focus:border-[#333]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[11px] font-medium text-[#333]/60 mb-1">Subtitle</label>
              <textarea
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                placeholder="Description text..."
                rows={2}
                className="w-full px-3 py-2 border border-[#e4e4e4] rounded-[6px] text-[13px] text-[#333] outline-none focus:border-[#333] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="h-9 px-4 text-[12px] font-medium text-[#333]/60 hover:text-[#333] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPage}
                disabled={!newCategoryId.trim() || !newLabel.trim()}
                className="h-9 px-4 bg-[#333] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-[8px] p-6 w-[360px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[16px] font-bold text-[#333] mb-2">Delete Page</h2>
            <p className="text-[13px] text-[#333]/60 mb-4">
              Are you sure you want to delete this page configuration? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-9 px-4 text-[12px] font-medium text-[#333]/60 hover:text-[#333] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="h-9 px-4 bg-red-500 text-white text-[12px] font-medium rounded-[6px] hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
