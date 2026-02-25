"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";

export default function WaitlistPage() {
  const waitlistData = useQuery(api.waitlist.getWaitlist, {});
  const markAsNotified = useMutation(api.waitlist.markAsNotified);
  const deleteEmail = useMutation(api.waitlist.deleteWaitlistEmail);
  
  const [selectedEmails, setSelectedEmails] = useState<Set<Id<"waitlist">>>(new Set());
  const [filter, setFilter] = useState<"all" | "pending" | "notified">("all");

  if (!waitlistData) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading waitlist...</div>
      </div>
    );
  }

  const filteredEmails = waitlistData.emails.filter((email) => {
    if (filter === "pending") return !email.notified;
    if (filter === "notified") return email.notified;
    return true;
  });

  const handleSelectAll = () => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredEmails.map((e) => e._id)));
    }
  };

  const handleToggleSelect = (id: Id<"waitlist">) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmails(newSelected);
  };

  const handleNotifySelected = async () => {
    if (selectedEmails.size === 0) return;
    
    if (confirm(`Send launch notification to ${selectedEmails.size} email(s)?`)) {
      await markAsNotified({ emailIds: Array.from(selectedEmails) });
      setSelectedEmails(new Set());
      alert(`${selectedEmails.size} email(s) marked as notified!`);
    }
  };

  const handleDeleteEmail = async (id: Id<"waitlist">) => {
    if (confirm("Delete this email from waitlist?")) {
      await deleteEmail({ emailId: id });
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Email", "Status", "Joined Date", "Notified Date"],
      ...filteredEmails.map((e) => [
        e.email,
        e.notified ? "Notified" : "Pending",
        new Date(e.createdAt).toLocaleDateString(),
        e.notifiedAt ? new Date(e.notifiedAt).toLocaleDateString() : "-",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solidfind-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Waitlist</h1>
        <p className="text-gray-600">
          Manage email signups from the Coming Soon page
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Signups</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {waitlistData.total}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Pending</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {waitlistData.pending}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Notified</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {waitlistData.notified}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "all"
                  ? "bg-[#F14110] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({waitlistData.total})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "pending"
                  ? "bg-[#F14110] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending ({waitlistData.pending})
            </button>
            <button
              onClick={() => setFilter("notified")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "notified"
                  ? "bg-[#F14110] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Notified ({waitlistData.notified})
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedEmails.size > 0 && (
            <button
              onClick={handleNotifySelected}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              Mark as Notified ({selectedEmails.size})
            </button>
          )}
        </div>

        {/* Export */}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedEmails.size === filteredEmails.length && filteredEmails.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#F14110] focus:ring-[#F14110]"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notified Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmails.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No emails found
                </td>
              </tr>
            ) : (
              filteredEmails.map((email) => (
                <tr key={email._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedEmails.has(email._id)}
                      onChange={() => handleToggleSelect(email._id)}
                      className="rounded border-gray-300 text-[#F14110] focus:ring-[#F14110]"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {email.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        email.notified
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {email.notified ? "Notified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(email.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {email.notifiedAt
                      ? new Date(email.notifiedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteEmail(email._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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
