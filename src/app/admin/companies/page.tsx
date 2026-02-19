"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Pagination, { PAGE_SIZE } from "../components/Pagination";

const CATEGORIES = ["all", "construction", "renovation", "architecture", "interior", "real-estate"] as const;
const STATUS_OPTIONS = ["all", "pro", "free"] as const;

export default function AdminCompanies() {
  const companies = useQuery(api.companies.listAll);
  const updateCompany = useMutation(api.companies.update);
  const removeCompany = useMutation(api.companies.remove);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const filtered = companies?.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || c.category === category;
    const matchesStatus =
      status === "all" ||
      (status === "pro" && c.isPro) ||
      (status === "free" && !c.isPro);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = filtered?.length ?? 0;
  const paginated = filtered?.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleFilterChange = () => setCurrentPage(0);

  const handleTogglePro = async (id: string, currentPro: boolean) => {
    await updateCompany({ id: id as Parameters<typeof updateCompany>[0]["id"], isPro: !currentPro });
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    await updateCompany({ id: id as Parameters<typeof updateCompany>[0]["id"], isFeatured: !currentFeatured });
  };

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "admin";

  const handleDelete = async (id: string) => {
    await removeCompany({ id: id as Parameters<typeof removeCompany>[0]["id"], adminEmail });
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Companies</h1>
        <span className="text-[12px] text-[#333]/50">{totalItems} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
          placeholder="Search companies..."
          className="w-full max-w-[300px] h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); handleFilterChange(); }}
          className="h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All categories" : cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); handleFilterChange(); }}
          className="h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All status" : s === "pro" ? "Pro" : "Free"}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#e4e4e4] bg-[#fafafa]">
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Name</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Category</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Rating</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Reviews</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Pro</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Featured</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Created</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated === undefined ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-[#333]/50">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-[#333]/50">
                  No companies found.
                </td>
              </tr>
            ) : (
              paginated.map((company) => (
                <tr key={company._id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/profile/${company._id}`}
                      className="text-[12px] font-medium text-[#333] hover:text-[#f14110] transition-colors"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/70 capitalize">{company.category}</td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/70">
                    {company.rating ? (
                      <span className="text-amber-500">★ {company.rating.toFixed(1)}</span>
                    ) : (
                      <span className="text-[#333]/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/60">
                    {company.reviewCount ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    {company.isPro ? (
                      <span className="text-[9px] font-medium text-[#f14110] bg-[#f14110]/10 px-2 py-0.5 rounded-full">
                        PRO
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium text-[#333]/40 bg-[#f0f0f0] px-2 py-0.5 rounded-full">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {company.isFeatured ? (
                      <span className="text-[11px]">⭐</span>
                    ) : (
                      <span className="text-[#333]/30 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/50">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePro(company._id, company.isPro)}
                        className="text-[10px] font-medium px-3 py-1 rounded-full border border-[#e4e4e4] hover:bg-[#333] hover:text-white hover:border-[#333] transition-colors"
                      >
                        {company.isPro ? "Remove Pro" : "Make Pro"}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(company._id, !!company.isFeatured)}
                        className="text-[10px] font-medium px-3 py-1 rounded-full border border-[#e4e4e4] hover:bg-[#333] hover:text-white hover:border-[#333] transition-colors"
                      >
                        {company.isFeatured ? "Unfeature" : "Feature"}
                      </button>
                      {confirmDelete === company._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(company._id)}
                            className="text-[10px] font-medium px-3 py-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-[10px] font-medium px-3 py-1 rounded-full border border-[#e4e4e4] hover:bg-[#f0f0f0] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(company._id)}
                          className="text-[10px] font-medium px-3 py-1 rounded-full border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
