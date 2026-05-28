// Pass-through wrapper. The login screen lives at /admin/login and the
// protected dashboard lives under /admin/(protected)/* with its own
// layout that enforces auth and shows the sidebar.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
