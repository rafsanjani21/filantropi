/**
 * app/(main)/layout.tsx
 *
 * Fungsi   : Layout route group (main) yang meneruskan children tanpa wrapper tambahan.
 * Ekspor   : default MainLayout
 * Dipakai  : Route group (main); membungkus seluruh halaman di app/(main)
 */

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
