"use client";

import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function FeaturedArticlesAdmin() {
  const articles = useQuery(api.featuredArticles.list);
  const createArticle = useMutation(api.featuredArticles.create);
  const removeArticle = useMutation(api.featuredArticles.remove);
  const updateVisibility = useMutation(api.featuredArticles.updateVisibility);

  const handleCreate = async () => {
    const maxSort = articles?.reduce((max, a) => Math.max(max, a.sortOrder), 0) ?? 0;
    await createArticle({
      title: "New Article",
      visible: true,
      sortOrder: maxSort + 1,
      contentBlocks: [],
    });
  };

  const handleToggleVisible = async (id: Id<"featuredArticles">, currentVisible: boolean) => {
    await updateVisibility({ id, visible: !currentVisible });
  };

  const handleDelete = async (id: Id<"featuredArticles">) => {
    if (!confirm("Delete this article?")) return;
    await removeArticle({ id });
  };

  if (articles === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Featured Articles</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[#333] text-white text-[12px] font-medium hover:bg-[#111] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-12 text-center">
          <p className="text-[13px] text-[#333]/50 mb-4">No featured articles yet.</p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[#333] text-white text-[12px] font-medium hover:bg-[#111] transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create your first article
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map((article) => (
            <div
              key={article._id}
              className="bg-white rounded-[8px] border border-[#e4e4e4] px-4 py-3 flex items-center gap-4"
            >
              <GripVertical className="w-4 h-4 text-[#333]/20 flex-shrink-0" />

              <div className="w-12 h-12 rounded-[4px] bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#333]/20 text-[9px]">No img</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#333] truncate">{article.title}</p>
                <p className="text-[10px] text-[#333]/50 truncate">{article.subtitle || "No subtitle"}</p>
                {article.category && (
                  <span className="inline-block text-[9px] bg-[#f5f5f5] text-[#333]/60 px-2 py-0.5 rounded-full mt-0.5">
                    {article.category}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleToggleVisible(article._id, article.visible)}
                title={article.visible ? "Visible — click to hide" : "Hidden — click to show"}
                className={`flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[10px] font-medium transition-colors ${
                  article.visible
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-[#f5f5f5] text-[#333]/50 hover:bg-[#eee]"
                }`}
              >
                {article.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {article.visible ? "Visible" : "Hidden"}
              </button>

              <Link
                href={`/admin/featured-articles/${article._id}`}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#e4e4e4] hover:border-[#333] transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5 text-[#333]/60" />
              </Link>

              <button
                onClick={() => handleDelete(article._id)}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#e4e4e4] hover:border-red-300 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#333]/40" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
