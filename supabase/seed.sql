-- =============================================================================
--  AETHERIA — seed.sql  (GENERATED — do not edit by hand)
--  Source: src/lib/supabase/fallback-data.ts · regenerate: npm run db:seed:generate
--  4 categories · 12 products · 27 variants · 16 reviews · 3 discount codes
--  Idempotent upserts keyed on deterministic UUIDs.
-- =============================================================================
begin;

insert into public.categories (id, name, slug, subtitle, description, image_url, display_order) values
  ('c0000000-0000-4000-8000-000000000001', 'Spatial Audio & Acoustics', 'spatial-audio', 'Precision-milled acoustic instruments for studio and sanctuary.', 'Reference headphones, omnidirectional speakers and Class-A amplification — tuned by ear in our London listening room and machined to tolerances you can feel.', '/images/categories/cat-spatial-audio.png', 1),
  ('c0000000-0000-4000-8000-000000000002', 'Desk Architecture', 'desk-architecture', 'Monolithic aluminum and travertine instruments for focused work.', 'Lighting, risers, valets and leather surfaces that turn a desk into a considered piece of architecture.', '/images/categories/cat-desk-architecture.png', 2),
  ('c0000000-0000-4000-8000-000000000003', 'Tactile Computing', 'tactile-computing', 'Mechanical interfaces engineered for zero-latency physical feedback.', 'Gasket-mounted keyboards, haptic controllers and macro matrices built for people who think with their hands.', '/images/categories/cat-tactile-computing.png', 3),
  ('c0000000-0000-4000-8000-000000000004', 'Ambient Lighting', 'ambient-lighting', 'Warm-spectrum optical sculptures with circadian dimming.', 'Glass, bronze and light — luminaires designed to follow the colour temperature of the setting sun.', '/images/categories/cat-ambient-lighting.png', 4)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  subtitle = excluded.subtitle,
  description = excluded.description,
  image_url = excluded.image_url,
  display_order = excluded.display_order;

