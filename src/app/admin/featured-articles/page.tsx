"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";

const STORAGE_KEY = "solidfind_featured_articles";

export interface FeaturedArticle {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  linkUrl: string;
  visible: boolean;
  createdAt: number;
}

function createArticle(): FeaturedArticle {
  return {
    id: Date.now().toString(),
    title: "New Article",
    subtitle: "",
    category: "",
    imageUrl: "",
    linkUrl: "",
    visible: true,
    createdAt: Date.now(),
  };
}

export default function FeaturedArticlesAdmin() {
  const [articles, setArticles] = useState<FeaturedArticle[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setArticles(JSON.parse(stored) as FeaturedArticle[]); } catch { /* ignore */ }
    }
  }, []);

  const persist = (updated: FeaturedArticle[]) => {
    setArticles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addArticle = () => {
    const next = [createArticle(), ...articles];
    persist(next);
  };

  const toggleVisible = (id: string) => {
    persist(articles.map((a) => a.id === id ? { ...a, visible: !a.visible } : a));
  };

  const deleteArticle = (id: string) => {
    if (!confirm("Delete this article?")) return;
    persist(articles.filter((a) => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Featured Articles</h1>
        <button
          onClick={addArticle}
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
            onClick={addArticle}
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
              key={article.id}
              className="bg-white rounded-[8px] border border-[#e4e4e4] px-4 py-3 flex items-center gap-4"
            >
              {/* Drag handle (visual only) */}
              <GripVertical className="w-4 h-4 text-[#333]/20 flex-shrink-0" />

              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-[4px] bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                {article.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#333]/20 text-[9px]">No img</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#333] truncate">{article.title}</p>
                <p className="text-[10px] text-[#333]/50 truncate">{article.subtitle || "No subtitle"}</p>
                {article.category && (
                  <span className="inline-block text-[9px] bg-[#f5f5f5] text-[#333]/60 px-2 py-0.5 rounded-full mt-0.5">
                    {article.category}
                  </span>
                )}
              </div>

              {/* Visible toggle */}
              <button
                onClick={() => toggleVisible(article.id)}
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

              {/* Edit */}
              <Link
                href={`/admin/featured-articles/${article.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#e4e4e4] hover:border-[#333] transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5 text-[#333]/60" />
              </Link>

              {/* Delete */}
              <button
                onClick={() => deleteArticle(article.id)}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#e4e4e4] hover:border-red-300 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#333]/40 group-hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
