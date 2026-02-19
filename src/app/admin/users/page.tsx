"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Pagination, { PAGE_SIZE } from "../components/Pagination";

export default function AdminUsers() {
  const users = useQuery(api.users.listAll);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const filtered = users?.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q)
    );
  });

  const totalItems = filtered?.length ?? 0;
  const paginated = filtered?.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return (email?.[0] || "?").toUpperCase();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Users</h1>
        <span className="text-[12px] text-[#333]/50">{totalItems} total</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
          placeholder="Search by name or email..."
          className="w-full max-w-[300px] h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead>
            <tr className="border-b border-[#e4e4e4] bg-[#fafafa]">
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">User</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Email</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Type</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {paginated === undefined ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[12px] text-[#333]/50">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[12px] text-[#333]/50">
                  No users found.
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr key={user._id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {user.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={user.name || ""}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#333] text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                          {getInitials(user.name, user.email)}
                        </div>
                      )}
                      <span className="text-[12px] font-medium text-[#333]">
                        {user.name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/50">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                        user.accountType === "company"
                          ? "text-blue-600 bg-blue-50"
                          : "text-[#333]/50 bg-[#f0f0f0]"
                      }`}
                    >
                      {user.accountType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/50">
                    {new Date(user.createdAt).toLocaleDateString()}
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
