"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import {
  approveOrder,
  purchaseLabel,
  markShipped,
  refundOrder,
  resendConfirmation,
  updateInternalNote,
} from "@/app/admin/api/orders/actions";

interface Props {
  orderId: string;
  status: string;
  riskLevel: string;
  totalCents: number;
  totalRefundedCents: number;
  hasShipment: boolean;
  internalNotes: string;
  staffRole?: string;
}

export function OrderActionPanel({
  orderId,
  status,
  riskLevel,
  totalCents,
  totalRefundedCents,
  hasShipment,
  internalNotes,
  staffRole,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [notes, setNotes] = useState(internalNotes);
  const [showRefund, setShowRefund] = useState(false);

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  function run(fn: () => Promise<void>, successMsg: string) {
    setFeedback(null);
    startTransition(async () => {
      try {
        await fn();
        setFeedback({ type: "ok", msg: successMsg });
      } catch (err) {
        setFeedback({ type: "err", msg: err instanceof Error ? err.message : "Error" });
      }
    });
  }

  const isReview = (riskLevel === "elevated" || riskLevel === "highest") && status === "pending_payment";
  const canLabel = ["paid", "fulfilled"].includes(status) && !hasShipment;
  const canShip = ["paid", "fulfilled"].includes(status);
  const canRefund = ["paid", "fulfilled", "shipped", "delivered", "partially_refunded"].includes(status);
  const maxRefundCents = totalCents - totalRefundedCents;

  return (
    <div className="rounded-[16px] border border-line bg-surface p-5 space-y-4 sticky top-8">
      <h2 className="text-[15px] font-semibold text-ink">Actions</h2>

      {/* Feedback */}
      {feedback && (
        <div className={["rounded-[10px] px-3 py-2 text-[13px]", feedback.type === "ok" ? "bg-[#F0FDF4] text-ok" : "bg-[#FFF2F2] text-[#B91C1C]"].join(" ")}>
          {feedback.msg}
        </div>
      )}

      {/* Approve review */}
      {isReview && (
        <div className="space-y-1.5">
          <p className="text-[12px] text-warn font-semibold uppercase tracking-wide">Review queue</p>
          <p className="text-[12px] text-ink-2">
            Stripe Radar flagged this order as <strong>{riskLevel}</strong> risk.
            Review the customer details before approving.
          </p>
          <Button
            variant="primary"
            className="w-full !bg-[#1E7F4E] hover:!bg-[#166540]"
            loading={isPending}
            onClick={() => run(() => approveOrder(orderId), "Order approved.")}
          >
            Approve order
          </Button>
        </div>
      )}

      {/* Buy label */}
      {canLabel && (
        <Button
          variant="secondary"
          className="w-full"
          loading={isPending}
          onClick={() => run(
            async () => {
              const result = await purchaseLabel(orderId);
              setFeedback({ type: "ok", msg: `Label bought · ${result.trackingNumber}` });
            },
            "Label purchased."
          )}
        >
          Buy shipping label
        </Button>
      )}

      {/* Mark shipped */}
      {canShip && (
        <Button
          variant="secondary"
          className="w-full"
          loading={isPending}
          onClick={() => run(() => markShipped(orderId), "Marked as shipped. Tracking email sent.")}
        >
          Mark shipped
        </Button>
      )}

      {/* Resend confirmation */}
      <Button
        variant="ghost"
        className="w-full"
        loading={isPending}
        onClick={() => run(() => resendConfirmation(orderId), "Confirmation email resent.")}
      >
        Resend confirmation
      </Button>

      {/* Refund */}
      {canRefund && (
        <div>
          {!showRefund ? (
            <button
              type="button"
              onClick={() => setShowRefund(true)}
              className="text-[13px] text-warn hover:text-[#B45309] transition-colors duration-[120ms] font-medium"
            >
              Issue refund…
            </button>
          ) : (
            <div className="space-y-2 border border-[#FDE68A] rounded-[12px] p-3 bg-[#FFFBEB]">
              <p className="text-[12px] font-semibold text-warn uppercase tracking-wide">Issue refund</p>
              <p className="text-[12px] text-ink-2">Max: {fmt(maxRefundCents)}</p>
              <input
                type="number"
                min={1}
                max={maxRefundCents}
                step={1}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Amount in cents"
                className="w-full rounded-[8px] border border-line bg-bg px-3 py-1.5 text-[13px] tabular-nums focus:outline-2 focus:outline-offset-1 focus:outline-accent"
              />
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason (required)"
                className="w-full rounded-[8px] border border-line bg-bg px-3 py-1.5 text-[13px] focus:outline-2 focus:outline-offset-1 focus:outline-accent"
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  loading={isPending}
                  disabled={!refundAmount || !refundReason}
                  onClick={() =>
                    run(
                      () => refundOrder(orderId, parseInt(refundAmount, 10), refundReason),
                      "Refund issued."
                    )
                  }
                  className="!text-warn !border-warn"
                >
                  Issue
                </Button>
                <button
                  type="button"
                  onClick={() => setShowRefund(false)}
                  className="text-[13px] text-ink-2 hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Internal notes */}
      <div className="space-y-2 pt-2 border-t border-line">
        <label className="block text-[12px] font-semibold text-ink-2 uppercase tracking-wide">
          Internal notes
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Staff-only notes — not visible to customer."
          className="w-full rounded-[8px] border border-line bg-bg px-3 py-2 text-[13px] text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-1 focus:outline-accent resize-none"
        />
        <Button
          variant="ghost"
          className="!text-[12px] !py-1"
          loading={isPending}
          disabled={notes === internalNotes}
          onClick={() => run(() => updateInternalNote(orderId, notes), "Note saved.")}
        >
          Save note
        </Button>
      </div>
    </div>
  );
}
