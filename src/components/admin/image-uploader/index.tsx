"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  FiArrowLeft,
  FiArrowRight,
  FiStar,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";
import { useUploadThing } from "@/lib/uploadthing";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { ImageItem } from "../property-form/property-form-values";

export function ImageUploader({
  value,
  onChange,
  max = 20,
}: {
  value: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  max?: number;
}) {
  const t = useTranslations("admin.images");
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(value);
  latest.current = value; // upload callbacks always see the newest list
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const { startUpload, isUploading } = useUploadThing("propertyImages", {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: (res) => {
      setProgress(null);
      onChange([
        ...latest.current,
        ...res.map((f) => ({ url: f.ufsUrl, fileKey: f.key, alt: null })),
      ]);
    },
    onUploadError: () => {
      setProgress(null);
      notify.error(t("uploadError"));
    },
  });

  async function handleFiles(files: FileList | null) {
    const list = Array.from(files ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!list.length) return;
    const room = max - latest.current.length;
    if (room <= 0) return notify.error(t("tooMany", { max }));
    await startUpload(list.slice(0, room));
  }

  function move(from: number, to: number) {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  const tool =
    "rounded-md bg-black/70 p-1.5 text-white hover:bg-black disabled:opacity-40";

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-8 text-center transition-colors",
          dragging && "border-primary bg-muted",
        )}
      >
        <FiUploadCloud size={28} className="text-primary" />
        <p className="text-sm">
          {isUploading
            ? t("uploading", { progress: progress ?? 0 })
            : t("drop")}
        </p>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {t("browse")}
        </button>
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((img, i) => (
            <li
              key={img.fileKey}
              className="overflow-hidden rounded-lg border border-border"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {t("cover")}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={tool}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                    aria-label={t("moveLeft")}
                    title={t("moveLeft")}
                  >
                    <FiArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className={tool}
                    disabled={i === value.length - 1}
                    onClick={() => move(i, i + 1)}
                    aria-label={t("moveRight")}
                    title={t("moveRight")}
                  >
                    <FiArrowRight size={14} />
                  </button>
                  {i > 0 && (
                    <button
                      type="button"
                      className={tool}
                      onClick={() => move(i, 0)}
                      aria-label={t("makeCover")}
                      title={t("makeCover")}
                    >
                      <FiStar size={14} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="rounded-md p-1.5 text-red-600 hover:bg-muted"
                  onClick={() => onChange(value.filter((_, n) => n !== i))}
                  aria-label={t("remove")}
                  title={t("remove")}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
