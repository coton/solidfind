"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Pagination, { PAGE_SIZE } from "../components/Pagination";

type CleanupResponse = {
  mode: string;
  target: string | null;
  envFile: string | null;
  convexUrl: string;
  emails: string[];
  before: {
    convexMatches: Array<{ email: string; _id?: string; clerkId?: string }>;
    clerkMatches: Array<{ queryEmail: string; clerkId: string; primaryEmail: string | null }>;
  };
  deletedConvex: Array<{ email: string; userId: string; clerkId?: string }>;
  deletedClerk: Array<{ queryEmail: string; clerkId: string; primaryEmail: string | null }>;
  after: {
    convexMatches: Array<{ email: string; _id?: string; clerkId?: string }>;
    clerkMatches: Array<{ queryEmail: string; clerkId: string; primaryEmail: string | null }>;
  };
};

export default function AdminUsers() {
  const users = useQuery(api.users.listAll);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [cleanupLoading, setCleanupLoading] = useState<"dry-run" | "apply" | null>(null);
  const [cleanupError, setCleanupError] = useState("");
  const [cleanupResult, setCleanupResult] = useState<CleanupResponse | null>(null);

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

  const cleanupSummary = useMemo(() => {
    if (!cleanupResult) return null;
    return {
      beforeCount: cleanupResult.before.convexMatches.length + cleanupResult.before.clerkMatches.length,
      afterCount: cleanupResult.after.convexMatches.length + cleanupResult.after.clerkMatches.length,
      deletedCount: cleanupResult.deletedConvex.length + cleanupResult.deletedClerk.length,
    };
  }, [cleanupResult]);

  const runCleanup = async (apply: boolean) => {
    if (apply && !window.confirm("Delete the known test users from the current admin environment?")) {
      return;
    }

    setCleanupLoading(apply ? "apply" : "dry-run");
    setCleanupError("");

    try {
      const response = await fetch("/api/admin/cleanup-test-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Cleanup failed");
      }

      setCleanupResult(data as CleanupResponse);
    } catch (error) {
      setCleanupError(error instanceof Error ? error.message : "Cleanup failed");
    } finally {
      setCleanupLoading(null);
    }
  };

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
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Users</h1>
          <span className="text-[12px] text-[#333]/50">{totalItems} total</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => runCleanup(false)}
            disabled={cleanupLoading !== null}
            className="h-9 px-4 rounded-[6px] border border-[#333] text-[#333] text-[11px] font-medium hover:border-[#f14110] hover:text-[#f14110] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cleanupLoading === "dry-run" ? "Checking..." : "Preview test-user cleanup"}
          </button>
          <button
            onClick={() => runCleanup(true)}
            disabled={cleanupLoading !== null}
            className="h-9 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cleanupLoading === "apply" ? "Deleting..." : "Delete test users"}
          </button>
        </div>
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

      {(cleanupError || cleanupResult) && (
        <div className="mb-4 bg-white rounded-[8px] border border-[#e4e4e4] p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-[13px] font-semibold text-[#333]">Test-user cleanup</h2>
              {cleanupResult && (
                <p className="text-[10px] text-[#333]/50 mt-1">
                  Mode: {cleanupResult.mode} · Runtime: {cleanupResult.target || "runtime"}
                </p>
              )}
            </div>
            {cleanupSummary && (
              <div className="flex gap-4 text-[10px] text-[#333]/70">
                <span>Before: {cleanupSummary.beforeCount}</span>
                <span>Deleted: {cleanupSummary.deletedCount}</span>
                <span>After: {cleanupSummary.afterCount}</span>
              </div>
            )}
          </div>

          {cleanupError && (
            <p className="mt-3 text-[11px] text-red-600">{cleanupError}</p>
          )}

          {cleanupResult && (
            <div className="mt-3 grid md:grid-cols-3 gap-3">
              <div className="rounded-[6px] bg-[#fafafa] border border-[#e4e4e4] p-3">
                <p className="text-[10px] font-semibold text-[#333]/70 mb-2">Convex matches before</p>
                <div className="space-y-1 max-h-[160px] overflow-auto">
                  {cleanupResult.before.convexMatches.length === 0 ? (
                    <p className="text-[11px] text-[#333]/50">None</p>
                  ) : cleanupResult.before.convexMatches.map((item) => (
                    <p key={`${item.email}-${item._id || item.clerkId || 'before'}`} className="text-[11px] text-[#333] break-all">{item.email}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-[6px] bg-[#fafafa] border border-[#e4e4e4] p-3">
                <p className="text-[10px] font-semibold text-[#333]/70 mb-2">Deleted</p>
                <div className="space-y-1 max-h-[160px] overflow-auto">
                  {cleanupResult.deletedConvex.length === 0 && cleanupResult.deletedClerk.length === 0 ? (
                    <p className="text-[11px] text-[#333]/50">Nothing deleted</p>
                  ) : (
                    <>
                      {cleanupResult.deletedConvex.map((item) => (
                        <p key={`${item.email}-${item.userId}`} className="text-[11px] text-[#333] break-all">Convex: {item.email}</p>
                      ))}
                      {cleanupResult.deletedClerk.map((item) => (
                        <p key={`${item.queryEmail}-${item.clerkId}`} className="text-[11px] text-[#333] break-all">Clerk: {item.primaryEmail || item.queryEmail}</p>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-[6px] bg-[#fafafa] border border-[#e4e4e4] p-3">
                <p className="text-[10px] font-semibold text-[#333]/70 mb-2">Remaining after</p>
                <div className="space-y-1 max-h-[160px] overflow-auto">
                  {cleanupResult.after.convexMatches.length === 0 && cleanupResult.after.clerkMatches.length === 0 ? (
                    <p className="text-[11px] text-green-600">No matches remain</p>
                  ) : (
                    <>
                      {cleanupResult.after.convexMatches.map((item) => (
                        <p key={`${item.email}-${item._id || item.clerkId || 'after'}`} className="text-[11px] text-[#333] break-all">Convex: {item.email}</p>
                      ))}
                      {cleanupResult.after.clerkMatches.map((item) => (
                        <p key={`${item.queryEmail}-${item.clerkId}`} className="text-[11px] text-[#333] break-all">Clerk: {item.primaryEmail || item.queryEmail}</p>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
