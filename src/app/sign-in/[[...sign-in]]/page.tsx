import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-[#f14110] hover:bg-[#d93a0e]",
            footerActionLink: "text-[#f14110] hover:text-[#d93a0e]",
          },
        }}
      />
    </div>
  );
}
