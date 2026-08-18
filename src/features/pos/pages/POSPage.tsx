import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Search, Trash2, Plus, Minus, Clock, X, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectOption } from "@/components/ui/select";
import { usePOS, type CartItem } from "../hooks/use-pos";
import { useCustomers, useCreateCustomer } from "@/features/customers/hooks/use-customers";
import { usePromotions } from "@/features/promotions/hooks/use-promotions";
import { useAuth } from "@/features/auth/context/AuthContext";
import { createInvoice } from "@/features/invoices/services/invoice.service";
import { toast } from "sonner";
import type { Product } from "@/types";
import { z } from "zod";

export default function POSPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [isHoldListOpen, setIsHoldListOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [quickCustomerName, setQuickCustomerName] = useState("");
  const [quickCustomerPhone, setQuickCustomerPhone] = useState("");
  const [quickCustomerEmail, setQuickCustomerEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoId, setAppliedPromoId] = useState<string | undefined>();
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const {
    state,
    cart,
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
    setNotes,
    resetPOS,
    holdTransaction,
    resumeTransaction,
    removeHeldTransaction,
  } = usePOS();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .is("deleted_at", null)
        .eq("status", "ACTIVE");

      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: customers } = useCustomers();
  const { data: promotions } = usePromotions();
  const queryClient = useQueryClient();

  const createCustomerMutation = useCreateCustomer({
    callerUserId: user?.id,
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      if (cart.length === 0) throw new Error("Cart is empty");

      const items = cart.map((item: CartItem) => ({
        item_type: "PRODUCT",
        product_id: item.product.id,
        description: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.selling_price,
      }));

      return createInvoice(
        {
          invoice_type: "POS",
          customer_id: state.selectedCustomerId,
          items,
          discount_amount: state.discountAmount,
          tax_amount: state.taxAmount,
          promotion_id: appliedPromoId,
          loyalty_points_to_redeem: state.loyaltyPointsToRedeem,
          notes: state.notes,
        },
        user.id
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Invoice created successfully");
      resetPOS();
      setAppliedPromoId(undefined);
      setPromoCode("");
      setPointsToRedeem(0);
      setIsCheckoutOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredProducts = products?.filter(
    (product) =>
      product.status === "ACTIVE" &&
      product.deleted_at === null &&
      (product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const outOfStockProducts = filteredProducts?.filter((p) => p.stock_quantity === 0) || [];
  const lowStockProducts =
    filteredProducts?.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity <= (p.stock_minimum || 5)
    ) || [];
  const availableProducts =
    filteredProducts?.filter((p) => p.stock_quantity > (p.stock_minimum || 5)) || [];

  const appliedPromotion = promotions?.find((p) => p.id === appliedPromoId);

  const handleApplyPromo = () => {
    const promo = promotions?.find((p) => p.code === promoCode && p.status === "ACTIVE");
    if (!promo) {
      toast.error("Invalid or expired promotion code");
      return;
    }
    if (subtotal < promo.min_purchase) {
      toast.error(`Minimum purchase of Rp ${promo.min_purchase.toLocaleString()} required`);
      return;
    }
    setAppliedPromoId(promo.id);
    setPromotion(promo.id);
    toast.success(`Promotion "${promo.name}" applied`);
  };

  const handleQuickCreateCustomer = () => {
    try {
      const input = z
        .object({
          name: z.string().min(1),
          phone: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
        })
        .parse({
          name: quickCustomerName,
          phone: quickCustomerPhone || undefined,
          email: quickCustomerEmail || undefined,
        });

      createCustomerMutation.mutate(input, {
        onSuccess: (customer) => {
          setCustomer(customer);
          setIsQuickCustomerOpen(false);
          setQuickCustomerName("");
          setQuickCustomerPhone("");
          setQuickCustomerEmail("");
          toast.success("Customer created successfully");
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0]?.message || "Invalid input");
      }
    }
  };

  const handleCheckout = () => {
    if (!user?.id) {
      toast.error("Not authenticated");
      return;
    }
    checkoutMutation.mutate();
  };

  const handleHold = () => {
    holdTransaction();
    toast.success("Transaction held");
    setIsHoldListOpen(true);
  };

  const handleResume = (heldId: string) => {
    resumeTransaction(heldId);
    setIsHoldListOpen(false);
    toast.success("Transaction resumed");
  };

  const handleRemoveHeld = (heldId: string) => {
    removeHeldTransaction(heldId);
    toast.success("Held transaction removed");
  };

  useEffect(() => {
    if (!appliedPromoId && state.promotionId) {
      setAppliedPromoId(state.promotionId);
    }
  }, [state.promotionId, appliedPromoId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Point of Sale</h1>
        <p className="mt-1 text-sm text-slate-500">Process customer transactions</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsHoldListOpen(true)}
              title="Held Transactions"
            >
              <Clock className="h-4 w-4" />
            </Button>
            {cartCount > 0 && (
              <Button variant="outline" onClick={handleHold} title="Hold Transaction">
                <Clock className="h-4 w-4 mr-2" />
                Hold
              </Button>
            )}
          </div>

          {outOfStockProducts.length > 0 && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
              <h3 className="text-sm font-medium text-danger-800">Out of Stock</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                {outOfStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-md border border-danger-200 bg-white p-3 opacity-60"
                  >
                    <div className="font-medium text-slate-900">{product.name}</div>
                    <div className="text-xs text-danger-600">Out of Stock</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
              <h3 className="text-sm font-medium text-warning-800">Low Stock</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-md border border-warning-200 bg-white p-3"
                  >
                    <div className="font-medium text-slate-900">{product.name}</div>
                    <div className="text-xs text-warning-600">
                      Stock: {product.stock_quantity} (min: {product.stock_minimum})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {availableProducts.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);
              const cartQty = inCart?.quantity || 0;
              const remaining = product.stock_quantity - cartQty;

              return (
                <button
                  key={product.id}
                  onClick={() => {
                    if (remaining > 0) {
                      addToCart(product);
                    }
                  }}
                  disabled={remaining <= 0}
                  className={`rounded-lg border bg-white p-4 text-left shadow-sm transition-colors ${
                    remaining <= 0
                      ? "border-slate-200 opacity-50 cursor-not-allowed"
                      : "border-slate-200 hover:border-primary-300 hover:shadow-md"
                  }`}
                >
                  <div className="font-medium text-slate-900">{product.name}</div>
                  <div className="mt-1 text-sm text-slate-500">SKU: {product.sku}</div>
                  <div className="mt-2 font-semibold text-primary-600">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(product.selling_price)}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Stock: {product.stock_quantity}
                    {cartQty > 0 && ` (in cart: ${cartQty}, remaining: ${remaining})`}
                  </div>
                  {inCart && (
                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(product.id, cartQty - 1);
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{cartQty}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (remaining > 0) {
                            updateQuantity(product.id, cartQty + 1);
                          }
                        }}
                        disabled={remaining <= 0}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
          </h2>

          <div className="mt-4 space-y-3">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">Cart is empty</div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{item.product.name}</div>
                    <div className="text-sm text-slate-500">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(item.product.selling_price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-danger-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="customer-select"
                  className="text-sm font-medium text-slate-700 block"
                >
                  Customer
                </label>
                <select
                  id="customer-select"
                  value={state.selectedCustomerId || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "__quick_create__") {
                      setIsQuickCustomerOpen(true);
                      return;
                    }
                    const customer = customers?.find((c) => c.id === value);
                    setCustomer(customer);
                  }}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Walk-in Customer</option>
                  {customers?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.is_guest ? "(Guest)" : ""}
                    </option>
                  ))}
                  <option value="__quick_create__">+ Quick Create</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="promo-code" className="text-sm font-medium text-slate-700">
                  Promotion
                </label>
                <div className="flex gap-2">
                  <Input
                    id="promo-code"
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyPromo} disabled={!promoCode}>
                    <Tag className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                </div>
                {appliedPromotion && (
                  <div className="flex items-center justify-between rounded-md bg-primary-50 p-2 text-sm">
                    <span className="text-primary-700">
                      {appliedPromotion.name} (-
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(
                        appliedPromotion.promotion_type === "PERCENTAGE"
                          ? subtotal * (appliedPromotion.discount_value / 100)
                          : appliedPromotion.discount_value
                      )}
                      )
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAppliedPromoId(undefined);
                        setPromotion(undefined);
                        setPromoCode("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="discount-amount" className="text-sm font-medium text-slate-700">
                  Discount Amount
                </label>
                <Input
                  id="discount-amount"
                  type="number"
                  placeholder="0"
                  value={state.discountAmount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tax-amount" className="text-sm font-medium text-slate-700">
                  Tax Amount
                </label>
                <Input
                  id="tax-amount"
                  type="number"
                  placeholder="0"
                  value={state.taxAmount || ""}
                  onChange={(e) => setTax(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-slate-700">
                  Notes
                </label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Optional notes"
                  value={state.notes || ""}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-lg font-semibold text-slate-900">Subtotal</span>
                <span className="text-lg font-bold text-slate-900">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(subtotal)}
                </span>
              </div>

              {state.discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-danger-600">
                    -
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(state.discountAmount)}
                  </span>
                </div>
              )}

              {appliedPromotion && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Promotion</span>
                  <span className="text-primary-600">
                    -
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      appliedPromotion.promotion_type === "PERCENTAGE"
                        ? subtotal * (appliedPromotion.discount_value / 100)
                        : appliedPromotion.discount_value
                    )}
                  </span>
                </div>
              )}

              {state.taxAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(state.taxAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-lg font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-primary-600">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(
                    Math.max(
                      0,
                      subtotal -
                        state.discountAmount -
                        (appliedPromotion
                          ? appliedPromotion.promotion_type === "PERCENTAGE"
                            ? subtotal * (appliedPromotion.discount_value / 100)
                            : appliedPromotion.discount_value
                          : 0) +
                        state.taxAmount
                    )
                  )}
                </span>
              </div>

              <Button className="w-full" size="lg" onClick={() => setIsCheckoutOpen(true)}>
                Checkout
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-slate-50 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(subtotal)}
                </span>
              </div>
              {state.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-danger-600">
                    -
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(state.discountAmount)}
                  </span>
                </div>
              )}
              {appliedPromotion && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Promotion</span>
                  <span className="text-primary-600">
                    -
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      appliedPromotion.promotion_type === "PERCENTAGE"
                        ? subtotal * (appliedPromotion.discount_value / 100)
                        : appliedPromotion.discount_value
                    )}
                  </span>
                </div>
              )}
              {state.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(state.taxAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary-600 text-lg">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(
                    Math.max(
                      0,
                      subtotal -
                        state.discountAmount -
                        (appliedPromotion
                          ? appliedPromotion.promotion_type === "PERCENTAGE"
                            ? subtotal * (appliedPromotion.discount_value / 100)
                            : appliedPromotion.discount_value
                          : 0) +
                        state.taxAmount
                    )
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="payment-method" className="text-sm font-medium text-slate-700">
                Payment Method
              </label>
              <Select id="payment-method" value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectOption value="CASH">Cash</SelectOption>
                <SelectOption value="QRIS">QRIS</SelectOption>
                <SelectOption value="TRANSFER">Transfer</SelectOption>
                <SelectOption value="E_WALLET">E-Wallet</SelectOption>
                <SelectOption value="CREDIT_CARD">Credit Card</SelectOption>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="amount-received" className="text-sm font-medium text-slate-700">
                Amount Received
              </label>
              <Input
                id="amount-received"
                type="number"
                placeholder="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="loyalty-points" className="text-sm font-medium text-slate-700">
                Loyalty Points to Redeem
              </label>
              <Input
                id="loyalty-points"
                type="number"
                placeholder="0"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                min="0"
              />
            </div>

            <div className="flex items-center justify-between rounded-md bg-primary-50 p-3 text-sm">
              <span className="text-primary-700">Customer</span>
              <span className="font-medium text-primary-900">
                {state.selectedCustomerName || "Walk-in"}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || cart.length === 0}
            >
              {checkoutMutation.isPending ? "Processing..." : "Complete Checkout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuickCustomerOpen} onOpenChange={setIsQuickCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Create Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label="Name" required id="quick-customer-name">
              <Input
                value={quickCustomerName}
                onChange={(e) => setQuickCustomerName(e.target.value)}
                placeholder="Customer name"
              />
            </FormField>
            <FormField label="Phone" id="quick-customer-phone">
              <Input
                value={quickCustomerPhone}
                onChange={(e) => setQuickCustomerPhone(e.target.value)}
                placeholder="Phone number"
              />
            </FormField>
            <FormField label="Email" id="quick-customer-email">
              <Input
                value={quickCustomerEmail}
                onChange={(e) => setQuickCustomerEmail(e.target.value)}
                placeholder="Email address"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuickCustomerOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleQuickCreateCustomer}
              disabled={createCustomerMutation.isPending || !quickCustomerName}
            >
              {createCustomerMutation.isPending ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHoldListOpen} onOpenChange={setIsHoldListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Held Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {heldTransactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No held transactions</div>
            ) : (
              heldTransactions.map((held) => (
                <div
                  key={held.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 p-4"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{held.cart.length} items</div>
                    <div className="text-sm text-slate-500">
                      {held.customerName || "Walk-in"} |{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(
                        held.cart.reduce(
                          (sum, item) => sum + item.product.selling_price * item.quantity,
                          0
                        )
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Held at: {new Date(held.heldAt).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleResume(held.id)}>
                      Resume
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveHeld(held.id)}>
                      <Trash2 className="h-4 w-4 text-danger-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHoldListOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
