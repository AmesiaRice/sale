"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRetailersList } from "@/hooks/admin/useRetailersList";
import { useAllOrders } from "@/hooks/admin/useAllOrders";
import { useRetailerConversations } from "@/hooks/admin/useRetailerConversations";
import { useAdminSession } from "@/hooks/admin/useAdminSession";

const REGISTER_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScJNuY1uM4y6D-AcBmTqngyQxMtInskVsTrv-cfFJSmtEesZw/viewform";

const TABS = [
  { key: "retailers", label: "Retailers" },
  { key: "conversations", label: "Conversations" },
];

export default function RetailersManagement() {
  const [activeTab, setActiveTab] = useState("retailers");
  const [search, setSearch] = useState("");

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
          Retailers Management
        </h1>

        <a
          href={REGISTER_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white cursor-pointer"
          style={{ backgroundColor: "var(--color-gold-500)" }}
        >
          + Register Retailer
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearch("");
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer"
            style={{
              backgroundColor: activeTab === tab.key ? "var(--color-gold-500)" : "var(--color-gold-100)",
              color: activeTab === tab.key ? "#fff" : "var(--color-gold-700)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by name, company, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm w-full max-w-md"
        style={{ borderColor: "var(--color-gold-200)" }}
      />

      {activeTab === "retailers" ? (
        <RetailersTab search={search} />
      ) : (
        <ConversationsTab search={search} />
      )}
    </div>
  );
}

function RetailersTab({ search }) {
  const { retailers, isLoading } = useRetailersList();
  const { orders } = useAllOrders();
  const { addConversation } = useRetailerConversations();
  const { admin } = useAdminSession();

  const [noteRetailer, setNoteRetailer] = useState(null);

  const orderCountByRetailer = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      map[order.retailerId] = (map[order.retailerId] || 0) + 1;
    });
    return map;
  }, [orders]);

  const filteredRetailers = useMemo(() => {
    if (!search) return retailers;
    const q = search.toLowerCase();
    return retailers.filter(
      (r) =>
        String(r.name ?? "").toLowerCase().includes(q) ||
        String(r.companyName ?? "").toLowerCase().includes(q) ||
        String(r.phone ?? "").toLowerCase().includes(q)
    );
  }, [retailers, search]);

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading retailers...</p>;
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {filteredRetailers.map((retailer, idx) => (
          <div
            key={retailer.retailerId || retailer.phone || idx}
            className="bg-white rounded-2xl border p-4 space-y-3"
            style={{ borderColor: "var(--color-gold-200)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{retailer.name}</p>
                {retailer.companyName && (
                  <p className="text-xs text-gray-500 truncate">{retailer.companyName}</p>
                )}
              </div>
              <Link
                href={`/admin/retailers/${retailer.retailerId || retailer.phone}`}
                className="text-xs font-semibold shrink-0"
                style={{ color: "var(--color-gold-600)" }}
              >
                View →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
              <div>
                <span className="text-gray-400">Phone: </span>
                {retailer.phone || "—"}
              </div>
              <div>
                <span className="text-gray-400">Area: </span>
                {retailer.area || "—"}
              </div>
              <div>
                <span className="text-gray-400">Orders: </span>
                {orderCountByRetailer[retailer.retailerId] || orderCountByRetailer[retailer.phone] || 0}
              </div>
            </div>

            <button
              onClick={() => setNoteRetailer(retailer)}
              className="text-xs font-semibold cursor-pointer hover:underline"
              style={{ color: "var(--color-gold-600)" }}
            >
              + Conversation
            </button>
          </div>
        ))}

        {filteredRetailers.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No retailers found.</p>
        )}
      </div>

      {/* Desktop table */}
      <div
        className="hidden md:block bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--color-gold-200)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-gold-50)" }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Name</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Company</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Phone</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Area</th>
              <th className="text-center px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Orders</th>
              <th className="px-4 py-3"></th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredRetailers.map((retailer, idx) => (
              <tr key={retailer.retailerId || retailer.phone || idx} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                <td className="px-4 py-3 font-medium">{retailer.name}</td>
                <td className="px-4 py-3">{retailer.companyName}</td>
                <td className="px-4 py-3">{retailer.phone}</td>
                <td className="px-4 py-3">{retailer.area}</td>
                <td className="px-4 py-3 text-center">
                  {orderCountByRetailer[retailer.retailerId] || orderCountByRetailer[retailer.phone] || 0}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setNoteRetailer(retailer)}
                    className="text-xs font-semibold cursor-pointer hover:underline"
                    style={{ color: "var(--color-gold-600)" }}
                  >
                    + Conversation
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/retailers/${retailer.retailerId || retailer.phone}`}
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-gold-600)" }}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRetailers.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No retailers found.</p>
        )}
      </div>

      {noteRetailer && (
        <AddConversationModal
          retailer={noteRetailer}
          adminName={admin?.name}
          onSave={addConversation}
          onClose={() => setNoteRetailer(null)}
        />
      )}
    </>
  );
}

function AddConversationModal({ retailer, adminName, onSave, onClose }) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    if (!message.trim()) return;
    setSaving(true);
    setErrorMsg("");

    const result = await onSave({
      retailerId: retailer.retailerId || retailer.phone,
      retailerName: retailer.name,
      message: message.trim(),
      addedBy: adminName || "",
    });

    setSaving(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.message || "Failed to save conversation");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border w-full max-w-md p-5 space-y-4"
        style={{ borderColor: "var(--color-gold-200)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--color-gold-800)" }}>
            Add Conversation
          </h2>
          <p className="text-xs text-gray-500">
            {retailer.name}
            {retailer.phone ? ` · ${retailer.phone}` : ""}
          </p>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Kya baat hui retailer se..."
          className="border rounded-lg px-3 py-2 text-sm w-full"
          style={{ borderColor: "var(--color-gold-200)" }}
          autoFocus
        />

        {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
            style={{ color: "var(--color-gold-700)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !message.trim()}
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--color-gold-500)" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationsTab({ search }) {
  const { retailers } = useRetailersList();
  const { conversations, isLoading, error } = useRetailerConversations();

  const retailerById = useMemo(() => {
    const map = {};
    retailers.forEach((r) => {
      if (r.retailerId) map[r.retailerId] = r;
    });
    return map;
  }, [retailers]);

  const groups = useMemo(() => {
    const map = {};
    conversations.forEach((c) => {
      const key = c.retailerId || c.retailerName || "unknown";
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });

    return Object.entries(map)
      .map(([retailerId, messages]) => {
        const retailer = retailerById[retailerId];
        const sorted = [...messages].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        return {
          retailerId,
          name: retailer?.name || sorted[0]?.retailerName || "Unknown",
          companyName: retailer?.companyName,
          phone: retailer?.phone,
          messages: sorted,
          latestTimestamp: sorted[0]?.timestamp,
        };
      })
      .sort((a, b) => new Date(b.latestTimestamp) - new Date(a.latestTimestamp));
  }, [conversations, retailerById]);

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        String(g.name ?? "").toLowerCase().includes(q) ||
        String(g.companyName ?? "").toLowerCase().includes(q) ||
        String(g.phone ?? "").toLowerCase().includes(q)
    );
  }, [groups, search]);

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading conversations...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Failed to load conversations.</p>;
  }

  if (filteredGroups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: "var(--color-gold-200)" }}>
        <p className="text-sm text-gray-400">No conversations found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredGroups.map((group) => (
        <div
          key={group.retailerId}
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--color-gold-200)" }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
            style={{ backgroundColor: "var(--color-gold-50)" }}
          >
            <div>
              <p className="font-semibold" style={{ color: "var(--color-gold-800)" }}>
                {group.name}
                {group.companyName ? ` · ${group.companyName}` : ""}
              </p>
              {group.phone && <p className="text-xs text-gray-500">{group.phone}</p>}
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {group.messages.length} message{group.messages.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--color-gold-100)" }}>
            {group.messages.map((msg, idx) => (
              <div key={idx} className="px-4 py-3 text-sm">
                <p>{msg.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleString("en-IN") : ""}
                  {msg.addedBy ? ` · ${msg.addedBy}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
