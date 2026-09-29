"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { updateFamilyStatus } from "@/app/admin/api/catalog/actions";

type Status = "current" | "discontinued" | "preorder";

export function FamilyStatusForm({
  familyId,
  currentStatus,
}: {
  familyId: string;
  currentStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateFamilyStatus(familyId, status);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const options: { value: Status; label: string }[] = [
    { value: "current", label: "Current — shown in shop and lineup rail" },
    { value: "preorder", label: "Pre-order — shown with pre-order CTA" },
    { value: "discontinued", label: "Discontinued — previous-gen section only" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatus(opt.value)}
            className={[
              "rounded-[10px] border px-3 py-2 text-[13px] transition-colors duration-[120ms] text-left",
              status === opt.value
                ? "border-accent bg-accent/5 text-accent font-semibold"
                : "border-line bg-bg text-ink hover:border-ink-2",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={isPending}
          disabled={status === currentStatus}
        >
          Save status
        </Button>
        {saved && <span className="text-[13px] text-ok font-medium">Saved</span>}
      </div>
    </div>
  );
}
