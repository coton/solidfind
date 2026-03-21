"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Eye, EyeOff, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { uploadFile } from "@/lib/uploadFile";

type BlockType = "text" | "image" | "quote" | "heading" | "video";

interface ContentBlock {
  type: BlockType;
  text?: string;
  heading?: string;
  imageId?: Id<"_storage">;
  imageUrl?: string;
  imageCaption?: string;
  quote?: string;
  quoteAuthor?: string;
  videoUrl?: string;
  videoStorageId?: Id<"_storage">;
}

export default function EditFeaturedArticle() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const article = useQuery(
    api.featuredArticles.getById,
    id ? { id: id as Id<"featuredArticles"> } : "skip"
  );
  const companies = useQuery(api.companies.list, {});
  const updateArticle = useMutation(api.featuredArticles.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("");
  const [visible, setVisible] = useState(true);
  const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | undefined>();
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const coverImgRef = useRef<HTMLInputElement>(null);

  // Initialize form from article data
  useEffect(() => {
    if (article && !initialized) {
      setTitle(article.title);
      setSubtitle(article.subtitle ?? "");
      setCategory(article.category ?? "");
      setVisible(article.visible);
      setCoverImageId(article.coverImageId);
      setCoverImageUrl(article.coverImageUrl ?? "");
      setCompanyId(article.companyId ?? "");
      setContentBlocks(article.contentBlocks as ContentBlock[]);
      setInitialized(true);
    }
  }, [article, initialized]);

  const handleUpload = useCallback(async (file: File): Promise<{ storageId: Id<"_storage">; url: string }> => {
    const url = await generateUploadUrl();
    const storageId = await uploadFile(file, url);
    return { storageId: storageId as Id<"_storage">, url: "" };
  }, [generateUploadUrl]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File must be under 5MB"); return; }
    const { storageId } = await handleUpload(file);
    setCoverImageId(storageId);
    setCoverImageUrl("");
  };

  const save = async () => {
    await updateArticle({
      id: id as Id<"featuredArticles">,
      title,
      subtitle: subtitle || undefined,
      category: category || undefined,
      companyId: companyId ? (companyId as Id<"companies">) : null,
      visible,
      coverImageId,
      coverImageUrl: coverImageUrl || undefined,
      contentBlocks,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Block operations
  const addBlock = (type: BlockType) => {
    const block: ContentBlock = { type };
    if (type === "text") block.text = "";
    if (type === "heading") block.heading = "";
    if (type === "quote") { block.quote = ""; block.quoteAuthor = ""; }
    if (type === "video") { block.videoUrl = ""; }
    setContentBlocks([...contentBlocks, block]);
  };

  const updateBlock = (index: number, patch: Partial<ContentBlock>) => {
    setContentBlocks(contentBlocks.map((b, i) => i === index ? { ...b, ...patch } : b));
  };

  const removeBlock = (index: number) => {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= contentBlocks.length) return;
    const updated = [...contentBlocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setContentBlocks(updated);
  };

  const handleBlockImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File must be under 5MB"); return; }
    const { storageId } = await handleUpload(file);
    updateBlock(index, { imageId: storageId, imageUrl: "" });
  };

  const handleBlockVideoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert("File must be under 50MB"); return; }
    const { storageId } = await handleUpload(file);
    updateBlock(index, { videoStorageId: storageId, videoUrl: "" });
  };

  if (article === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="text-center py-12">
        <p className="text-[14px] text-[#333]/50 mb-4">Article not found.</p>
        <Link href="/admin/featured-articles" className="text-[12px] text-[#333] underline">Back to list</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/featured-articles" className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#e4e4e4] hover:border-[#333] transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#333]" />
        </Link>
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px] flex-1">Edit Article</h1>
        <button
          onClick={() => setVisible(!visible)}
          className={`flex items-center gap-2 h-9 px-3 rounded-[6px] border text-[11px] font-medium transition-colors ${
            visible
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-[#e4e4e4] text-[#333]/50 hover:border-[#333]"
          }`}
        >
          {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {visible ? "Visible" : "Hidden"}
        </button>
        <button
          onClick={save}
          className="h-9 px-5 rounded-[6px] bg-[#333] text-white text-[12px] font-medium hover:bg-[#111] transition-colors"
        >
          {saved ? "Saved!" : "Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Left: basic fields */}
        <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6">
          <h2 className="text-[13px] font-semibold text-[#333] mb-4 pb-3 border-b border-[#e4e4e4]">Content</h2>
          <div className="space-y-4">
            {[
              { label: "Title", value: title, setter: setTitle, placeholder: "Article title" },
              { label: "Subtitle", value: subtitle, setter: setSubtitle, placeholder: "Short description" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label}>
                <label className="block text-[11px] font-medium text-[#333]/70 mb-1">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-medium text-[#333]/70 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors bg-white"
              >
                <option value="">— Select category —</option>
                <option value="construction">Construction</option>
                <option value="renovation">Renovation</option>
                <option value="architecture">Architecture</option>
                <option value="interior">Interior</option>
                <option value="real-estate">Real Estate</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#333]/70 mb-1">Linked Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors bg-white"
              >
                <option value="">— No company —</option>
                {companies?.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: cover image */}
        <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6">
          <h2 className="text-[13px] font-semibold text-[#333] mb-4 pb-3 border-b border-[#e4e4e4]">Cover Image</h2>

          <div className="mb-3">
            <label className="block text-[11px] font-medium text-[#333]/70 mb-1">Image URL (fallback)</label>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => { setCoverImageUrl(e.target.value); setCoverImageId(undefined); }}
              placeholder="https://..."
              className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => coverImgRef.current?.click()}
            className="flex items-center gap-2 h-9 px-4 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors mb-4"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload image
          </button>
          <input ref={coverImgRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          <CoverImagePreview coverImageId={coverImageId} coverImageUrl={coverImageUrl} />
        </div>
      </div>

      {/* Content Blocks Editor */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6">
        <h2 className="text-[13px] font-semibold text-[#333] mb-4 pb-3 border-b border-[#e4e4e4]">Content Blocks</h2>

        {contentBlocks.length === 0 && (
          <p className="text-[11px] text-[#333]/40 mb-4">No content blocks yet. Add one below.</p>
        )}

        <div className="space-y-3 mb-4">
          {contentBlocks.map((block, index) => (
            <div key={index} className="border border-[#e4e4e4] rounded-[6px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold text-[#333]/50 uppercase tracking-wider">{block.type}</span>
                <div className="flex-1" />
                <button onClick={() => moveBlock(index, -1)} disabled={index === 0} className="w-7 h-7 flex items-center justify-center rounded border border-[#e4e4e4] hover:border-[#333] disabled:opacity-20 transition-colors">
                  <ChevronUp className="w-3.5 h-3.5 text-[#333]" />
                </button>
                <button onClick={() => moveBlock(index, 1)} disabled={index === contentBlocks.length - 1} className="w-7 h-7 flex items-center justify-center rounded border border-[#e4e4e4] hover:border-[#333] disabled:opacity-20 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5 text-[#333]" />
                </button>
                <button onClick={() => removeBlock(index)} className="w-7 h-7 flex items-center justify-center rounded border border-[#e4e4e4] hover:border-red-300 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-[#333]/40" />
                </button>
              </div>

              {block.type === "heading" && (
                <input
                  type="text"
                  value={block.heading ?? ""}
                  onChange={(e) => updateBlock(index, { heading: e.target.value })}
                  placeholder="Heading text"
                  className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[13px] font-semibold text-[#333] outline-none focus:border-[#333] transition-colors"
                />
              )}

              {block.type === "text" && (
                <textarea
                  value={block.text ?? ""}
                  onChange={(e) => updateBlock(index, { text: e.target.value })}
                  placeholder="Paragraph text..."
                  rows={4}
                  className="w-full px-3 py-2 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors resize-y"
                />
              )}

              {block.type === "image" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={block.imageUrl ?? ""}
                      onChange={(e) => updateBlock(index, { imageUrl: e.target.value, imageId: undefined })}
                      placeholder="Image URL or upload"
                      className="flex-1 h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
                    />
                    <label className="flex items-center gap-1.5 h-9 px-3 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBlockImageUpload(index, e)} />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={block.imageCaption ?? ""}
                    onChange={(e) => updateBlock(index, { imageCaption: e.target.value })}
                    placeholder="Caption (optional)"
                    className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333]/70 outline-none focus:border-[#333] transition-colors"
                  />
                  <BlockImagePreview imageId={block.imageId} imageUrl={block.imageUrl} />
                </div>
              )}

              {block.type === "quote" && (
                <div className="space-y-2">
                  <textarea
                    value={block.quote ?? ""}
                    onChange={(e) => updateBlock(index, { quote: e.target.value })}
                    placeholder="Quote text..."
                    rows={2}
                    className="w-full px-3 py-2 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] italic outline-none focus:border-[#333] transition-colors resize-y"
                  />
                  <input
                    type="text"
                    value={block.quoteAuthor ?? ""}
                    onChange={(e) => updateBlock(index, { quoteAuthor: e.target.value })}
                    placeholder="Author name"
                    className="w-full h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333]/70 outline-none focus:border-[#333] transition-colors"
                  />
                </div>
              )}

              {block.type === "video" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={block.videoUrl ?? ""}
                      onChange={(e) => updateBlock(index, { videoUrl: e.target.value, videoStorageId: undefined })}
                      placeholder="Video URL or upload"
                      className="flex-1 h-9 px-3 border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
                    />
                    <label className="flex items-center gap-1.5 h-9 px-3 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => handleBlockVideoUpload(index, e)} />
                    </label>
                  </div>
                  <BlockVideoPreview videoStorageId={block.videoStorageId} videoUrl={block.videoUrl} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Block */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#333]/50">Add block:</span>
          {(["heading", "text", "image", "quote", "video"] as BlockType[]).map((type) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors capitalize"
            >
              <Plus className="w-3 h-3" />
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoverImagePreview({ coverImageId, coverImageUrl }: { coverImageId?: Id<"_storage">; coverImageUrl: string }) {
  const url = useQuery(api.files.getUrl, coverImageId ? { storageId: coverImageId } : "skip");
  const displayUrl = url ?? coverImageUrl;

  if (!displayUrl) return null;
  return (
    <div className="rounded-[8px] overflow-hidden border border-[#e4e4e4] aspect-video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={displayUrl} alt="Cover preview" className="w-full h-full object-cover" />
    </div>
  );
}

function BlockImagePreview({ imageId, imageUrl }: { imageId?: Id<"_storage">; imageUrl?: string }) {
  const url = useQuery(api.files.getUrl, imageId ? { storageId: imageId } : "skip");
  const displayUrl = url ?? imageUrl;

  if (!displayUrl) return null;
  return (
    <div className="rounded-[6px] overflow-hidden border border-[#e4e4e4] max-w-[300px] aspect-video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={displayUrl} alt="Block image preview" className="w-full h-full object-cover" />
    </div>
  );
}

function BlockVideoPreview({ videoStorageId, videoUrl }: { videoStorageId?: Id<"_storage">; videoUrl?: string }) {
  const url = useQuery(api.files.getUrl, videoStorageId ? { storageId: videoStorageId } : "skip");
  const displayUrl = url ?? videoUrl;

  if (!displayUrl) return null;
  return (
    <div className="rounded-[6px] overflow-hidden border border-[#e4e4e4] max-w-[300px]">
      <video src={displayUrl} controls className="w-full" />
    </div>
  );
}