insert into public.products (id, category_id, sku, title, slug, tagline, description, price_usd, compare_at_price_usd, rating, review_count, stock_count, is_featured, is_bestseller, is_new_arrival, materials, dimensions, weight, warranty_info, specs, images, three_d_config) values
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'AE-SA-001', 'AETHER-01 Spatial Reference Headphones', 'aether-01-spatial-reference-headphones', 'Beryllium clarity, cradled in lambskin.', 'CNC-machined anodized aluminum earcups house 50mm beryllium drivers tuned for a flat, holographic stage. Lambskin memory acoustic pads seal without pressure for hours of reference listening.', 540, null, 4.92, 318, 42, true, true, false, array['Anodized aluminum', 'Lambskin leather', 'Beryllium', 'Memory foam']::text[], '190 × 172 × 88 mm', '348 g', '2-year AETHERIA Care warranty · lifetime servicing', '{"Driver":"50 mm beryllium dome","Frequency response":"4 Hz – 48 kHz","Impedance":"32 Ω","Sensitivity":"104 dB SPL/mW","Connectivity":"USB-C lossless · 3.5 mm analog","Battery":"40 h (ANC off)"}'::jsonb, array['/images/products/aether-01-headphones.png']::text[], '{"shape":"headphones","finish":"anodized-aluminum","metallic":0.85,"roughness":0.32,"base_hex":"#C9C6C0","accent_hex":"#C85632"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'AE-DA-002', 'MONOLITH Desk Lamp 02', 'monolith-desk-lamp-02', 'Brass, travertine, and a sunset on a dial.', 'A solid brushed-brass column rising from an Italian travertine base. A stepless rotary dimmer sweeps colour temperature from 2200K candlelight to 4000K daylight at CRI 98+.', 380, null, 4.88, 146, 27, true, false, false, array['Solid brass', 'Italian travertine', 'Opal glass']::text[], 'Ø 140 × 420 mm', '3.2 kg', '5-year structural warranty · lifetime servicing', '{"Colour temperature":"2200K – 4000K stepless","CRI":"98+","Output":"620 lm","Control":"Rotary dimmer · touch memory","Power":"USB-C PD 30 W"}'::jsonb, array['/images/products/monolith-desk-lamp.png']::text[], '{"shape":"lamp","finish":"brushed-brass","metallic":0.95,"roughness":0.38,"base_hex":"#B8935A","accent_hex":"#E9DFD0"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', 'AE-TC-003', 'KINETIC-65 Field Mechanical Keyboard', 'kinetic-65-field-mechanical-keyboard', 'Gasket-mounted. Hand-lubed. Unmistakably solid.', 'A bead-blasted aluminum chassis floats on poron gaskets for a soft, deep keystroke. Custom lubricated tactile switches and a solid brass rotary encoder make every input deliberate.', 420, 460, 4.95, 402, 18, true, true, false, array['Bead-blasted aluminum', 'Solid brass', 'PBT double-shot keycaps', 'Poron gaskets']::text[], '318 × 112 × 34 mm', '1.86 kg', '2-year AETHERIA Care warranty · lifetime servicing', '{"Layout":"65% · 68 keys","Switches":"AETHERIA Tactile 62g, factory-lubed","Mount":"Gasket, poron","Polling":"8000 Hz wired · 1000 Hz 2.4 GHz","Encoder":"Solid brass, 30 detents"}'::jsonb, array['/images/products/kinetic-65-keyboard.png']::text[], '{"shape":"keyboard","finish":"bead-blasted-aluminum","metallic":0.7,"roughness":0.55,"base_hex":"#8E8B86","accent_hex":"#C85632"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000001', 'AE-SA-004', 'SONOSCAPE OBELISK Omni Speaker', 'sonoscape-obelisk-omni-speaker', 'Sound that fills a room like light.', 'A 360-degree spatial waveguide carved from volcanic basalt and crowned in spun aluminum disperses sound evenly to every corner — no sweet spot, only space.', 890, null, 4.9, 97, 9, true, false, false, array['Volcanic basalt', 'Spun aluminum', 'Acoustic wool']::text[], 'Ø 160 × 640 mm', '11.4 kg', '5-year structural warranty · lifetime servicing', '{"Dispersion":"360° omnidirectional waveguide","Drivers":"1 × 6.5\" woofer · 1 × 1\" ring radiator","Amplification":"2 × 120 W Class-D","Streaming":"AirPlay 2 · Chromecast · Spotify Connect","Room correction":"Auto-calibrating"}'::jsonb, array['/images/products/sonoscape-obelisk-speaker.png']::text[], '{"shape":"obelisk","finish":"volcanic-basalt","metallic":0.1,"roughness":0.9,"base_hex":"#2B2926","accent_hex":"#C9C6C0"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000003', 'AE-TC-005', 'CHRONO-DIAL Tactile Studio Controller', 'chrono-dial-tactile-studio-controller', 'Scrub time with weight and intent.', 'A heavyweight magnetic haptic knob for timeline scrubbing, volume grading and colour wheels. Programmable detents let you feel every frame.', 240, null, 4.81, 64, 55, false, false, true, array['Stainless steel', 'Machined aluminum', 'Silicone base']::text[], 'Ø 86 × 48 mm', '612 g', '2-year AETHERIA Care warranty · lifetime servicing', '{"Haptics":"Magnetic, programmable detents","Resolution":"3600 steps / rev","Compatibility":"DaVinci Resolve · Premiere · Logic · Ableton","Connection":"USB-C · Bluetooth LE"}'::jsonb, array['/images/products/chrono-dial-controller.png']::text[], '{"shape":"dial","finish":"polished-steel","metallic":1,"roughness":0.2,"base_hex":"#B5B2AC","accent_hex":"#C85632"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000002', 'AE-DA-006', 'TRAVERTINE Valet & MagSafe Dock', 'travertine-valet-magsafe-dock', 'Roman stone, modern charge.', 'A hand-honed Roman travertine tray with two integrated 15W Qi2 magnetic charging pucks. A resting place for the day''s essentials.', 195, null, 4.86, 233, 64, false, true, false, array['Roman travertine', 'Anodized aluminum', 'Wool felt']::text[], '260 × 140 × 22 mm', '1.4 kg', '2-year AETHERIA Care warranty · lifetime servicing', '{"Charging":"2 × 15 W Qi2 magnetic","Input":"USB-C PD 45 W","Finish":"Hand-honed, sealed"}'::jsonb, array['/images/products/travertine-magsafe-dock.png']::text[], '{"shape":"tray","finish":"honed-travertine","metallic":0,"roughness":0.75,"base_hex":"#E3D6C1","accent_hex":"#8E8B86"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000004', 'AE-AL-007', 'SOLARIS Halo Atmospheric Lamp', 'solaris-halo-atmospheric-lamp', 'A ring of refracted sunset.', 'A frosted borosilicate glass ring with sunset refraction optics casts a gradient of amber to rose across the wall — circadian-dimmed to follow your evening.', 310, null, 4.84, 121, 31, true, false, false, array['Borosilicate glass', 'Anodized aluminum', 'Travertine']::text[], 'Ø 300 × 360 mm', '2.6 kg', '2-year AETHERIA Care warranty · lifetime servicing', '{"Optics":"Sunset refraction film","Colour temperature":"1800K – 3000K","Dimming":"Circadian auto-dim · app","Power":"24 V DC"}'::jsonb, array['/images/products/solaris-halo-lamp.png']::text[], '{"shape":"halo","finish":"frosted-borosilicate","metallic":0.05,"roughness":0.6,"base_hex":"#EFE7DC","accent_hex":"#E58A5C"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000002', 'AE-DA-008', 'ARCHIVE-04 Modular Monitor Riser', 'archive-04-modular-monitor-riser', 'A bridge with a quiet vault beneath.', 'An extruded architectural aluminum bridge lifts your display to eye level, concealing a felt-lined cable vault and modular storage drawers below.', 290, null, 4.79, 88, 22, false, false, false, array['Extruded aluminum', 'Wool felt', 'Walnut']::text[], '620 × 240 × 110 mm', '4.1 kg', '5-year structural warranty · lifetime servicing', '{"Load":"Up to 30 kg","Modules":"2 drawers · 1 cable vault","Passthrough":"USB-C 10 Gbps hub"}'::jsonb, array['/images/products/archive-04-monitor-riser.png']::text[], '{"shape":"riser","finish":"anodized-aluminum","metallic":0.8,"roughness":0.4,"base_hex":"#A9A6A0","accent_hex":"#6B4A32"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000001', 'AE-SA-009', 'PULSE-DAC Reference Headphone Amplifier', 'pulse-dac-reference-headphone-amplifier', 'Dual-mono Class-A, with a warm glowing heart.', 'A dual-mono Class-A desktop DAC and amplifier with an exposed vacuum tube stage. Measured transparency, felt warmth.', 460, null, 4.87, 52, 14, false, false, true, array['Machined aluminum', 'Borosilicate glass', 'Brass']::text[], '220 × 180 × 96 mm', '2.9 kg', '2-year AETHERIA Care warranty · lifetime servicing', '{"DAC":"Dual ES9039PRO","Output":"2 × 1.8 W @ 32 Ω","Tube stage":"6922 dual triode","Inputs":"USB-C · Optical · Coax","Formats":"PCM 768 kHz · DSD512"}'::jsonb, array['/images/products/pulse-dac-amplifier.png']::text[], '{"shape":"amplifier","finish":"anodized-aluminum","metallic":0.85,"roughness":0.35,"base_hex":"#3A3835","accent_hex":"#F2A65A"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000010', 'c0000000-0000-4000-8000-000000000002', 'AE-DA-010', 'VERGE-PAD Architectural Desk Mat', 'verge-pad-architectural-desk-mat', 'Saddle leather over Portuguese cork.', 'Full-grain vegetable-tanned saddle leather bonded to natural Portuguese cork. Ages into a deep patina that records the work done upon it.', 125, null, 4.83, 176, 80, false, false, false, array['Vegetable-tanned leather', 'Portuguese cork']::text[], '900 × 400 × 4 mm', '860 g', '2-year AETHERIA Care warranty · lifetime servicing', '{"Leather":"Full-grain, Tuscan veg-tan","Backing":"Natural cork, non-slip","Edge":"Hand-burnished"}'::jsonb, array['/images/products/verge-pad-desk-mat.png']::text[], '{"shape":"mat","finish":"veg-tan-leather","metallic":0,"roughness":0.85,"base_hex":"#8A5A3B","accent_hex":"#C9A27A"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000003', 'AE-TC-011', 'NUMEN-12 Programmable Macro Pad', 'numen-12-programmable-macro-pad', 'Twelve living keys in titanium.', 'A 12-key tactile matrix with individual OLED legends that adapt to the app in focus, housed in CNC-machined titanium.', 185, null, 4.76, 71, 38, false, false, false, array['CNC titanium', 'Sapphire glass', 'PBT']::text[], '112 × 112 × 28 mm', '420 g', '2-year AETHERIA Care warranty · lifetime servicing', '{"Keys":"12 × OLED 0.66\"","Switches":"Hot-swap tactile","Profiles":"Per-app auto-switch","Connection":"USB-C"}'::jsonb, array['/images/products/numen-12-macro-pad.png']::text[], '{"shape":"macropad","finish":"cnc-titanium","metallic":0.9,"roughness":0.45,"base_hex":"#6E6C68","accent_hex":"#D4C3A3"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000012', 'c0000000-0000-4000-8000-000000000004', 'AE-AL-012', 'LUMINA-ARC Portable Table Lantern', 'lumina-arc-portable-table-lantern', 'Forty-eight hours of candlelight, cordless.', 'A cordless IP54 anodized bronze lantern with a 48-hour warm candle mode. From dinner table to terrace without a cable in sight.', 260, null, 4.89, 204, 46, false, true, false, array['Anodized bronze', 'Opal acrylic', 'Leather strap']::text[], 'Ø 110 × 280 mm', '780 g', '2-year AETHERIA Care warranty · lifetime servicing', '{"Battery":"48 h candle mode · 12 h full","Rating":"IP54","Colour temperature":"2000K – 2700K","Charging":"Magnetic pogo dock"}'::jsonb, array['/images/products/lumina-arc-lantern.png']::text[], '{"shape":"lantern","finish":"anodized-bronze","metallic":0.8,"roughness":0.42,"base_hex":"#7A5B3A","accent_hex":"#F4C27A"}'::jsonb)
on conflict (id) do update set
  category_id = excluded.category_id,
  sku = excluded.sku,
  title = excluded.title,
  slug = excluded.slug,
  tagline = excluded.tagline,
  description = excluded.description,
  price_usd = excluded.price_usd,
  compare_at_price_usd = excluded.compare_at_price_usd,
  rating = excluded.rating,
  review_count = excluded.review_count,
  stock_count = excluded.stock_count,
  is_featured = excluded.is_featured,
  is_bestseller = excluded.is_bestseller,
  is_new_arrival = excluded.is_new_arrival,
  materials = excluded.materials,
  dimensions = excluded.dimensions,
  weight = excluded.weight,
  warranty_info = excluded.warranty_info,
  specs = excluded.specs,
  images = excluded.images,
  three_d_config = excluded.three_d_config;

insert into public.product_variants (id, product_id, sku, variant_name, color_hex, price_modifier_usd, stock_count) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'AE-SA-001-SLV', 'Raw Anodized Silver', '#C9C6C0', 0, 18),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'AE-SA-001-OBS', 'Obsidian Matte', '#1F1E1C', 0, 16),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'AE-SA-001-TER', 'Terracotta Edition', '#C85632', 40, 8),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'AE-DA-002-BRS', 'Brushed Brass', '#B8935A', 0, 14),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'AE-DA-002-BRZ', 'Smoked Bronze', '#5E4630', 20, 13),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'AE-TC-003-STN', 'Stone Grey', '#8E8B86', 0, 9),
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000003', 'AE-TC-003-OBS', 'Obsidian Matte', '#1F1E1C', 0, 6),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000003', 'AE-TC-003-SGE', 'Botanical Sage', '#2F5238', 30, 3),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000004', 'AE-SA-004-BAS', 'Volcanic Basalt', '#2B2926', 0, 5),
  ('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000004', 'AE-SA-004-TRV', 'Travertine White', '#E3D6C1', 120, 4),
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000005', 'AE-TC-005-STL', 'Polished Steel', '#B5B2AC', 0, 30),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000005', 'AE-TC-005-OBS', 'Obsidian Matte', '#1F1E1C', 0, 25),
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000006', 'AE-DA-006-TRV', 'Classic Travertine', '#E3D6C1', 0, 40),
  ('b0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000006', 'AE-DA-006-NER', 'Nero Marquina', '#232120', 35, 24),
  ('b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000007', 'AE-AL-007-FRS', 'Frosted Dawn', '#EFE7DC', 0, 19),
  ('b0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000007', 'AE-AL-007-AMB', 'Amber Dusk', '#E58A5C', 0, 12),
  ('b0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000008', 'AE-DA-008-SLV', 'Raw Anodized Silver', '#A9A6A0', 0, 12),
  ('b0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000008', 'AE-DA-008-WAL', 'Walnut & Graphite', '#4A3A2E', 60, 10),
  ('b0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000009', 'AE-SA-009-GRP', 'Graphite', '#3A3835', 0, 8),
  ('b0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000009', 'AE-SA-009-SLV', 'Raw Anodized Silver', '#C9C6C0', 0, 6),
  ('b0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000010', 'AE-DA-010-TAN', 'Natural Tan', '#B07A4F', 0, 34),
  ('b0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000010', 'AE-DA-010-ESP', 'Espresso', '#4A2F22', 0, 28),
  ('b0000000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000010', 'AE-DA-010-OLV', 'Olive', '#5A5A3A', 0, 18),
  ('b0000000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000011', 'AE-TC-011-TIT', 'Raw Titanium', '#6E6C68', 0, 22),
  ('b0000000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000011', 'AE-TC-011-CHM', 'Champagne Gold', '#D4C3A3', 45, 16),
  ('b0000000-0000-4000-8000-000000000026', 'a0000000-0000-4000-8000-000000000012', 'AE-AL-012-BRZ', 'Anodized Bronze', '#7A5B3A', 0, 26),
  ('b0000000-0000-4000-8000-000000000027', 'a0000000-0000-4000-8000-000000000012', 'AE-AL-012-SGE', 'Botanical Sage', '#2F5238', 0, 20)
on conflict (id) do update set
  product_id = excluded.product_id,
  sku = excluded.sku,
  variant_name = excluded.variant_name,
  color_hex = excluded.color_hex,
  price_modifier_usd = excluded.price_modifier_usd,
  stock_count = excluded.stock_count;

insert into public.reviews (id, product_id, author_name, author_city, rating, title, comment, verified_purchase, created_at) values
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Eleanor Whitfield', 'London, UK', 5, 'The quietest luxury I own', 'The beryllium drivers are uncannily precise, and the lambskin pads disappear after five minutes. Replaced a pair costing twice as much.', true, '2026-09-14T10:12:00Z'),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Daniel Okafor', 'New York, US', 5, 'Studio reference, living-room comfort', 'I mix on these daily. Flat, honest, and the anodized cups still look new after months on the road.', true, '2026-10-02T16:40:00Z'),
  ('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Mei Tanaka', 'Tokyo, JP', 4, 'Exceptional — slightly heavy', 'Sound is holographic. At 348 g you notice them on long flights, but I''d still buy them again tomorrow.', true, '2026-10-21T08:05:00Z'),
  ('d0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'Lukas Brenner', 'Zurich, CH', 5, 'Sunset on demand', 'The rotary dimmer is buttery and the 2200K end makes late evenings feel like a hotel suite. The travertine base is stunning.', true, '2026-08-30T19:22:00Z'),
  ('d0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'Amelia Hart', 'Copenhagen, DK', 5, 'Object first, lamp second', 'Guests ask about it constantly. The brass is developing a beautiful warmth already.', true, '2026-10-11T12:48:00Z'),
  ('d0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'Rafael Moreno', 'Barcelona, ES', 5, 'End-game keyboard', 'The gasket mount gives a soft, deep thock. The brass encoder alone feels like jewellery.', true, '2026-09-05T09:30:00Z'),
  ('d0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000003', 'Sophie Laurent', 'Paris, FR', 5, 'Typing has become a pleasure', 'Factory lube is perfect. I write for a living and my hands notice the difference by the afternoon.', true, '2026-10-18T14:15:00Z'),
  ('d0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000004', 'James Whitmore', 'Los Angeles, US', 5, 'No sweet spot — everywhere is the sweet spot', 'Fills our open-plan living space evenly. The basalt is genuinely heavy and genuinely beautiful.', true, '2026-09-27T20:02:00Z'),
  ('d0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000005', 'Priya Raman', 'Singapore, SG', 5, 'Colour grading changed forever', 'Programmable detents in Resolve are a revelation. It feels like a professional console in my palm.', true, '2026-10-29T07:44:00Z'),
  ('d0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000006', 'Oliver Grant', 'Edinburgh, UK', 5, 'A ritual at the end of the day', 'Keys, watch, phone — all in one place, all charging. The honed stone is a joy to touch.', true, '2026-09-19T18:36:00Z'),
  ('d0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000007', 'Isabella Conti', 'Milan, IT', 5, 'Like living inside a golden hour', 'The refraction on the wall is magical. Circadian dimming means I never touch it after setup.', true, '2026-10-07T21:10:00Z'),
  ('d0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000008', 'Henrik Sørensen', 'Oslo, NO', 4, 'Architectural and practical', 'Solid as a bridge. The felt cable vault finally tamed my desk. Drawers could slide a touch smoother.', true, '2026-08-22T11:55:00Z'),
  ('d0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000009', 'Marcus Feld', 'Berlin, DE', 5, 'Measured transparency, felt warmth', 'Black background with just enough tube bloom. Drives my planars with authority.', true, '2026-11-03T22:18:00Z'),
  ('d0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000010', 'Charlotte Reyes', 'Austin, US', 5, 'Patina in progress', 'Three months in and the leather is turning a gorgeous honey colour. The cork backing never slips.', true, '2026-09-09T15:27:00Z'),
  ('d0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000011', 'Kenji Watanabe', 'Kyoto, JP', 5, 'Small, mighty, beautifully made', 'Per-app OLED legends are brilliantly useful, and the titanium housing feels indestructible.', true, '2026-10-25T06:50:00Z'),
  ('d0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000012', 'Grace Holloway', 'Sydney, AU', 5, 'Dinner-table magic', 'Lasted two full weekends of terrace dinners on candle mode. The bronze is exquisite.', true, '2026-11-08T09:03:00Z')
on conflict (id) do update set
  product_id = excluded.product_id,
  author_name = excluded.author_name,
  author_city = excluded.author_city,
  rating = excluded.rating,
  title = excluded.title,
  comment = excluded.comment,
  verified_purchase = excluded.verified_purchase,
  created_at = excluded.created_at;

insert into public.discount_codes (id, code, description, discount_percent, min_order_usd, is_active, expires_at) values
  ('e0000000-0000-4000-8000-000000000001', 'AETHERIA15', '15% off orders over $100', 15, 100, true, null),
  ('e0000000-0000-4000-8000-000000000002', 'TIER1VIP', '20% off orders over $300', 20, 300, true, null),
  ('e0000000-0000-4000-8000-000000000003', 'FREESHIP', '10% welcome discount, no minimum', 10, 0, true, null)
on conflict (id) do update set
  code = excluded.code,
  description = excluded.description,
  discount_percent = excluded.discount_percent,
  min_order_usd = excluded.min_order_usd,
  is_active = excluded.is_active,
  expires_at = excluded.expires_at;

commit;
