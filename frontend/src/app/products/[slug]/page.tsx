import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, resolveImageUrl } from '@/lib/api';
import { ProductDetail } from './ProductDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

// Dedupe the fetch across generateMetadata + the page render.
const loadProduct = cache((slug: string) => getProduct(slug).catch(() => null));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: 'Product' };
  return {
    title: product.name,
    description:
      product.description ?? `Buy the ${product.name} on no-cost EMI backed by your mutual funds.`,
    openGraph: {
      title: `${product.name} | 1Fi`,
      description: product.description ?? undefined,
      images: product.imageUrl ? [{ url: resolveImageUrl(product.imageUrl) }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
