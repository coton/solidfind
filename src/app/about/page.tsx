"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Instagram, Share2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Separator className="mb-4" />
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </Link>
        </div>

        {/* About Content */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div>
              {/* Logo */}
              <div className="w-52 h-52 bg-zinc-200 rounded-lg mb-6" />

              {/* Social Links */}
              <div className="flex items-center gap-4 mb-6">
                <button className="text-zinc-600 hover:text-zinc-900">
                  <Mail className="w-5 h-5" />
                </button>
                <button className="text-zinc-600 hover:text-zinc-900">
                  <Instagram className="w-5 h-5" />
                </button>
              </div>

              {/* Share Button */}
              <div className="flex items-center gap-2">
                <button className="text-zinc-400 hover:text-zinc-600">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Title */}
              <h1 className="text-4xl font-bold mb-8">solidfind.id</h1>

              {/* About Description */}
              <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                <p>
                  A clearer way to build and live in Indonesia. Building,
                  renovating, or choosing a home is one of the most important
                  decisions people make — yet reliable information and
                  trustworthy contacts are often hard to find.
                </p>
                <p>
                  Living.id exists to bring clarity, structure, and confidence
                  to that process.
                </p>
                <p>Living.id is built for people who are:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>planning to build or renovate</li>
                  <li>looking for professionals they can trust</li>
                  <li>
                    trying to make informed decisions in a complex environment
                  </li>
                </ul>
              </div>

              {/* Tags Section */}
              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase mb-2">
                    INDIVIDUAL ACCOUNT
                  </h3>
                  <p className="text-sm">
                    Solo / Couple, Family / Co-Hosting, Shared / Community
                  </p>
                </div>

                <div>
                  <h3 className="text-xs text-muted-foreground uppercase mb-2">
                    FREE ACCOUNT
                  </h3>
                  <p className="text-sm">Residential, Commercial, Hospitality</p>
                </div>

                <div>
                  <h3 className="text-xs text-muted-foreground uppercase mb-2">
                    PRO ACCOUNT
                  </h3>
                  <p className="text-sm">
                    Whole House, Bathroom, Bedroom, Living room, Electricity,
                    Roof, Pool, Mold, Tiling, Painting, Fencing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner imageSrc="/images/ad-kini-resort.png" alt="Kini Resort" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
