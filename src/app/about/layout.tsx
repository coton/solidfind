import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about SOLIDFIND.ID, Bali's trusted platform for finding construction, renovation, and design professionals. A clearer way to build and live in Indonesia.",
  openGraph: {
    title: "About SOLIDFIND.ID",
    description: "A clearer way to build and live in Indonesia. Find trusted professionals for your construction and renovation projects.",
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
