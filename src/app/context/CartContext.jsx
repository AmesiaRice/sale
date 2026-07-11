"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();
import CartToast from "@/components/cart/CartToast";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartPulse, setCartPulse] = useState(false);
  const [toast, setToast] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart-items");

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart-items", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add To Cart
  const addToCart = (product) => {
    // Jo quantity ProductDetail se select ki gayi hai, wahi use karo (default 1 agar na di ho)
    const qtyToAdd = product.quantity && product.quantity > 0 ? product.quantity : 1;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        // Pehle se cart mein hai — selected quantity existing quantity mein ADD hogi
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + qtyToAdd,
              }
            : item
        );
      }

      // Naya item — seedha selected quantity ke sath add hoga
      return [
        ...prev,
        {
          ...product,
          quantity: qtyToAdd,
        },
      ];
    });

    setToast({ id: product.id, name: product.name });
    setCartPulse(true);
  };

  // Direct quantity set karna (manual input ke liye)
const updateQuantity = (id, newQty) => {
  const qty = Math.max(1, Number(newQty) || 1);

  setCartItems((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    )
  );
};

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // End cart pulse after 2s
  useEffect(() => {
    if (!cartPulse) return;
    const t = setTimeout(() => setCartPulse(false), 2000);
    return () => clearTimeout(t);
  }, [cartPulse]);

  // Remove Item
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Increase Quantity
  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  // Decrease Quantity
  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQty,
        updateQuantity,
        decreaseQty,
        clearCart,
        toast,
        dismissToast: () => setToast(null),
        cartPulse,
      }}
    >
      {children}
      <CartToast toast={toast} onDismiss={() => setToast(null)} />
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);