import { commerce } from "@/lib/commerce";
import { HeaderClient } from "./HeaderClient";

// Async RSC — fetches families once per request, passes to client shell.
export async function Header() {
  const families = await commerce.getFamilies();

  const currentFamilies = families.filter(
    (f) => f.status === "current" || f.status === "preorder"
  );
  const prevFamilies = families.filter((f) => f.status === "discontinued");

  return (
    <HeaderClient
      currentFamilies={currentFamilies}
      prevFamilies={prevFamilies}
    />
  );
}
