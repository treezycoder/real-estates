"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { useUploadThing } from "@/lib/uploadthing";

type Photo = { url: string; fileKey: string } | null;

export function AvatarUploader({
  value,
  onChange,
}: {
  value: Photo;
  onChange: (p: Photo) => void;
}) {
  const t = useTranslations("admin.agentForm");
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("agentPhoto", {
    onClientUploadComplete: (res) => {
      const f = res[0];
      if (f) onChange({ url: f.ufsUrl, fileKey: f.key });
    },
    onUploadError: () => {
      notify.error(t("uploadError"));
    },
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
        {value ? (
          <Image
            src={value.url}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <FiUser size={28} />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? t("uploading") : t("choosePhoto")}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => onChange(null)}
          >
            {t("removePhoto")}
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) startUpload([file]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
