import { redirect } from 'next/navigation';

// The 1Fi app opens on the Shop tab — mirror that here.
export default function RootPage() {
  redirect('/shop');
}
