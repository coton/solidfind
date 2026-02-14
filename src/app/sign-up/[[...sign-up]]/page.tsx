import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
      <SignUp
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
