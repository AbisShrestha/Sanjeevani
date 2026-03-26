import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface CartItem {
    medicineid: number;
    name: string;
    price: number;
    imageurl?: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    totalPrice: number;
    addToCart: (item: any) => Promise<void>;
    removeFromCart: (medicineId: number) => Promise<void>;
    updateQuantity: (medicineId: number, change: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCartAuth: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartCount, setCartCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [cartKey, setCartKey] = useState<string>('cart_guest');

    // Load cart on mount
    useEffect(() => {
        refreshCartAuth();
    }, []);

    // Update derived state whenever cartItems change
    useEffect(() => {
        const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setCartCount(count);
        setTotalPrice(total);
    }, [cartItems]);

    const refreshCartAuth = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            let newCartKey = 'cart_guest';
            
            // Only use auth cart if BOTH user data and token are present (strict separation)
            if (userData && token) {
                const user = JSON.parse(userData);
                
                // PostgreSQL returns lowercase userid. Handle all variations safely to prevent 'cart_undefined' bug.
                const uniqueId = user.userid || user.userId || user.id || user._id;
                
                if (uniqueId) {
                    newCartKey = `cart_user_${uniqueId}`;
                }
            }
            
            setCartKey(newCartKey);
            await loadCart(newCartKey);
        } catch (e) {
            console.error('Failed to refresh auth state for cart', e);
        }
    };

    const loadCart = async (key: string = cartKey) => {
        try {
            const storedCart = await AsyncStorage.getItem(key);
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            } else {
                setCartItems([]);
            }
        } catch (e) {
            console.error('Failed to load cart', e);
        }
    };

    const saveCart = async (items: CartItem[], key: string = cartKey) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(items));
            setCartItems(items);
        } catch (e) {
            console.error('Failed to save cart', e);
        }
    };

    const addToCart = React.useCallback(async (item: any) => {
        setCartItems((currentItems) => {
            const existingIndex = currentItems.findIndex((i) => i.medicineid === item.medicineid);
            let newCart = [...currentItems];

            if (existingIndex > -1) {
                newCart[existingIndex].quantity += 1;
            } else {
                newCart.push({ ...item, quantity: 1 });
            }
            // Use current state via useState callback, but we need the latest cartKey.
            // Since cartKey changes infrequently, we'll let the provider closure handle it 
            // but wrap in effect if needed. It's safe here.
            AsyncStorage.setItem(cartKey, JSON.stringify(newCart)).catch(e => console.error(e));
            return newCart;
        });
    }, [cartKey]);

    const removeFromCart = React.useCallback(async (medicineId: number) => {
        setCartItems((currentItems) => {
            const newCart = currentItems.filter((item) => item.medicineid !== medicineId);
            AsyncStorage.setItem(cartKey, JSON.stringify(newCart)).catch(e => console.error(e));
            return newCart;
        });
    }, [cartKey]);

    const updateQuantity = React.useCallback(async (medicineId: number, change: number) => {
        setCartItems((currentItems) => {
            const newCart = currentItems.map((item) => {
                if (item.medicineid === medicineId) {
                    return { ...item, quantity: Math.max(1, item.quantity + change) };
                }
                return item;
            });
            AsyncStorage.setItem(cartKey, JSON.stringify(newCart)).catch(e => console.error(e));
            return newCart;
        });
    }, [cartKey]);

    const clearCart = React.useCallback(async () => {
        await AsyncStorage.removeItem(cartKey);
        setCartItems([]);
    }, [cartKey]);

    const value = React.useMemo(() => ({
        cartItems,
        cartCount,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCartAuth,
    }), [cartItems, cartCount, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart, refreshCartAuth]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
