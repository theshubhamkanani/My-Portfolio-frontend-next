"use client";

import { useState } from "react";
import {
  ContactRequestPayload,
  submitContactRequest,
} from "@/services/contactService";

const initialForm: ContactRequestPayload = {
  name: "",
  email: "",
  reason: "",
  description: "",
};

export default function PublicContactSection() {
  const [formData, setFormData] = useState<ContactRequestPayload>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);

  const extractErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: unknown } }).response;

      if (typeof response?.data === "string") {
        return response.data;
      }

      if (
        response?.data &&
        typeof response.data === "object" &&
        "message" in response.data &&
        typeof (response.data as { message?: unknown }).message === "string"
      ) {
        return (response.data as { message: string }).message;
      }
    }

    return fallback;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setFeedback("");
      setIsError(false);

      const message = await submitContactRequest(formData);
      setFeedback(message);
      setFormData(initialForm);
    } catch (error) {
      setIsError(true);
      setFeedback(
        extractErrorMessage(error, "Unable to send your message right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="border-t border-slate-800 bg-slate-950 px-6 py-20 text-white sm:px-8 lg:px-10"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
            Contact
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Let&apos;s build something useful together.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
            If you have a project, collaboration idea, freelance requirement, or
            just want to connect, send a message here. Your request will be
            stored in my dashboard and I&apos;ll also receive it by email.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Response Flow
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Your message is saved securely, sent to my Gmail, and you’ll get
                a confirmation email immediately.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Best Use
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Use this for job opportunities, project discussions, freelance
                work, partnerships, or technical collaboration.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.95)] sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Reason
            </label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
              placeholder="Job opportunity, freelance work, collaboration..."
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Message
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
              placeholder="Write your message here..."
            />
          </div>

          {feedback && (
            <div
              className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                isError
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {feedback}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
