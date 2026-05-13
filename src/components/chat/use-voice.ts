"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function useVoice() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Cls = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (Cls) setSupported(true);
  }, []);

  const start = useCallback(
    ({ onFinal }: { onFinal: (text: string) => void }) => {
      if (typeof window === "undefined") return;
      const Cls = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!Cls) return;
      const rec = new Cls();
      rec.lang = "es-VE";
      rec.continuous = false;
      rec.interimResults = true;

      let finalText = "";
      rec.onresult = (e) => {
        let interimText = "";
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interimText += r[0].transcript;
        }
        setInterim(interimText);
      };
      rec.onerror = () => {
        setListening(false);
        setInterim("");
      };
      rec.onend = () => {
        setListening(false);
        setInterim("");
        const t = finalText.trim();
        if (t) onFinal(t);
      };

      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    },
    []
  );

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-VE";
    u.rate = 1.05;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  }, []);

  return { supported, listening, interim, start, stop, speak };
}
