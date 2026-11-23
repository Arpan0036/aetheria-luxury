import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { getCatalogOverview } from "@/lib/supabase/queries";
import {
  DEFAULT_SITE_URL,
  getOrganizationSchema,
  getWebsiteSchema,
} from "@/lib/seo/json-ld";
import { THEME_STORAGE_KEY } from "@/lib/utils";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = DEFAULT_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AETHERIA® — Architectural Audio & Desk Objects",
    template: "%s | AETHERIA® — Architectural Audio & Desk Objects",
  },
  description:
    "AETHERIA is a Zurich & Copenhagen design archive engineering permanent spatial audio, desk architecture, tactile computing, and ambient lighting objects from 5-axis CNC aluminum and Roman travertine.",
  applicationName: "AETHERIA",
  keywords: [
    "luxury objects",
    "spatial audio",
    "desk architecture",
    "tactile computing",
    "ambient lighting",
    "design objects",
    "AETHERIA",
    "reference headphones",
    "travertine desk objects",
  ],
  authors: [{ name: "AETHERIA Archive Holdings" }],
  creator: "AETHERIA Archive Holdings",
  publisher: "AETHERIA Objects Ltd.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "AETHERIA®",
    title: "AETHERIA® — Architectural Audio & Desk Objects",
    description:
      "Permanent spatial audio and desk architecture engineered in 5-axis CNC aluminum, Roman travertine, and brushed titanium.",
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/images/products/aether-01-headphones.png",
        width: 1200,
        height: 900,
        alt: "AETHER-01 Spatial Reference Headphones by AETHERIA®",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AETHERIA® — Architectural Audio & Desk Objects",
    description:
      "Permanent spatial audio and desk architecture engineered in 5-axis CNC aluminum, Roman travertine, and brushed titanium.",
    images: ["/images/products/aether-01-headphones.png"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4EF" },
    { media: "(prefers-color-scheme: dark)", color: "#181615" },
  ],
};

// Runs during HTML parsing → stored theme applied before first paint (no flash).
const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="espresso"||t==="daylight")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const overview = await getCatalogOverview();
  const organizationJsonLd = getOrganizationSchema(SITE_URL);
  const websiteJsonLd = getWebsiteSchema(SITE_URL);

  return (
    <html
      lang="en"
      data-theme="daylight"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          id="jsonld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          id="jsonld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className="grain min-h-dvh overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>
          <Navbar products={overview.products} />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
