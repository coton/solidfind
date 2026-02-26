"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Eye, EyeOff } from "lucide-react";
import type { FeaturedArticle } from "../page";

const STORAGE_KEY = "solidfind_featured_articles";

export default function EditFeaturedArticle() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [article, setArticle] = useState<FeaturedArticle | null>(null);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) { setNotFound(true); return; }
    try {
      const list = JSON.parse(stored) as FeaturedArticle[];
      const found = list.find((a) => a.id === id);
      if (found) setArticle(found);
      else setNotFound(true);
    } catch { setNotFound(true); }
  }, [id]);

  const u = (patch: Partial<FeaturedArticle>) => setArticle((prev) => prev ? { ...prev, ...patch } : prev);

  const save = () => {
    if (!article) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const list: FeaturedArticle[] = stored ? JSON.parse(stored) : [];
    const updated = list.map((a) => a.id === id ? article : a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => u({ imageUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  if (notFound) return (
    <div className="text-center py-12">
      <p className="text-[14px] text-[#333]/50 mb-4">Article not found.</p>
      <Link href="/admin/featured-articles" className="text-[12px] text-[#333] underline">← Back to list</Link>
    </div>
  );

  if (!article) return (
    <div className="flex justify-center py-12">
      <div className="w-5 h-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/featured-articles" className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#e4e4e4] hover:border-[#333] transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#333]" />
        </Link>
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px] flex-1">Edit Article</h1>
        <button
          onClick={() => u({ visible: !article.visible })}
          className={`flex items-center gap-2 h-9 px-3 rounded-[6px] border text-[11px] font-medium transition-colors ${
            article.visible
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-[#e4e4e4] text-[#333]/50 hover:border-[#333]"
          }`}
        >
          {article.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {article.visible ? "Visible" : "Hidden"}
        </button>
        <button
          onClick={save}
          className="h-9 px-5 rounded-[6px] bg-[#333] text-white text-[12px] font-medium hover:bg-[#111] transition-colors"
        >
          {saved ? "✓ Saved!" : "Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: form */}
        <div className="space-y-4">
          <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6">
            <h2 className="text-[13px] font-semibold text-[#333] mb-4 pb-3 border-b border-[#e4e4e4]">Content</h2>

            <div className="space-y-4">
              {[
                { label: "Title", key: "title", placeholder: "Article title" },
                { label: "Subtitle", key: "subtitle", placeholder: "Short description" },
                { label: "Category", key: "category", placeholder: "e.g. Architecture, Interior" },
                { label: "Link URL", key: "linkUrl", placeholder: "https://..." },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-medium text-[#333]/70 mb-1">{label}</label>
                  <input
                    type="text"
                    value={article[key as keyof FeaturedArticle] as string}
                    onChange={(e) => u({ [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: image */}
        <div>
          <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6">
            <h2 className="text-[13px] font-semibold text-[#333] mb-4 pb-3 border-b border-[#e4e4e4]">Card Image</h2>

            <div className="mb-3">
              <label className="block text-[11px] font-medium text-[#333]/70 mb-1">Image URL</label>
              <input
                type="text"
                value={article.imageUrl}
                onChange={(e) => u({ imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              className="flex items-center gap-2 h-9 px-4 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors mb-4"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload image
            </button>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

            {article.imageUrl && (
              <div className="rounded-[8px] overflow-hidden border border-[#e4e4e4] aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
