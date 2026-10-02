import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";

export function Hero() {
  return (
    <section
      className="mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10 md:gap-16"
      style={{ maxWidth: "var(--max-w-content)" }}
      aria-labelledby="hero-heading"
    >
      {/* Text side */}
      <div className="flex-1 md:max-w-[520px]">
        <h1
          id="hero-heading"
          className="text-[44px] md:text-[56px] font-semibold text-ink tracking-[-0.03em] leading-[1.05]"
        >
          Know the battery before you buy.
        </h1>
        <p className="mt-5 text-[19px] md:text-[21px] text-ink-2 leading-relaxed max-w-[440px]">
          Every iPhone from 14 to 18 Pro Max. New or pre-owned, with condition and battery health shown upfront.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/iphone">
            <Button variant="primary">Shop iPhone</Button>
          </Link>
          <Link href="/iphone-duo">
            <Button variant="secondary">Explore iPhone Duo</Button>
          </Link>
        </div>
      </div>

      {/* Hero product image */}
      <div className="w-full md:flex-1 flex items-center justify-center">
        <div className="relative w-[200px] md:w-[240px] aspect-[9/19]">
          <Image
            src="/products/iphone-18-pro-max.png"
            alt="iPhone 18 Pro Max"
            fill
            sizes="(max-width: 768px) 200px, 240px"
            className="object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
            priority
          />
        </div>
      </div>
    </section>
  );
}
