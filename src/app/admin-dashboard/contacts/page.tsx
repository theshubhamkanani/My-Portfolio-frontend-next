"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  ContactRequest,
  getAdminContactRequests,
} from "@/services/contactService";

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const getMonogram = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "CR";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export default function ContactRequestsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  const loadContacts = async (search: string) => {
    try {
      setIsLoading(true);
      setPageMessage("");
      const data = await getAdminContactRequests(search);
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contact requests", error);
      setPageMessage("Unable to load contact requests right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContacts(deferredSearch);
  }, [deferredSearch]);

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Contact Requests
              </h1>
              <p className="mt-2 text-lg text-slate-400">
                Recent messages from visitors, sorted newest first.
              </p>
            </div>

            <div className="w-full max-w-md">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Search by email or reason
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search contact requests..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>
        </header>

        {pageMessage && (
          <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {pageMessage}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <span>
            {searchTerm.trim()
              ? `Results for "${searchTerm.trim()}"`
              : "Showing all recent contact requests"}
          </span>
          <span>{contacts.length} request(s)</span>
        </div>

        <section className="mt-8">
          {isLoading ? (
            <div className="py-24 text-center text-slate-400">
              Loading contact requests...
            </div>
          ) : contacts.length === 0 ? (
            <div className="py-24 text-center">
              <h2 className="text-2xl font-semibold text-white">
                {searchTerm.trim()
                  ? "No matching contact requests found."
                  : "No contact requests yet."}
              </h2>
              <p className="mt-3 text-slate-400">
                {searchTerm.trim()
                  ? "Try a different email or reason keyword."
                  : "New visitor messages will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {contacts.map((contact) => (
                <article
                  key={contact.id}
                  className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/60 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.95)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/70 hover:bg-slate-950/80"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_42%)] opacity-70" />

                  <div className="relative">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-sm font-semibold tracking-[0.2em] text-slate-300">
                          {getMonogram(contact.name)}
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                            Contact Request
                          </p>

                          <h2 className="mt-3 text-2xl font-semibold text-white">
                            {contact.name}
                          </h2>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <a
                              href={`mailto:${contact.email}`}
                              className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-sky-400/40 hover:text-white"
                            >
                              {contact.email}
                            </a>

                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                              {contact.reason}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 xl:items-end">
                        <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300">
                          {formatDateTime(contact.createdAt)}
                        </span>

                        <a
                          href={`mailto:${contact.email}?subject=${encodeURIComponent(
                            `Re: ${contact.reason}`
                          )}`}
                          className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition-colors hover:border-sky-400/60 hover:bg-sky-500/20 hover:text-white"
                        >
                          Reply by Email
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        Message
                      </p>
                      <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
                        {contact.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
