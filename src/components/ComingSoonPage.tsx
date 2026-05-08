"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ComingSoonPage() {
  const addToWaitlist = useMutation(api.waitlist.addToWaitlist);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "duplicate" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const message = useMemo(() => {
    switch (status) {
      case "success":
        return "✓ You're on the list!";
      case "duplicate":
        return "You're already on the waitlist!";
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
    } catch (error) {
      console.error("Waitlist error:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 hidden bg-white md:block">
        <div className="absolute inset-[10px] overflow-hidden rounded-[6px]">
          <Image
            src="/coming-soon/bg-photo.jpg"
            alt="Construction blocks background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="absolute left-[270px] top-[326px] z-10 w-[450px] space-y-6">
          <div className="text-base font-semibold tracking-wide text-[#333]">SOLIDFIND.id</div>

          <h1 className="text-lg font-semibold uppercase tracking-[0.36px] text-[#F14110]">
            COMING SOON!
          </h1>

          <p className="text-[10px] font-normal leading-[1.6] text-[#333]">
            A curated platform connecting individuals and professionals across construction,
            renovation, and real estate. <span className="font-bold">SolidFind</span> helps you
            discover reliable partners and connect with them easily.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label
              htmlFor="email-desktop"
              className="block text-[11px] font-medium uppercase tracking-[2px] text-[#333]"
            >
              E-mail
            </label>

            <div className="flex items-center gap-4">
              <input
                id="email-desktop"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder="Enter your email"
                required
                autoComplete="email"
                inputMode="email"
                disabled={isSubmitting}
                className="h-[58px] w-[210px] rounded-md bg-[#F8F8F8] px-4 text-sm text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F14110]/30 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[40px] w-[140px] rounded-full border border-[#F14110] text-[11px] font-medium text-[#F14110] transition-colors duration-200 hover:bg-[#F14110] hover:text-white disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Notify me"}
              </button>
            </div>

            {message ? (
              <p className={`text-xs font-medium ${status === "error" ? "text-[#F14110]" : "text-[#333]"}`}>
                {message}
              </p>
            ) : null}
          </form>
        </div>

        <div className="absolute bottom-8 right-8 z-10 flex items-baseline gap-4">
          <Link
            href="/terms"
            className="whitespace-nowrap text-[8px] font-bold text-[#333] underline transition-colors hover:text-[#F14110]"
          >
            Terms &amp; Conditions.
          </Link>
          <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[2.5px] text-[#333]">
            SOLIDFIND.ID © 2026
          </p>
        </div>
      </div>

      <div className="relative min-h-screen overflow-hidden bg-white md:hidden">
        <div className="fixed inset-[10px] overflow-hidden rounded-[6px] opacity-30">
          <Image
            src="/coming-soon/bg-photo.jpg"
            alt="Construction blocks background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-6">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-md">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-wide text-[#333]">SOLIDFIND.id</h2>
              </div>

              <div className="text-center">
                <h1 className="text-4xl font-bold uppercase tracking-wide text-[#F14110]">
                  COMING SOON!
                </h1>
              </div>

              <p className="text-center text-base leading-relaxed text-[#333]">
                A curated platform connecting individuals and professionals across construction,
                renovation, and real estate. <span className="font-bold">SolidFind</span> helps you
                discover reliable partners and connect with them easily.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label
                    htmlFor="email-mobile"
                    className="block text-sm font-semibold uppercase tracking-wider text-[#333]"
                  >
                    E-mail
                  </label>
                  <input
                    id="email-mobile"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status !== "idle") setStatus("idle");
                    }}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    disabled={isSubmitting}
                    className="h-14 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-base text-[#333] placeholder:text-gray-400 transition-colors focus:border-[#F14110] focus:outline-none disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-full bg-[#F14110] text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#d63a0e] active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : status === "success" ? "✓ You're on the list!" : "Notify me"}
                </button>

                {message ? (
                  <p className={`text-center text-sm font-medium ${status === "error" ? "text-[#F14110]" : "text-[#333]"}`}>
                    {message}
                  </p>
                ) : null}
              </form>
            </div>
          </div>

          <div className="space-y-2 pb-4 text-center">
            <Link
              href="/terms"
              className="block text-sm font-bold text-[#333] underline transition-colors hover:text-[#F14110]"
            >
              Terms &amp; Conditions
            </Link>
            <p className="text-xs font-bold uppercase tracking-wider text-[#333]">SOLIDFIND.ID © 2026</p>
          </div>
        </div>
      </div>
    </>
  );
}
