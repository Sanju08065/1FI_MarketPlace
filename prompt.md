# 1Fi Marketplace — Product Image Generation Prompts

Copy-paste prompts for generating all **10 product images** (GPT-4o / DALL·E / any image model). They're engineered so every variant of a product shares the **same angle, framing and lighting** — only the colour changes — which makes the variant image-swap in the app look seamless.

---

## 0. How to use these

1. Generate one image per block below (there are 10).
2. **Output settings**
   - **Aspect ratio:** `1:1` (square)
   - **Resolution:** `1024×1024` (or higher if available)
   - **Background:** **transparent PNG** (preferred). If your tool can't do transparent, use a **pure seamless white `#FFFFFF`** studio background.
3. **Save each file with the EXACT filename** from the mapping table (§5) and hand them to me. They'll drop into `backend/prisma/assets/` and I'll switch the seed to load them locally (no more CDN downloads).
4. **Consistency tip:** generate all variants of the *same* product back-to-back in one chat so the model keeps the identical pose. If a variant drifts, say: *"same shot, same angle and lighting, only change the colour to …"*.

**Global style (already baked into every prompt below):** ultra-realistic studio product photography, single centered product, ~12% empty margin around it, soft diffused three-point lighting, subtle soft contact shadow, crisp focus, extremely detailed.

**Global negatives (append if your tool supports it):** `no text, no logos on the background, no watermark, no packaging, no hands, no extra props, no busy background, no duplicate product, no reflection of the studio`.

> If the model refuses a brand name, just delete the brand word ("Apple", "Samsung", "Sony") — the physical description alone still produces an accurate render.

---

## 1. Apple iPhone 16 Pro (4 images)

**Shared look:** a single flagship smartphone floating vertically at a gentle **15° three-quarter angle**, rear panel toward the camera with the flat right edge just visible. Aerospace-grade **titanium frame**, flat sides, softly rounded corners. Large **square rear camera plateau in the top-left with three lenses in a triangle** plus LiDAR + flash and metallic lens rings. Slim **Camera Control** button on the right edge. Matte back glass.

