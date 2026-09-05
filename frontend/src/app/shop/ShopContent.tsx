'use client';

import { useState } from 'react';
import { MapPin, Store } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { AppShell } from '@/components/layout/AppShell';
import { BottomNav } from '@/components/layout/BottomNav';
import { TabBar, type ShopTab } from '@/components/shop/TabBar';
import { ComingSoon } from '@/components/shop/ComingSoon';
import { MarketplaceTab } from '@/components/marketplace/MarketplaceTab';

export function ShopContent() {
  const [tab, setTab] = useState<ShopTab>('marketplace');

  // Banner is stored in Postgres and served by the API; falls back to the 1Fi CDN.
  const bannerSrc = `${API_BASE}/api/v1/images/by-key/shop-banner`;
  const bannerFallback = 'https://cdn.1fi.in/banners/shop-page%201536x1024.webp';

  return (
    <AppShell className="pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      {/* ── Hero banner — full-bleed, keeps the image's 3:2 ratio so it fits any
          screen width with no cropping, no overlap and no layout shift ── */}
      <section className="relative aspect-[3/2] w-full overflow-hidden bg-gradient-to-br from-[#4e1fa3] to-[#712CDC]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bannerSrc}
          alt="Shop today, pay later using your mutual funds"
          width={1536}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            // API image → 1Fi CDN → hide (gradient background still shows)
            if (t.src !== bannerFallback) t.src = bannerFallback;
            else t.style.display = 'none';
          }}
        />
        {/* soft bottom fade so the banner transitions cleanly into white */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/40 to-transparent" />
      </section>

      {/* ── Tab bar floats over the banner's bottom edge: half sits on the
          banner, half spills below it (negative margin + z-10) ── */}
      <div className="relative z-10 -mt-7 px-4">
        <TabBar active={tab} onChange={setTab} />
      </div>

      {/* ── Tab content, padded inside the shell ── */}
      <div className="px-4 pt-4">
        <div className="min-h-[52svh]">
          {tab === 'brands' && (
            <ComingSoon
              icon={<Store className="h-7 w-7" />}
              title="Top Brands"
              description="Shop your favourite online brands on no-cost EMIs — part of the existing 1Fi Shop experience."
            />
          )}
          {tab === 'nearby' && (
            <ComingSoon
              icon={<MapPin className="h-7 w-7" />}
              title="Nearby Stores"
              description="Discover partner stores around you and pay in easy instalments backed by your mutual funds."
            />
          )}
          {tab === 'marketplace' && <MarketplaceTab />}
        </div>
      </div>

      <BottomNav />
    </AppShell>
  );
}
