// Pitch route — renders the full-screen interactive Llave investor deck.
import type { Metadata } from "next";
import { PitchDeck } from "@/components/presentacion/pitch-deck";

export const metadata: Metadata = {
  title: "Llave — Pitch",
};

export default function PresentacionPage() {
  return <PitchDeck />;
}
