import type { Metadata } from 'next';
import { ShopContent } from './ShopContent';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Top brands, nearby stores and the 1Fi Marketplace — all on mutual-fund-backed EMIs.',
};

// Server shell — delegates interactivity to the client component.
export default function ShopPage() {
  return <ShopContent />;
}
