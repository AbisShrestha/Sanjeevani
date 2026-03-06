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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartCount, setCartCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    // Load cart on mount
    useEffect(() => {
        loadCart();
    }, []);

    // Update derived state whenever cartItems change
    useEffect(() => {
        const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setCartCount(count);
        setTotalPrice(total);
    }, [cartItems]);

    const loadCart = async () => {
        try {
            const storedCart = await AsyncStorage.getItem('cart');
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        } catch (e) {
            console.error('Failed to load cart', e);
        }
    };

    const saveCart = async (items: CartItem[]) => {
        try {
            await AsyncStorage.setItem('cart', JSON.stringify(items));
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
            AsyncStorage.setItem('cart', JSON.stringify(newCart)).catch(e => console.error(e));
            return newCart;
        });
    }, []);

    const removeFromCart = React.useCallback(async (medicineId: number) => {
        setCartItems((currentItems) => {
            const newCart = currentItems.filter((item) => item.medicineid !== medicineId);
            AsyncStorage.setItem('cart', JSON.stringify(newCart)).catch(e => console.error(e));
            return newCart;
        });
    }, []);

    const updateQuantity = React.useCallback(async (medicineId: number, change: number) => {
        setCartItems((currentItems) => {
            const newCart = currentItems.map((item) => {
                if (item.medicineid === medicineId) {
                    return { ...item, quantity: Math.max(1, item.quantity + change) };
                }
                return item;
            });
            AsyncStorage.setItem('cart', JSON.stringify(newCart)).catch(e => console.error(e));
            return newCart;
        });
    }, []);

    const clearCart = React.useCallback(async () => {
        await AsyncStorage.removeItem('cart');
        setCartItems([]);
    }, []);

    const value = React.useMemo(() => ({
        cartItems,
        cartCount,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    }), [cartItems, cartCount, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart]);

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
