import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read SOLIDFIND.ID's terms and conditions for using our platform to find construction, renovation, and design professionals in Bali, Indonesia.",
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
