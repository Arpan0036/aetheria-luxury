/**
 * AETHERIA — typed seed dataset.
 *
 * Single source of truth for:
 *   1. The resilient local fallback (used when Supabase is not configured/reachable)
 *   2. supabase/seed.sql (generated via `npm run db:seed:generate`)
 *
 * IDs are deterministic so live and fallback modes return identical records.
 * Only `import type` is allowed here so the generator can run under Node's type stripping.
 */
import type {
  Category,
  CategorySlug,
  DiscountCode,
  Product,
  ProductVariant,
  Review,
} from "../../types/database";

const cid = (n: number) => `c0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const pid = (n: number) => `a0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const vid = (n: number) => `b0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const rid = (n: number) => `d0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const did = (n: number) => `e0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/* -------------------------------------------------------------------------- */
/*  Categories                                                                 */
/* -------------------------------------------------------------------------- */

export const SEED_CATEGORIES: Category[] = [
  {
    id: cid(1),
    name: "Spatial Audio & Acoustics",
    slug: "spatial-audio",
    subtitle: "Precision-milled acoustic instruments for studio and sanctuary.",
    description:
      "Reference headphones, omnidirectional speakers and Class-A amplification — tuned by ear in our London listening room and machined to tolerances you can feel.",
    image_url: "/images/categories/cat-spatial-audio.png",
    display_order: 1,
  },
  {
    id: cid(2),
    name: "Desk Architecture",
    slug: "desk-architecture",
    subtitle: "Monolithic aluminum and travertine instruments for focused work.",
    description:
      "Lighting, risers, valets and leather surfaces that turn a desk into a considered piece of architecture.",
    image_url: "/images/categories/cat-desk-architecture.png",
    display_order: 2,
  },
  {
    id: cid(3),
    name: "Tactile Computing",
    slug: "tactile-computing",
    subtitle: "Mechanical interfaces engineered for zero-latency physical feedback.",
    description:
      "Gasket-mounted keyboards, haptic controllers and macro matrices built for people who think with their hands.",
    image_url: "/images/categories/cat-tactile-computing.png",
    display_order: 3,
  },
  {
    id: cid(4),
    name: "Ambient Lighting",
    slug: "ambient-lighting",
    subtitle: "Warm-spectrum optical sculptures with circadian dimming.",
    description:
      "Glass, bronze and light — luminaires designed to follow the colour temperature of the setting sun.",
    image_url: "/images/categories/cat-ambient-lighting.png",
    display_order: 4,
  },
];

const cat = (slug: CategorySlug) => SEED_CATEGORIES.find((c) => c.slug === slug)!.id;

/* -------------------------------------------------------------------------- */
/*  Products                                                                   */
/* -------------------------------------------------------------------------- */

const WARRANTY_2Y = "2-year AETHERIA Care warranty · lifetime servicing";
const WARRANTY_5Y = "5-year structural warranty · lifetime servicing";

export const SEED_PRODUCTS: Product[] = [
  {
    id: pid(1),
    category_id: cat("spatial-audio"),
    sku: "AE-SA-001",
    title: "AETHER-01 Spatial Reference Headphones",
    slug: "aether-01-spatial-reference-headphones",
    tagline: "Beryllium clarity, cradled in lambskin.",
    description:
      "CNC-machined anodized aluminum earcups house 50mm beryllium drivers tuned for a flat, holographic stage. Lambskin memory acoustic pads seal without pressure for hours of reference listening.",
    price_usd: 540,
    compare_at_price_usd: null,
    rating: 4.92,
    review_count: 318,
    stock_count: 42,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    materials: ["Anodized aluminum", "Lambskin leather", "Beryllium", "Memory foam"],
    dimensions: "190 × 172 × 88 mm",
    weight: "348 g",
    warranty_info: WARRANTY_2Y,
    specs: {
      Driver: "50 mm beryllium dome",
      "Frequency response": "4 Hz – 48 kHz",
      Impedance: "32 Ω",
      Sensitivity: "104 dB SPL/mW",
      Connectivity: "USB-C lossless · 3.5 mm analog",
      Battery: "40 h (ANC off)",
    },
    images: ["/images/products/aether-01-headphones.png"],
    three_d_config: { shape: "headphones", finish: "anodized-aluminum", metallic: 0.85, roughness: 0.32, base_hex: "#C9C6C0", accent_hex: "#C85632" },
  },
  {
    id: pid(2),
    category_id: cat("desk-architecture"),
    sku: "AE-DA-002",
    title: "MONOLITH Desk Lamp 02",
    slug: "monolith-desk-lamp-02",
    tagline: "Brass, travertine, and a sunset on a dial.",
    description:
      "A solid brushed-brass column rising from an Italian travertine base. A stepless rotary dimmer sweeps colour temperature from 2200K candlelight to 4000K daylight at CRI 98+.",
    price_usd: 380,
    compare_at_price_usd: null,
    rating: 4.88,
    review_count: 146,
    stock_count: 27,
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: false,
    materials: ["Solid brass", "Italian travertine", "Opal glass"],
    dimensions: "Ø 140 × 420 mm",
    weight: "3.2 kg",
    warranty_info: WARRANTY_5Y,
    specs: {
      "Colour temperature": "2200K – 4000K stepless",
      CRI: "98+",
      Output: "620 lm",
      Control: "Rotary dimmer · touch memory",
      Power: "USB-C PD 30 W",
    },
    images: ["/images/products/monolith-desk-lamp.png"],
    three_d_config: { shape: "lamp", finish: "brushed-brass", metallic: 0.95, roughness: 0.38, base_hex: "#B8935A", accent_hex: "#E9DFD0" },
  },
  {
    id: pid(3),
    category_id: cat("tactile-computing"),
    sku: "AE-TC-003",
    title: "KINETIC-65 Field Mechanical Keyboard",
    slug: "kinetic-65-field-mechanical-keyboard",
    tagline: "Gasket-mounted. Hand-lubed. Unmistakably solid.",
    description:
      "A bead-blasted aluminum chassis floats on poron gaskets for a soft, deep keystroke. Custom lubricated tactile switches and a solid brass rotary encoder make every input deliberate.",
    price_usd: 420,
    compare_at_price_usd: 460,
    rating: 4.95,
    review_count: 402,
    stock_count: 18,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    materials: ["Bead-blasted aluminum", "Solid brass", "PBT double-shot keycaps", "Poron gaskets"],
    dimensions: "318 × 112 × 34 mm",
    weight: "1.86 kg",
    warranty_info: WARRANTY_2Y,
    specs: {
      Layout: "65% · 68 keys",
      Switches: "AETHERIA Tactile 62g, factory-lubed",
      Mount: "Gasket, poron",
      Polling: "8000 Hz wired · 1000 Hz 2.4 GHz",
      Encoder: "Solid brass, 30 detents",
    },
    images: ["/images/products/kinetic-65-keyboard.png"],
    three_d_config: { shape: "keyboard", finish: "bead-blasted-aluminum", metallic: 0.7, roughness: 0.55, base_hex: "#8E8B86", accent_hex: "#C85632" },
  },
  {
    id: pid(4),
    category_id: cat("spatial-audio"),
    sku: "AE-SA-004",
    title: "SONOSCAPE OBELISK Omni Speaker",
    slug: "sonoscape-obelisk-omni-speaker",
    tagline: "Sound that fills a room like light.",
    description:
      "A 360-degree spatial waveguide carved from volcanic basalt and crowned in spun aluminum disperses sound evenly to every corner — no sweet spot, only space.",
    price_usd: 890,
    compare_at_price_usd: null,
    rating: 4.9,
    review_count: 97,
    stock_count: 9,
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: false,
    materials: ["Volcanic basalt", "Spun aluminum", "Acoustic wool"],
    dimensions: "Ø 160 × 640 mm",
    weight: "11.4 kg",
    warranty_info: WARRANTY_5Y,
    specs: {
      Dispersion: "360° omnidirectional waveguide",
      Drivers: "1 × 6.5\" woofer · 1 × 1\" ring radiator",
      Amplification: "2 × 120 W Class-D",
      Streaming: "AirPlay 2 · Chromecast · Spotify Connect",
      "Room correction": "Auto-calibrating",
    },
    images: ["/images/products/sonoscape-obelisk-speaker.png"],
    three_d_config: { shape: "obelisk", finish: "volcanic-basalt", metallic: 0.1, roughness: 0.9, base_hex: "#2B2926", accent_hex: "#C9C6C0" },
  },
  {
    id: pid(5),
    category_id: cat("tactile-computing"),
    sku: "AE-TC-005",
    title: "CHRONO-DIAL Tactile Studio Controller",
    slug: "chrono-dial-tactile-studio-controller",
    tagline: "Scrub time with weight and intent.",
    description:
      "A heavyweight magnetic haptic knob for timeline scrubbing, volume grading and colour wheels. Programmable detents let you feel every frame.",
    price_usd: 240,
    compare_at_price_usd: null,
    rating: 4.81,
    review_count: 64,
    stock_count: 55,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: true,
    materials: ["Stainless steel", "Machined aluminum", "Silicone base"],
    dimensions: "Ø 86 × 48 mm",
    weight: "612 g",
    warranty_info: WARRANTY_2Y,
    specs: {
      Haptics: "Magnetic, programmable detents",
      Resolution: "3600 steps / rev",
      Compatibility: "DaVinci Resolve · Premiere · Logic · Ableton",
      Connection: "USB-C · Bluetooth LE",
    },
    images: ["/images/products/chrono-dial-controller.png"],
    three_d_config: { shape: "dial", finish: "polished-steel", metallic: 1, roughness: 0.2, base_hex: "#B5B2AC", accent_hex: "#C85632" },
  },
  {
    id: pid(6),
    category_id: cat("desk-architecture"),
    sku: "AE-DA-006",
    title: "TRAVERTINE Valet & MagSafe Dock",
    slug: "travertine-valet-magsafe-dock",
    tagline: "Roman stone, modern charge.",
    description:
      "A hand-honed Roman travertine tray with two integrated 15W Qi2 magnetic charging pucks. A resting place for the day's essentials.",
    price_usd: 195,
    compare_at_price_usd: null,
    rating: 4.86,
    review_count: 233,
    stock_count: 64,
    is_featured: false,
    is_bestseller: true,
    is_new_arrival: false,
    materials: ["Roman travertine", "Anodized aluminum", "Wool felt"],
    dimensions: "260 × 140 × 22 mm",
    weight: "1.4 kg",
    warranty_info: WARRANTY_2Y,
    specs: {
      Charging: "2 × 15 W Qi2 magnetic",
      Input: "USB-C PD 45 W",
      Finish: "Hand-honed, sealed",
    },
    images: ["/images/products/travertine-magsafe-dock.png"],
    three_d_config: { shape: "tray", finish: "honed-travertine", metallic: 0, roughness: 0.75, base_hex: "#E3D6C1", accent_hex: "#8E8B86" },
  },
  {
    id: pid(7),
    category_id: cat("ambient-lighting"),
    sku: "AE-AL-007",
    title: "SOLARIS Halo Atmospheric Lamp",
    slug: "solaris-halo-atmospheric-lamp",
    tagline: "A ring of refracted sunset.",
    description:
      "A frosted borosilicate glass ring with sunset refraction optics casts a gradient of amber to rose across the wall — circadian-dimmed to follow your evening.",
    price_usd: 310,
    compare_at_price_usd: null,
    rating: 4.84,
    review_count: 121,
    stock_count: 31,
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: false,
    materials: ["Borosilicate glass", "Anodized aluminum", "Travertine"],
    dimensions: "Ø 300 × 360 mm",
    weight: "2.6 kg",
    warranty_info: WARRANTY_2Y,
    specs: {
      Optics: "Sunset refraction film",
      "Colour temperature": "1800K – 3000K",
      Dimming: "Circadian auto-dim · app",
      Power: "24 V DC",
    },
    images: ["/images/products/solaris-halo-lamp.png"],
    three_d_config: { shape: "halo", finish: "frosted-borosilicate", metallic: 0.05, roughness: 0.6, base_hex: "#EFE7DC", accent_hex: "#E58A5C" },
  },
  {
    id: pid(8),
    category_id: cat("desk-architecture"),
    sku: "AE-DA-008",
    title: "ARCHIVE-04 Modular Monitor Riser",
    slug: "archive-04-modular-monitor-riser",
    tagline: "A bridge with a quiet vault beneath.",
    description:
      "An extruded architectural aluminum bridge lifts your display to eye level, concealing a felt-lined cable vault and modular storage drawers below.",
    price_usd: 290,
    compare_at_price_usd: null,
    rating: 4.79,
    review_count: 88,
    stock_count: 22,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: false,
    materials: ["Extruded aluminum", "Wool felt", "Walnut"],
    dimensions: "620 × 240 × 110 mm",
    weight: "4.1 kg",
    warranty_info: WARRANTY_5Y,
    specs: {
      Load: "Up to 30 kg",
      Modules: "2 drawers · 1 cable vault",
      Passthrough: "USB-C 10 Gbps hub",
    },
    images: ["/images/products/archive-04-monitor-riser.png"],
    three_d_config: { shape: "riser", finish: "anodized-aluminum", metallic: 0.8, roughness: 0.4, base_hex: "#A9A6A0", accent_hex: "#6B4A32" },
  },
  {
    id: pid(9),
    category_id: cat("spatial-audio"),
    sku: "AE-SA-009",
    title: "PULSE-DAC Reference Headphone Amplifier",
    slug: "pulse-dac-reference-headphone-amplifier",
    tagline: "Dual-mono Class-A, with a warm glowing heart.",
    description:
      "A dual-mono Class-A desktop DAC and amplifier with an exposed vacuum tube stage. Measured transparency, felt warmth.",
    price_usd: 460,
    compare_at_price_usd: null,
    rating: 4.87,
    review_count: 52,
    stock_count: 14,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: true,
    materials: ["Machined aluminum", "Borosilicate glass", "Brass"],
    dimensions: "220 × 180 × 96 mm",
    weight: "2.9 kg",
    warranty_info: WARRANTY_2Y,
    specs: {
      DAC: "Dual ES9039PRO",
      Output: "2 × 1.8 W @ 32 Ω",
      "Tube stage": "6922 dual triode",
      Inputs: "USB-C · Optical · Coax",
      Formats: "PCM 768 kHz · DSD512",
    },
    images: ["/images/products/pulse-dac-amplifier.png"],
    three_d_config: { shape: "amplifier", finish: "anodized-aluminum", metallic: 0.85, roughness: 0.35, base_hex: "#3A3835", accent_hex: "#F2A65A" },
  },
  {
    id: pid(10),
    category_id: cat("desk-architecture"),
    sku: "AE-DA-010",
    title: "VERGE-PAD Architectural Desk Mat",
    slug: "verge-pad-architectural-desk-mat",
    tagline: "Saddle leather over Portuguese cork.",
    description:
      "Full-grain vegetable-tanned saddle leather bonded to natural Portuguese cork. Ages into a deep patina that records the work done upon it.",
    price_usd: 125,
    compare_at_price_usd: null,
    rating: 4.83,
    review_count: 176,
    stock_count: 80,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: false,
    materials: ["Vegetable-tanned leather", "Portuguese cork"],
    dimensions: "900 × 400 × 4 mm",
    weight: "860 g",
    warranty_info: WARRANTY_2Y,
    specs: {
      Leather: "Full-grain, Tuscan veg-tan",
      Backing: "Natural cork, non-slip",
      Edge: "Hand-burnished",
    },
    images: ["/images/products/verge-pad-desk-mat.png"],
    three_d_config: { shape: "mat", finish: "veg-tan-leather", metallic: 0, roughness: 0.85, base_hex: "#8A5A3B", accent_hex: "#C9A27A" },
  },
  {
    id: pid(11),
    category_id: cat("tactile-computing"),
    sku: "AE-TC-011",
    title: "NUMEN-12 Programmable Macro Pad",
    slug: "numen-12-programmable-macro-pad",
    tagline: "Twelve living keys in titanium.",
    description:
      "A 12-key tactile matrix with individual OLED legends that adapt to the app in focus, housed in CNC-machined titanium.",
    price_usd: 185,
    compare_at_price_usd: null,
    rating: 4.76,
    review_count: 71,
    stock_count: 38,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: false,
    materials: ["CNC titanium", "Sapphire glass", "PBT"],
    dimensions: "112 × 112 × 28 mm",
    weight: "420 g",
    warranty_info: WARRANTY_2Y,
    specs: {
      Keys: "12 × OLED 0.66\"",
      Switches: "Hot-swap tactile",
      Profiles: "Per-app auto-switch",
      Connection: "USB-C",
    },
    images: ["/images/products/numen-12-macro-pad.png"],
    three_d_config: { shape: "macropad", finish: "cnc-titanium", metallic: 0.9, roughness: 0.45, base_hex: "#6E6C68", accent_hex: "#D4C3A3" },
  },
  {
    id: pid(12),
    category_id: cat("ambient-lighting"),
    sku: "AE-AL-012",
    title: "LUMINA-ARC Portable Table Lantern",
    slug: "lumina-arc-portable-table-lantern",
    tagline: "Forty-eight hours of candlelight, cordless.",
    description:
      "A cordless IP54 anodized bronze lantern with a 48-hour warm candle mode. From dinner table to terrace without a cable in sight.",
    price_usd: 260,
    compare_at_price_usd: null,
    rating: 4.89,
    review_count: 204,
    stock_count: 46,
    is_featured: false,
    is_bestseller: true,
    is_new_arrival: false,
    materials: ["Anodized bronze", "Opal acrylic", "Leather strap"],
    dimensions: "Ø 110 × 280 mm",
    weight: "780 g",
    warranty_info: WARRANTY_2Y,
    specs: {
      Battery: "48 h candle mode · 12 h full",
      Rating: "IP54",
      "Colour temperature": "2000K – 2700K",
      Charging: "Magnetic pogo dock",
    },
    images: ["/images/products/lumina-arc-lantern.png"],
    three_d_config: { shape: "lantern", finish: "anodized-bronze", metallic: 0.8, roughness: 0.42, base_hex: "#7A5B3A", accent_hex: "#F4C27A" },
  },
];

/* -------------------------------------------------------------------------- */
/*  Variants (26)                                                              */
/* -------------------------------------------------------------------------- */

type V = [productIndex: number, suffix: string, name: string, hex: string, modifier: number, stock: number];

const VARIANT_ROWS: V[] = [
  [1, "SLV", "Raw Anodized Silver", "#C9C6C0", 0, 18],
  [1, "OBS", "Obsidian Matte", "#1F1E1C", 0, 16],
  [1, "TER", "Terracotta Edition", "#C85632", 40, 8],
  [2, "BRS", "Brushed Brass", "#B8935A", 0, 14],
  [2, "BRZ", "Smoked Bronze", "#5E4630", 20, 13],
  [3, "STN", "Stone Grey", "#8E8B86", 0, 9],
  [3, "OBS", "Obsidian Matte", "#1F1E1C", 0, 6],
  [3, "SGE", "Botanical Sage", "#2F5238", 30, 3],
  [4, "BAS", "Volcanic Basalt", "#2B2926", 0, 5],
  [4, "TRV", "Travertine White", "#E3D6C1", 120, 4],
  [5, "STL", "Polished Steel", "#B5B2AC", 0, 30],
  [5, "OBS", "Obsidian Matte", "#1F1E1C", 0, 25],
  [6, "TRV", "Classic Travertine", "#E3D6C1", 0, 40],
  [6, "NER", "Nero Marquina", "#232120", 35, 24],
  [7, "FRS", "Frosted Dawn", "#EFE7DC", 0, 19],
  [7, "AMB", "Amber Dusk", "#E58A5C", 0, 12],
  [8, "SLV", "Raw Anodized Silver", "#A9A6A0", 0, 12],
  [8, "WAL", "Walnut & Graphite", "#4A3A2E", 60, 10],
  [9, "GRP", "Graphite", "#3A3835", 0, 8],
  [9, "SLV", "Raw Anodized Silver", "#C9C6C0", 0, 6],
  [10, "TAN", "Natural Tan", "#B07A4F", 0, 34],
  [10, "ESP", "Espresso", "#4A2F22", 0, 28],
  [10, "OLV", "Olive", "#5A5A3A", 0, 18],
  [11, "TIT", "Raw Titanium", "#6E6C68", 0, 22],
  [11, "CHM", "Champagne Gold", "#D4C3A3", 45, 16],
  [12, "BRZ", "Anodized Bronze", "#7A5B3A", 0, 26],
  [12, "SGE", "Botanical Sage", "#2F5238", 0, 20],
];

export const SEED_VARIANTS: ProductVariant[] = VARIANT_ROWS.map(([pi, suffix, name, hex, mod, stock], i) => {
  const product = SEED_PRODUCTS[pi - 1];
  return {
    id: vid(i + 1),
    product_id: product.id,
    sku: `${product.sku}-${suffix}`,
    variant_name: name,
    color_hex: hex,
    price_modifier_usd: mod,
    stock_count: stock,
  };
});

/* -------------------------------------------------------------------------- */
/*  Reviews (16)                                                               */
/* -------------------------------------------------------------------------- */

type R = [productIndex: number, author: string, city: string, rating: Review["rating"], title: string, comment: string, date: string];

const REVIEW_ROWS: R[] = [
  [1, "Eleanor Whitfield", "London, UK", 5, "The quietest luxury I own", "The beryllium drivers are uncannily precise, and the lambskin pads disappear after five minutes. Replaced a pair costing twice as much.", "2026-09-14T10:12:00Z"],
  [1, "Daniel Okafor", "New York, US", 5, "Studio reference, living-room comfort", "I mix on these daily. Flat, honest, and the anodized cups still look new after months on the road.", "2026-10-02T16:40:00Z"],
  [1, "Mei Tanaka", "Tokyo, JP", 4, "Exceptional — slightly heavy", "Sound is holographic. At 348 g you notice them on long flights, but I'd still buy them again tomorrow.", "2026-10-21T08:05:00Z"],
  [2, "Lukas Brenner", "Zurich, CH", 5, "Sunset on demand", "The rotary dimmer is buttery and the 2200K end makes late evenings feel like a hotel suite. The travertine base is stunning.", "2026-08-30T19:22:00Z"],
  [2, "Amelia Hart", "Copenhagen, DK", 5, "Object first, lamp second", "Guests ask about it constantly. The brass is developing a beautiful warmth already.", "2026-10-11T12:48:00Z"],
  [3, "Rafael Moreno", "Barcelona, ES", 5, "End-game keyboard", "The gasket mount gives a soft, deep thock. The brass encoder alone feels like jewellery.", "2026-09-05T09:30:00Z"],
  [3, "Sophie Laurent", "Paris, FR", 5, "Typing has become a pleasure", "Factory lube is perfect. I write for a living and my hands notice the difference by the afternoon.", "2026-10-18T14:15:00Z"],
  [4, "James Whitmore", "Los Angeles, US", 5, "No sweet spot — everywhere is the sweet spot", "Fills our open-plan living space evenly. The basalt is genuinely heavy and genuinely beautiful.", "2026-09-27T20:02:00Z"],
  [5, "Priya Raman", "Singapore, SG", 5, "Colour grading changed forever", "Programmable detents in Resolve are a revelation. It feels like a professional console in my palm.", "2026-10-29T07:44:00Z"],
  [6, "Oliver Grant", "Edinburgh, UK", 5, "A ritual at the end of the day", "Keys, watch, phone — all in one place, all charging. The honed stone is a joy to touch.", "2026-09-19T18:36:00Z"],
  [7, "Isabella Conti", "Milan, IT", 5, "Like living inside a golden hour", "The refraction on the wall is magical. Circadian dimming means I never touch it after setup.", "2026-10-07T21:10:00Z"],
  [8, "Henrik Sørensen", "Oslo, NO", 4, "Architectural and practical", "Solid as a bridge. The felt cable vault finally tamed my desk. Drawers could slide a touch smoother.", "2026-08-22T11:55:00Z"],
  [9, "Marcus Feld", "Berlin, DE", 5, "Measured transparency, felt warmth", "Black background with just enough tube bloom. Drives my planars with authority.", "2026-11-03T22:18:00Z"],
  [10, "Charlotte Reyes", "Austin, US", 5, "Patina in progress", "Three months in and the leather is turning a gorgeous honey colour. The cork backing never slips.", "2026-09-09T15:27:00Z"],
  [11, "Kenji Watanabe", "Kyoto, JP", 5, "Small, mighty, beautifully made", "Per-app OLED legends are brilliantly useful, and the titanium housing feels indestructible.", "2026-10-25T06:50:00Z"],
  [12, "Grace Holloway", "Sydney, AU", 5, "Dinner-table magic", "Lasted two full weekends of terrace dinners on candle mode. The bronze is exquisite.", "2026-11-08T09:03:00Z"],
];

export const SEED_REVIEWS: Review[] = REVIEW_ROWS.map(([pi, author, city, rating, title, comment, date], i) => ({
  id: rid(i + 1),
  product_id: SEED_PRODUCTS[pi - 1].id,
  author_name: author,
  author_city: city,
  rating,
  title,
  comment,
  verified_purchase: true,
  created_at: date,
}));

/* -------------------------------------------------------------------------- */
/*  Discount codes (3)                                                         */
/* -------------------------------------------------------------------------- */

export const SEED_DISCOUNT_CODES: DiscountCode[] = [
  { id: did(1), code: "AETHERIA15", description: "15% off orders over $100", discount_percent: 15, min_order_usd: 100, is_active: true, expires_at: null },
  { id: did(2), code: "TIER1VIP", description: "20% off orders over $300", discount_percent: 20, min_order_usd: 300, is_active: true, expires_at: null },
  { id: did(3), code: "FREESHIP", description: "10% welcome discount, no minimum", discount_percent: 10, min_order_usd: 0, is_active: true, expires_at: null },
];
