import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAwayMode } from './AwayModeContext';

// Cart item interface
export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  sizeLabel?: string;
  type?: string;
  typeLabel?: string;
  image?: string;
  boxId?: number;
}

// Cart context interface
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number, size?: string, type?: string) => void;
  updateQuantity: (id: string | number, quantity: number, size?: string, type?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

// Create the context
const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartTotal: 0,
  itemCount: 0
});

interface CartProviderProps {
  children: ReactNode;
}

// Provider component
export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { areOrdersDisabled } = useAwayMode();
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart data from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (item: CartItem) => {
    // Check if orders are disabled due to Away Mode
    if (areOrdersDisabled) {
      toast({
        title: 'Orders Temporarily Disabled',
        description: 'Sorry, new orders are currently disabled while we are away.',
        variant: 'destructive'
      });
      return;
    }
    
    setCartItems(prevItems => {
      // Check if item already exists with same ID, size and type
      const existingItemIndex = prevItems.findIndex(
        cartItem => 
          cartItem.id === item.id && 
          cartItem.size === item.size && 
          cartItem.type === item.type
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        
        toast({
          title: 'Cart updated',
          description: `${item.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        });
        
        return updatedItems;
      } else {
        // Add new item
        toast({
          title: 'Added to cart',
          description: `${item.name} added to your cart`,
        });
        
        return [...prevItems, item];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id: string | number, size?: string, type?: string) => {
    setCartItems(prevItems => {
      const itemIndex = prevItems.findIndex(
        item => 
          item.id === id && 
          item.size === size && 
          item.type === type
      );
      
      if (itemIndex !== -1) {
        const item = prevItems[itemIndex];
        const updatedItems = [...prevItems];
        updatedItems.splice(itemIndex, 1);
        
        toast({
          title: 'Removed from cart',
          description: `${item.name} removed from your cart`,
        });
        
        return updatedItems;
      }
      
      return prevItems;
    });
  };
  
  // Update item quantity
  const updateQuantity = (id: string | number, quantity: number, size?: string, type?: string) => {
    // If increasing quantity and orders are disabled, block the action
    if (areOrdersDisabled) {
      const currentItem = cartItems.find(
        item => item.id === id && item.size === size && item.type === type
      );
      
      if (currentItem && quantity > currentItem.quantity) {
        toast({
          title: 'Orders Temporarily Disabled',
          description: 'Sorry, increasing quantities is currently disabled while we are away.',
          variant: 'destructive'
        });
        return;
      }
    }
    
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (
          item.id === id && 
          item.size === size && 
          item.type === type
        ) {
          return { ...item, quantity };
        }
        return item;
      });
      
      return updatedItems;
    });
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );
  
  // Calculate item count
  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity, 
    0
  );
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);