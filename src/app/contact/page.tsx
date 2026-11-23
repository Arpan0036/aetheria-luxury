import type { Metadata } from "next";
import { ContactConciergeClient } from "@/components/storefront/ContactConciergeClient";

export const metadata: Metadata = {
  title: "Private Client Concierge & Listening Studios (/contact)",
  description:
    "Connect with the AETHERIA® Private Client Concierge (< 4 Hour SLA), book an appointment at our Zurich, New York SoHo, or London Mayfair listening studios, or submit a live architectural trade inquiry.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Private Client Concierge & Listening Studios | AETHERIA®",
    description:
      "Direct concierge support, listening studio appointments in Zurich, New York SoHo, and London Mayfair, and architectural trade inquiries.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return <ContactConciergeClient />;
}
