"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ReviewCard } from "@/components/cards";
import { AdBanner } from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Phone,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  MapPin,
  Bookmark,
  Flag,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Mock data for the profile
const mockProfile = {
  id: "1",
  name: "Company name Company name Company name Company name",
  phone: "+62 812 463 4536",
  website: "www.example.com",
  since: 2021,
  projects: 75,
  team: 25,
  address:
    "Jl. Imam Bonjol No.194/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119",
  about: `I Gusti Ngurah Andri Saputra, a proud Balinese architect, founded Lumbung Architect in 2010. After earning his architecture degree from Udayana University (2004-2008), he improved his skills with local firms and gained international experience working with architects from France and Australia.

These diverse experiences shaped his design philosophy, which remains grounded in Balinese traditions. Driven by memories of his childhood home, I Gusti Ngurah Andri Saputra finds joy in creating buildings that support connections and friendships between clients. Inspired by the warmth of family, he took a career in architecture to help people find their perfect living environments.Lumbung Architect, based in Bali, now employs around 67 professionals.`,
  services: {
    projectSize: ["Solo / Couple", "Family / Co-Hosting", "Shared / Community"],
    construction: ["Residential", "Commercial", "Hospitality"],
    renovation: [
      "Whole House",
      "Bathroom",
      "Bedroom",
      "Living room",
      "Electricity",
      "Roof",
      "Pool",
      "Mold",
      "Tiling",
      "Painting",
      "Fencing",
    ],
    location: ["Bali"],
  },
  rating: 4.5,
  reviewCount: 75,
  reviews: [
    {
      userName: "User Name",
      rating: 4,
      content:
        "fdfgdfgdfvwfdfgdtgfvbwfdfgdfgfvbwwfdfgtgfvbwwfdfgdtgfvbvwwfdfgdfgfvbwwfdfgdfgfvb...",
      date: "2024/01/12",
    },
    {
      userName: "User Name",
      rating: 5,
      content:
        "fdfgdfgdfvwfdfgdtgfvbwwfdfgdfgfvbwwfdfgtgfvbvwwfdfgdtgfvbvwwfdfgdfgfvbwwfdfgdfgfvb...",
      date: "2024/01/13",
    },
    {
      userName: "User Name",
      rating: 4,
      content:
        "fdfgdfgdfvwfdfgdtgfvbwwfdfgdfgfvbvwwfdfgtgfvbvwwfdfgdtgfvbvwwfdfgdfgfvbvwwfdfgdfgfvbv...",
      date: "2024/01/14",
    },
    {
      userName: "User Name",
      rating: 5,
      content:
        "fdfgdfgdfvwwfdfgdtgfvbvwwfdfgdfgfvbvwwfdfgtgfvbvwwfdfgdtgfvbvwwfdfgdfgfvbvwwfdfgdfgfvbv...",
      date: "2024/01/15",
    },
  ],
  photos: Array(12).fill("/api/placeholder/200/200"),
};

export default function ProfilePage() {
  const [isSaved, setIsSaved] = useState(false);
  const profile = mockProfile;

  return (
    <div className="min-h-screen bg-zinc-100">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </Link>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              {/* Header with Name and Stats */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-4 max-w-md">
                    {profile.name}
                  </h1>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className="text-muted-foreground text-sm">
                      Projects
                    </span>
                    <span className="ml-4 font-semibold text-orange-500">
                      +{profile.projects}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted-foreground text-sm">Team</span>
                    <span className="ml-4 font-semibold text-orange-500">
                      +{profile.team}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Since</span>
                    <span className="ml-4 font-semibold">{profile.since}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-orange-500">Pro Account</span>
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isSaved ? "fill-orange-500 text-orange-500" : ""
                    }`}
                  />
                  Save
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Tel. {profile.phone}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">WEBSITE</span>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                  <button className="text-zinc-600 hover:text-zinc-900">
                    <Mail className="w-5 h-5" />
                  </button>
                  <button className="text-zinc-600 hover:text-zinc-900">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="text-zinc-600 hover:text-zinc-900">
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button className="text-zinc-600 hover:text-zinc-900">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="text-zinc-600 hover:text-zinc-900">
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mb-8">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">{profile.address}</p>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-4 gap-2">
                {profile.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-zinc-200 rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* About */}
              <div className="mb-8">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {profile.about}
                </p>
              </div>

              {/* Services */}
              <div className="space-y-6">
                <h3 className="font-semibold text-sm">Services provided:</h3>

                <div>
                  <h4 className="text-xs text-muted-foreground uppercase mb-2">
                    PROJECT SIZE
                  </h4>
                  <p className="text-sm">{profile.services.projectSize.join(", ")}</p>
                </div>

                <div>
                  <h4 className="text-xs text-muted-foreground uppercase mb-2">
                    CONSTRUCTION
                  </h4>
                  <p className="text-sm">{profile.services.construction.join(", ")}</p>
                </div>

                <div>
                  <h4 className="text-xs text-muted-foreground uppercase mb-2">
                    RENOVATION
                  </h4>
                  <p className="text-sm">{profile.services.renovation.join(", ")}</p>
                </div>

                <div>
                  <h4 className="text-xs text-muted-foreground uppercase mb-2">
                    LOCATION
                  </h4>
                  <p className="text-sm">{profile.services.location.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold">
                    Latest reviews / Ulasan terbaru
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                  <span className="text-orange-500 font-semibold">
                    {profile.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({profile.reviewCount})
                  </span>
                </div>
              </div>
              <Button variant="outline">See all</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {profile.reviews.map((review, index) => (
                <ReviewCard key={index} {...review} />
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
              PREVIOUS
            </button>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              NEXT
              <ChevronRight className="w-4 h-4" />
            </button>
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