### 1a · `iphone-black.png` — Black Titanium
```
Ultra-realistic studio product photo of the Apple iPhone 16 Pro, single phone floating vertically at a gentle 15° three-quarter angle, rear panel facing the camera with the flat right edge visible. Aerospace-grade titanium frame with brushed matte finish, flat sides and softly rounded corners; large square rear camera plateau in the top-left with three lenses arranged in a triangle plus LiDAR and flash; slim Camera Control button on the right edge; matte back glass. Finish: BLACK TITANIUM — deep graphite-charcoal matte titanium (approx #3A3A3C) with a fine brushed texture. Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

### 1b · `iphone-white.png` — White Titanium
```
Ultra-realistic studio product photo of the Apple iPhone 16 Pro, single phone floating vertically at a gentle 15° three-quarter angle, rear panel facing the camera with the flat right edge visible. Aerospace-grade titanium frame with brushed matte finish, flat sides and softly rounded corners; large square rear camera plateau in the top-left with three lenses arranged in a triangle plus LiDAR and flash; slim Camera Control button on the right edge; matte back glass. Finish: WHITE TITANIUM — soft warm off-white / pale silver matte titanium (approx #F0EDE6) with a delicate brushed sheen. Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

### 1c · `iphone-desert.png` — Desert Titanium
```
Ultra-realistic studio product photo of the Apple iPhone 16 Pro, single phone floating vertically at a gentle 15° three-quarter angle, rear panel facing the camera with the flat right edge visible. Aerospace-grade titanium frame with brushed matte finish, flat sides and softly rounded corners; large square rear camera plateau in the top-left with three lenses arranged in a triangle plus LiDAR and flash; slim Camera Control button on the right edge; matte back glass. Finish: DESERT TITANIUM — warm sandy gold-beige matte titanium (approx #C9A882). Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

### 1d · `iphone-natural.png` — Natural Titanium
```
Ultra-realistic studio product photo of the Apple iPhone 16 Pro, single phone floating vertically at a gentle 15° three-quarter angle, rear panel facing the camera with the flat right edge visible. Aerospace-grade titanium frame with brushed matte finish, flat sides and softly rounded corners; large square rear camera plateau in the top-left with three lenses arranged in a triangle plus LiDAR and flash; slim Camera Control button on the right edge; matte back glass. Finish: NATURAL TITANIUM — neutral warm-grey titanium (approx #B8A99A) with a brushed metallic sheen. Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

---

## 2. Samsung Galaxy S24 Ultra (4 images)

**Shared look:** a single flagship smartphone floating vertically at a gentle **15° three-quarter angle**, rear panel toward the camera. **Ultra-boxy rectangular slab with sharp 90° corners** and a flat titanium frame. Flat matte back glass with **four individual camera lenses (no raised module) aligned vertically in the top-left**, each a separate metallic ring. An embedded **S Pen** at the bottom edge.

### 2a · `samsung-black.png` — Titanium Black
```
Ultra-realistic studio product photo of the Samsung Galaxy S24 Ultra, single phone floating vertically at a gentle 15° three-quarter angle with the rear panel facing the camera. Ultra-boxy rectangular slab with sharp 90° corners and a flat titanium frame; flat matte back glass; four individual camera lenses (no raised housing) aligned vertically in the top-left corner, each a separate metallic ring; embedded S Pen at the bottom edge. Finish: TITANIUM BLACK — near-black graphite matte (approx #2C2C2C). Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

### 2b · `samsung-gray.png` — Titanium Gray
```
Ultra-realistic studio product photo of the Samsung Galaxy S24 Ultra, single phone floating vertically at a gentle 15° three-quarter angle with the rear panel facing the camera. Ultra-boxy rectangular slab with sharp 90° corners and a flat titanium frame; flat matte back glass; four individual camera lenses (no raised housing) aligned vertically in the top-left corner, each a separate metallic ring; embedded S Pen at the bottom edge. Finish: TITANIUM GRAY — neutral medium warm-grey matte (approx #7A7775). Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

### 2c · `samsung-violet.png` — Titanium Violet
```
Ultra-realistic studio product photo of the Samsung Galaxy S24 Ultra, single phone floating vertically at a gentle 15° three-quarter angle with the rear panel facing the camera. Ultra-boxy rectangular slab with sharp 90° corners and a flat titanium frame; flat matte back glass; four individual camera lenses (no raised housing) aligned vertically in the top-left corner, each a separate metallic ring; embedded S Pen at the bottom edge. Finish: TITANIUM VIOLET — soft pale lavender with a subtle greyed-purple matte tone (approx #9B8FA6). Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

### 2d · `samsung-yellow.png` — Titanium Yellow
```
Ultra-realistic studio product photo of the Samsung Galaxy S24 Ultra, single phone floating vertically at a gentle 15° three-quarter angle with the rear panel facing the camera. Ultra-boxy rectangular slab with sharp 90° corners and a flat titanium frame; flat matte back glass; four individual camera lenses (no raised housing) aligned vertically in the top-left corner, each a separate metallic ring; embedded S Pen at the bottom edge. Finish: TITANIUM YELLOW — muted soft mustard / pale-gold matte (approx #C9B560). Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

---

## 3. Sony WH-1000XM5 (2 images)

**Shared look:** premium **over-ear wireless headphones** shown upright at a **3/4 front angle**, one earcup facing forward and the slim headband arcing up. Smooth seamless earcups with **no visible screws**, a **very slim stepless headband** with soft synthetic-leather padding, discreet microphone holes, minimalist design.

### 3a · `sony-black.png` — Black
```
Ultra-realistic studio product photo of the Sony WH-1000XM5 over-ear wireless noise-cancelling headphones, shown upright at a 3/4 front angle with one earcup facing forward and the slim headband arcing upward. Smooth seamless matte earcups with no visible screws, a very slim stepless headband with soft synthetic-leather padding, discreet microphone holes, minimalist premium design. Finish: BLACK — soft-touch matte black (approx #1A1A1A) with subtle low-key highlights. Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

### 3b · `sony-silver.png` — Platinum Silver
```
Ultra-realistic studio product photo of the Sony WH-1000XM5 over-ear wireless noise-cancelling headphones, shown upright at a 3/4 front angle with one earcup facing forward and the slim headband arcing upward. Smooth seamless matte earcups with no visible screws, a very slim stepless headband with soft synthetic-leather padding, discreet microphone holes, minimalist premium design. Finish: PLATINUM SILVER — warm light beige / greige matte (approx #D6D6D3) with subtle champagne-gold accents on the headband sliders. Centered, ~12% margin, transparent background, soft diffused three-point lighting, subtle soft shadow beneath, 1:1 square, 1024×1024, sharp focus, hyper-detailed, no text, no watermark, no extra objects.
```

---

## 4. Optional — product hero shots

The app uses the **first variant** of each product as the card thumbnail, so you don't strictly need separate hero images. If you want dedicated ones anyway, reuse the block for the flagship colour (`iphone-black`, `samsung-black`, `sony-black`) — they already work as heroes.

---

## 5. Filename → seed mapping

Save each PNG with **exactly** this name, then drop them all into `backend/prisma/assets/`:

| Product | Variant | Colour (hex) | Filename |
|---|---|---|---|
| iPhone 16 Pro | Black Titanium | `#3A3A3C` | `iphone-black.png` |
| iPhone 16 Pro | White Titanium | `#F0EDE6` | `iphone-white.png` |
| iPhone 16 Pro | Desert Titanium | `#C9A882` | `iphone-desert.png` |
| iPhone 16 Pro | Natural Titanium | `#B8A99A` | `iphone-natural.png` |
| Galaxy S24 Ultra | Titanium Black | `#2C2C2C` | `samsung-black.png` |
| Galaxy S24 Ultra | Titanium Gray | `#7A7775` | `samsung-gray.png` |
| Galaxy S24 Ultra | Titanium Violet | `#9B8FA6` | `samsung-violet.png` |
| Galaxy S24 Ultra | Titanium Yellow | `#C9B560` | `samsung-yellow.png` |
| Sony WH-1000XM5 | Black | `#1A1A1A` | `sony-black.png` |
| Sony WH-1000XM5 | Platinum Silver | `#D6D6D3` | `sony-silver.png` |

---

## 6. Rendering notes (why these choices)

- **Transparent background** so the product floats on the app's light-purple gradient in the detail gallery (`object-contain`) and on the grey tile in the marketplace cards (`object-cover`). Pure white also works if transparency isn't available.
- **~12% margin + centered** keeps the product balanced in both the square card crop and the 4:3 gallery.
- **Identical angle/lighting per product** = the variant switch animation looks like a pure colour change, not a different photo.
- **PNG** preserves crisp edges and transparency (the API stores whatever bytes you give it and serves them as-is).

Once you've generated all 10, hand them over and I'll wire the seed to load from `backend/prisma/assets/` and re-seed — fully self-contained, no external image dependencies.
