"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { AuthModal } from "@/components/AuthModal";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/auth-complete");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
      <AuthModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialMode="login"
        initialAccountType="individual"
      />
    </div>
  );
}
