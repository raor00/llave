// Showcase route — auto-looping product reel of Llave (~24s, loops forever).
import type { Metadata } from "next";
import { ShowcaseReel } from "@/components/showcase/showcase-reel";

export const metadata: Metadata = {
  title: "Llave — En 30 segundos",
};

export default function ShowcasePage() {
  return <ShowcaseReel />;
}
