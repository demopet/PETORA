import { useState, useCallback, useEffect } from "react";
import type { Product } from "@/types";

const HELD_TRANSACTIONS_KEY = "petora_held_transactions";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface HeldTransaction {
  id: string;
  cart: CartItem[];
  customerId?: string;
  customerName?: string;
  promotionId?: string;
  discountAmount: number;
  taxAmount: number;
  loyaltyPointsToRedeem: number;
  notes?: string;
  heldAt: string;
}

export interface POSState {
  cart: CartItem[];
  selectedCustomerId?: string;
  selectedCustomerName?: string;
  promotionId?: string;
  discountAmount: number;
  taxAmount: number;
  loyaltyPointsToRedeem: number;
  notes?: string;
}

export function usePOS() {
  const [state, setState] = useState<POSState>({
    cart: [],
    discountAmount: 0,
    taxAmount: 0,
    loyaltyPointsToRedeem: 0,
  });

  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HELD_TRANSACTIONS_KEY);
      if (stored) {
        setHeldTransactions(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const persistHeldTransactions = useCallback((transactions: HeldTransaction[]) => {
    setHeldTransactions(transactions);
    localStorage.setItem(HELD_TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, []);

  const addToCart = useCallback((product: Product) => {
    setState((prev) => {
      const existing = prev.cart.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { product, quantity: 1 }],
      };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.product.id !== productId),
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setState((prev) => ({
        ...prev,
        cart: prev.cart.filter((item) => item.product.id !== productId),
      }));
      return;
    }
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    }));
  }, []);

  const setCustomer = useCallback((customer?: { id: string; name: string }) => {
    setState((prev) => ({
      ...prev,
      selectedCustomerId: customer?.id,
      selectedCustomerName: customer?.name,
    }));
  }, []);

  const setPromotion = useCallback((promotionId?: string) => {
    setState((prev) => ({
      ...prev,
      promotionId,
    }));
  }, []);

  const setDiscount = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      discountAmount: Math.max(0, amount),
    }));
  }, []);

  const setTax = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      taxAmount: Math.max(0, amount),
    }));
  }, []);

  const setLoyaltyPointsToRedeem = useCallback((points: number) => {
    setState((prev) => ({
      ...prev,
      loyaltyPointsToRedeem: Math.max(0, points),
    }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({
      ...prev,
      notes: notes || undefined,
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState({
      cart: [],
      discountAmount: 0,
      taxAmount: 0,
      loyaltyPointsToRedeem: 0,
      notes: undefined,
    });
  }, []);

  const resetPOS = useCallback(() => {
    setState({
      cart: [],
      selectedCustomerId: undefined,
      selectedCustomerName: undefined,
      promotionId: undefined,
      discountAmount: 0,
      taxAmount: 0,
      loyaltyPointsToRedeem: 0,
      notes: undefined,
    });
  }, []);

  const subtotal = state.cart.reduce(
    (sum, item) => sum + item.product.selling_price * item.quantity,
    0,
  );

  const holdTransaction = useCallback(() => {
    if (state.cart.length === 0) return;

    const held: HeldTransaction = {
      id: crypto.randomUUID(),
      cart: [...state.cart],
      customerId: state.selectedCustomerId,
      customerName: state.selectedCustomerName,
      promotionId: state.promotionId,
      discountAmount: state.discountAmount,
      taxAmount: state.taxAmount,
      loyaltyPointsToRedeem: state.loyaltyPointsToRedeem,
      notes: state.notes,
      heldAt: new Date().toISOString(),
    };

    const updated = [...heldTransactions, held];
    persistHeldTransactions(updated);
    resetPOS();
    return held;
  }, [state, heldTransactions, persistHeldTransactions, resetPOS]);

  const resumeTransaction = useCallback((heldId: string) => {
    const held = heldTransactions.find((t) => t.id === heldId);
    if (!held) return false;

    setState({
      cart: held.cart,
      selectedCustomerId: held.customerId,
      selectedCustomerName: held.customerName,
      promotionId: held.promotionId,
      discountAmount: held.discountAmount,
      taxAmount: held.taxAmount,
      loyaltyPointsToRedeem: held.loyaltyPointsToRedeem,
      notes: held.notes,
    });

    const updated = heldTransactions.filter((t) => t.id !== heldId);
    persistHeldTransactions(updated);
    return true;
  }, [heldTransactions, persistHeldTransactions]);

  const removeHeldTransaction = useCallback((heldId: string) => {
    const updated = heldTransactions.filter((t) => t.id !== heldId);
    persistHeldTransactions(updated);
  }, [heldTransactions, persistHeldTransactions]);

  const isProductInCart = useCallback(
    (productId: string) => {
      return state.cart.some((item) => item.product.id === productId);
    },
    [state.cart],
  );

  const getCartItemQuantity = useCallback(
    (productId: string) => {
      const item = state.cart.find((item) => item.product.id === productId);
      return item?.quantity ?? 0;
    },
    [state.cart],
  );

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    state,
    cart: state.cart,
    selectedCustomerId: state.selectedCustomerId,
    selectedCustomerName: state.selectedCustomerName,
    promotionId: state.promotionId,
    discountAmount: state.discountAmount,
    taxAmount: state.taxAmount,
    loyaltyPointsToRedeem: state.loyaltyPointsToRedeem,
    notes: state.notes,
    subtotal,
    cartCount,
    heldTransactions,
    addToCart,
    removeFromCart,
    updateQuantity,
    setCustomer,
    setPromotion,
    setDiscount,
    setTax,
    setLoyaltyPointsToRedeem,
    setNotes,
    clearCart,
    resetPOS,
    holdTransaction,
    resumeTransaction,
    removeHeldTransaction,
    isProductInCart,
    getCartItemQuantity,
  };
}
