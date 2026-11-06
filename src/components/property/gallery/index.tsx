"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiMaximize2,
  FiX,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Img = { url: string; alt?: string | null };

export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const t = useTranslations("gallery");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;

  const prev = useCallback(
    () => setActive((i) => (i - 1 + count) % count),
    [count],
  );
  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, prev, next]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <div className="text-center">
          <FiHome size={40} className="mx-auto" />
          <p className="mt-2 text-sm">{t("noPhotos")}</p>
        </div>
      </div>
    );
  }

  const current = images[active];
  const navBtn =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur hover:bg-white/25";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("open")}
        className="relative block aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted"
      >
        <Image
          src={current.url}
          alt={current.alt ?? title}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
          <FiMaximize2 /> {active + 1}/{count}
        </span>
      </button>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={t("photo", { n: i + 1 })}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition",
                i === active
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/15 p-3 text-white backdrop-blur hover:bg-white/25"
            >
              <FiX size={22} />
            </button>

            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label={t("previous")}
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className={cn(navBtn, "left-4")}
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  aria-label={t("next")}
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className={cn(navBtn, "right-4")}
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}

            <div
              className="relative h-[85vh] w-[92vw] max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.url}
                alt={current.alt ?? title}
                fill
                sizes="92vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
