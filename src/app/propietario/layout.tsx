import { PropietarioSidebar } from "@/components/propietario/sidebar";

export default function PropietarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <PropietarioSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
