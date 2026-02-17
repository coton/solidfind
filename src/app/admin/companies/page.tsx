"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function AdminCompanies() {
  const companies = useQuery(api.companies.listAll);
  const updateCompany = useMutation(api.companies.update);
  const removeCompany = useMutation(api.companies.remove);

  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = companies?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTogglePro = async (id: string, currentPro: boolean) => {
    await updateCompany({ id: id as any, isPro: !currentPro });
  };

  const handleDelete = async (id: string) => {
    await removeCompany({ id: id as any });
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Companies</h1>
        <span className="text-[12px] text-[#333]/50">{filtered?.length ?? 0} total</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="w-full max-w-[300px] h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e4e4e4] bg-[#fafafa]">
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Name</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Category</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Owner</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Pro</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Created</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered === undefined ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-[#333]/50">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-[#333]/50">
                  No companies found.
                </td>
              </tr>
            ) : (
              filtered.map((company) => (
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
                  <td className="px-4 py-3 text-[11px] text-[#333]/50">{company.ownerEmail}</td>
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
    </div>
  );
}
