import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, Product, ProductColor } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = { items: [], isOpen: false };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number; size?: string; color?: ProductColor }>) => {
      const { product, quantity = 1, size, color } = action.payload;
      const existing = state.items.find(
        (i) => i.product.id === product.id && i.selectedSize === size && i.selectedColor?.name === color?.name
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity, selectedSize: size, selectedColor: color });
      }
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; size?: string; colorName?: string }>) => {
      state.items = state.items.filter(
        (i) => !(i.product.id === action.payload.productId && i.selectedSize === action.payload.size && i.selectedColor?.name === action.payload.colorName)
      );
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number; size?: string; colorName?: string }>) => {
      const item = state.items.find(
        (i) => i.product.id === action.payload.productId && i.selectedSize === action.payload.size
      );
      if (item) item.quantity = action.payload.quantity;
    },
    clearCart: (state) => { state.items = []; },
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    setCartOpen: (state, action: PayloadAction<boolean>) => { state.isOpen = action.payload; },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartOpen = (state: { cart: CartState }) => state.cart.isOpen;
