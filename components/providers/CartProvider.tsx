"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { CartItem, Condition } from "@/lib/commerce/types";

// Minimal CartItem shape used client-side — does not import the adapter.
// Cart mutations will become Server Actions when Shopify adapter is wired (step 9).

export interface ClientCartItem {
  variantId: string;
  familySlug: string;
  familyName: string;
  finish: string;
  storage: string;
  condition: Condition;
  price: number;
  quantity: number;
  batteryFloor?: string;
  image?: string;
}

interface CartContextValue {
  items: ClientCartItem[];
  itemCount: number;
  addItem: (item: Omit<ClientCartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateItem: (variantId: string, quantity: number) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Fires whenever itemCount increases — used by bag icon bump animation */
  lastAddedAt: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ClientCartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedAt, setLastAddedAt] = useState(0);

  const addItem = useCallback(
    (newItem: Omit<ClientCartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.variantId === newItem.variantId);
        if (existing) {
          return prev.map((i) =>
            i.variantId === newItem.variantId
              ? { ...i, quantity: i.quantity + (newItem.quantity ?? 1) }
              : i
          );
        }
        return [...prev, { ...newItem, quantity: newItem.quantity ?? 1 }];
      });
      setLastAddedAt(Date.now());
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateItem = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        removeItem,
        updateItem,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        lastAddedAt,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// Re-export CartItem type alias for convenience
export type { CartItem };
