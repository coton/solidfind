"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ComingSoonPage() {
  const addToWaitlist = useMutation(api.waitlist.addToWaitlist);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "duplicate" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const message = useMemo(() => {
    switch (status) {
      case "success":
        return "Thanks — you're on the waitlist.";
      case "duplicate":
        return "You're already on the waitlist.";
      case "error":
        return "Something went wrong. Please try again.";
      default:
        return null;
    }
  }, [status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setStatus("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const result = await addToWaitlist({ email: normalizedEmail });
      setStatus(result.alreadyExists ? "duplicate" : "success");
      if (!result.alreadyExists) {
        setEmail("");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#f14110]">
            SolidFind Indonesia
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-tight sm:text-6xl">
            Coming soon.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            We&apos;re getting SolidFind Indonesia ready. Leave your email and we&apos;ll let you know when it launches.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status !== "idle") {
                  setStatus("idle");
                }
              }}
              placeholder="Enter your email"
              autoComplete="email"
              inputMode="email"
              className="h-12 border-white/15 bg-white/8 px-4 text-white placeholder:text-white/45"
              aria-label="Email address"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 bg-[#f14110] px-6 text-white hover:bg-[#d93a0e]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Joining..." : "Join waitlist"}
            </Button>
          </form>

          {message ? (
            <p className={`mt-4 text-sm ${status === "error" ? "text-[#ffb4a3]" : "text-white/70"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
