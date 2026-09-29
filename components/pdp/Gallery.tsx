"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Family } from "@/lib/commerce/types";

interface GalleryProps {
  family: Family;
  selectedFinish: string;
}

export function Gallery({ family, selectedFinish }: GalleryProps) {
  const finish = family.finishes.find((f) => f.name === selectedFinish) ?? family.finishes[0];
  const imageUrl = finish?.images?.[0];
  const hasRealImage = imageUrl && !imageUrl.startsWith("[");

  return (
    <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-surface">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={selectedFinish}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {hasRealImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${family.name} in ${finish?.name}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <DeviceSilhouette name={family.name} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DeviceSilhouette({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 200 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="h-[60%] w-auto"
    >
      {/* Body */}
      <rect
        x="4" y="4" width="192" height="392" rx="28"
        fill="var(--surface)" stroke="var(--line)" strokeWidth="3"
      />
      {/* Screen */}
      <rect x="14" y="24" width="172" height="352" rx="18" fill="var(--line)" />
      {/* Dynamic Island / notch placeholder */}
      <rect x="76" y="32" width="48" height="12" rx="6" fill="var(--surface)" />
      {/* Family label */}
      <text
        x="100" y="210"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fill="var(--ink-2)"
        fontFamily="system-ui, sans-serif"
      >
        {name.replace("iPhone ", "")}
      </text>
    </svg>
  );
}
