/**
 * Seed script.
 *
 * Loads product imagery from local files in `prisma/assets/` (named by
 * sourceKey, e.g. `iphone-black.png`), stores the raw bytes in Postgres, and
 * serves them through the API at `/api/v1/images/:id`. Fully self-contained —
 * no network needed. If an asset file is missing, a branded SVG placeholder is
 * generated so the seed never fails.
 *
 * Run: `npm run db:seed`  (or `npm run db:setup` for reset + migrate + seed)
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ASSETS_DIR = path.join(__dirname, 'assets');
const IMAGE_EXTENSIONS = ['.png', '.webp', '.jpg', '.jpeg'];

// ── Image helpers ─────────────────────────────────────────────────────────────

function mimeFromExt(file: string): string {
  switch (path.extname(file).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'image/png';
  }
}

/** Find `prisma/assets/<sourceKey>.<ext>` for a known image extension. */
function findAsset(sourceKey: string): string | null {
  for (const ext of IMAGE_EXTENSIONS) {
    const candidate = path.join(ASSETS_DIR, `${sourceKey}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function placeholderSvg(title: string, subtitle: string, hex: string): Buffer {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f3ff"/><stop offset="1" stop-color="#ece5ff"/>
    </linearGradient>
    <linearGradient id="obj" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${hex}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${hex}" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <rect x="250" y="150" width="300" height="420" rx="52" fill="url(#obj)" stroke="#ffffff" stroke-width="6"/>
  <rect x="286" y="196" width="228" height="300" rx="28" fill="#ffffff" fill-opacity="0.14"/>
  <text x="400" y="650" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#2b2140">${esc(title)}</text>
  <text x="400" y="700" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#6b6480">${esc(subtitle)}</text>
</svg>`;
  return Buffer.from(svg, 'utf8');
}

/** Store an image (local asset, else generated placeholder) and return its id. */
async function ensureImage(opts: {
  sourceKey: string;
  title: string;
  subtitle: string;
  hex: string;
}): Promise<string> {
  const assetPath = findAsset(opts.sourceKey);

  let buffer: Buffer;
  let mimeType: string;
  if (assetPath) {
    buffer = fs.readFileSync(assetPath);
    mimeType = mimeFromExt(assetPath);
    process.stdout.write(`  ✓ ${path.basename(assetPath)} (${(buffer.length / 1024).toFixed(0)} KB)\n`);
  } else {
    buffer = placeholderSvg(opts.title, opts.subtitle, opts.hex);
    mimeType = 'image/svg+xml';
    process.stdout.write(`  ⚠ ${opts.sourceKey}: no asset file found — using placeholder\n`);
  }

  const image = await prisma.image.create({
    data: { sourceKey: opts.sourceKey, mimeType, data: buffer, byteSize: buffer.length },
  });
  return image.id;
}

// ── Catalogue ─────────────────────────────────────────────────────────────────

interface VariantSeed {
  label: string;
  storage?: string;
  color: string;
  hex: string;
  price: number;
  stock: number;
  sourceKey: string;
}
interface PlanSeed {
  tenureMonths: number;
  interestRate: number;
  cashbackAmount?: number;
  cashbackLabel?: string;
  isRecommended?: boolean;
}
interface ProductSeed {
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  mrp: number;
  variants: VariantSeed[];
  plans: PlanSeed[];
}

const CATALOGUE: ProductSeed[] = [
  {
    name: 'Apple iPhone 16 Pro',
    slug: 'apple-iphone-16-pro',
    brand: 'Apple',
    category: 'smartphones',
    description:
      'A18 Pro chip · 48MP Fusion camera with 5× telephoto · 6.3″ Super Retina XDR ProMotion · Camera Control · aerospace-grade titanium · up to 27 hrs video.',
    mrp: 134900,
    variants: [
      { label: '256 GB · Black Titanium', storage: '256 GB', color: 'Black Titanium', hex: '#3A3A3C', price: 134900, stock: 48, sourceKey: 'iphone-black' },
      { label: '256 GB · White Titanium', storage: '256 GB', color: 'White Titanium', hex: '#F0EDE6', price: 134900, stock: 35, sourceKey: 'iphone-white' },
      { label: '256 GB · Desert Titanium', storage: '256 GB', color: 'Desert Titanium', hex: '#C9A882', price: 134900, stock: 28, sourceKey: 'iphone-desert' },
      { label: '512 GB · Natural Titanium', storage: '512 GB', color: 'Natural Titanium', hex: '#B8A99A', price: 154900, stock: 20, sourceKey: 'iphone-natural' },
    ],
    plans: [
      { tenureMonths: 3, interestRate: 0 },
      { tenureMonths: 6, interestRate: 0, cashbackAmount: 500, cashbackLabel: '₹500 cashback', isRecommended: true },
      { tenureMonths: 9, interestRate: 0 },
      { tenureMonths: 12, interestRate: 0, cashbackAmount: 1000, cashbackLabel: '₹1,000 cashback' },
      { tenureMonths: 24, interestRate: 10.5 },
    ],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    brand: 'Samsung',
    category: 'smartphones',
    description:
      'Snapdragon 8 Gen 3 for Galaxy · 200MP ProVisual Engine · built-in titanium S Pen · 6.8″ QHD+ Dynamic AMOLED 2X · 5000 mAh · Galaxy AI.',
    mrp: 134999,
    variants: [
      { label: '256 GB · Titanium Black', storage: '256 GB', color: 'Titanium Black', hex: '#2C2C2C', price: 124999, stock: 40, sourceKey: 'samsung-black' },
      { label: '256 GB · Titanium Gray', storage: '256 GB', color: 'Titanium Gray', hex: '#7A7775', price: 124999, stock: 30, sourceKey: 'samsung-gray' },
      { label: '256 GB · Titanium Violet', storage: '256 GB', color: 'Titanium Violet', hex: '#9B8FA6', price: 124999, stock: 22, sourceKey: 'samsung-violet' },
      { label: '512 GB · Titanium Yellow', storage: '512 GB', color: 'Titanium Yellow', hex: '#C9B560', price: 144999, stock: 18, sourceKey: 'samsung-yellow' },
    ],
    plans: [
      { tenureMonths: 3, interestRate: 0 },
      { tenureMonths: 6, interestRate: 0, cashbackAmount: 500, cashbackLabel: '₹500 cashback', isRecommended: true },
      { tenureMonths: 9, interestRate: 0 },
      { tenureMonths: 12, interestRate: 0, cashbackAmount: 1000, cashbackLabel: '₹1,000 cashback' },
      { tenureMonths: 24, interestRate: 10.5 },
    ],
  },
  {
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    brand: 'Sony',
    category: 'audio',
    description:
      'Industry-leading noise cancellation · 8 mics + dual processors · 30 hrs battery · LDAC Hi-Res Audio · multipoint Bluetooth · Speak-to-Chat.',
    mrp: 29990,
    variants: [
      { label: 'Black', color: 'Black', hex: '#1A1A1A', price: 26990, stock: 75, sourceKey: 'sony-black' },
      { label: 'Platinum Silver', color: 'Platinum Silver', hex: '#D6D6D3', price: 26990, stock: 55, sourceKey: 'sony-silver' },
    ],
    plans: [
      { tenureMonths: 3, interestRate: 0 },
      { tenureMonths: 6, interestRate: 0, cashbackAmount: 250, cashbackLabel: '₹250 cashback', isRecommended: true },
      { tenureMonths: 9, interestRate: 0 },
      { tenureMonths: 12, interestRate: 0 },
      { tenureMonths: 18, interestRate: 10.5 },
    ],
  },
];

// ── Runner ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('[seed] clearing existing data…');
  await prisma.emiPlan.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.image.deleteMany();

  // Site imagery (hero banner) — stored & served the same way as product images.
  console.log('\n[seed] site images');
  await ensureImage({
    sourceKey: 'shop-banner',
    title: '1Fi Marketplace',
    subtitle: 'Shop banner',
    hex: '#712CDC',
  });

  for (const product of CATALOGUE) {
    console.log(`\n[seed] ${product.name}`);

    const variantImageIds: string[] = [];
    for (const v of product.variants) {
      const id = await ensureImage({
        sourceKey: v.sourceKey,
        title: product.name,
        subtitle: v.color,
        hex: v.hex,
      });
      variantImageIds.push(id);
    }
    const heroImageId = variantImageIds[0] ?? null;

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        category: product.category,
        description: product.description,
        mrp: product.mrp,
        imageId: heroImageId,
        variants: {
          create: product.variants.map((v, i) => ({
            label: v.label,
            storage: v.storage ?? null,
            color: v.color,
            hexColor: v.hex,
            price: v.price,
            stock: v.stock,
            imageId: variantImageIds[i] ?? null,
          })),
        },
        emiPlans: {
          create: product.plans.map((p) => ({
            tenureMonths: p.tenureMonths,
            interestRate: p.interestRate,
            cashbackAmount: p.cashbackAmount ?? 0,
            cashbackLabel: p.cashbackLabel ?? null,
            isRecommended: p.isRecommended ?? false,
          })),
        },
      },
    });
    console.log(`  → ${product.variants.length} variants · ${product.plans.length} EMI plans`);
  }

  const [products, variants, plans, images] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.emiPlan.count(),
    prisma.image.count(),
  ]);
  console.log(
    `\n[seed] done — products=${products} variants=${variants} emiPlans=${plans} images=${images}`,
  );
}

main()
  .catch((err) => {
    console.error('[seed] FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
