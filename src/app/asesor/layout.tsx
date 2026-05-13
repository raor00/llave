import { AsesorSidebar } from "@/components/asesor/sidebar";
import { CommandPalette } from "@/components/asesor/command-palette";

export default function AsesorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AsesorSidebar />
      <div className="flex-1 min-w-0">{children}</div>
      <CommandPalette />
    </div>
  );
}
