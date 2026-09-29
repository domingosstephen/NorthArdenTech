import { BagClient } from "@/components/bag/BagClient";

export const metadata = {
  title: "Your Bag",
  description: "Review your NorthArdenTech bag and check out.",
};

export default function BagPage() {
  return (
    <main>
      <div className="mx-auto px-4 py-10 md:py-14" style={{ maxWidth: "var(--max-w-content)" }}>
        <h1 className="text-[34px] font-semibold text-ink tracking-[-0.02em] mb-8">Your bag.</h1>
        <BagClient />
      </div>
    </main>
  );
}
