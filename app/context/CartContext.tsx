'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createCheckout, addLinesToCheckout, getCheckout, updateCheckoutLines, deleteCheckoutLines } from '@/lib/queries/cart';

interface CartContextType {
    checkoutId: string | null;
    checkoutToken: string | null;
    items: any[];
    loading: boolean;
    addToCart: (variantId: string, quantity: number) => Promise<void>;
    updateLineQuantity: (lineId: string, quantity: number) => Promise<void>;
    removeFromCart: (lineId: string) => Promise<void>;
    cartCount: number;
    subtotal: { amount: number; currency: string } | null;
    shippingPrice: { amount: number; currency: string } | null;
    totalPrice: { amount: number; currency: string } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
    const [checkoutId, setCheckoutId] = useState<string | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subtotal, setSubtotal] = useState<{ amount: number; currency: string } | null>(null);
    const [shippingPrice, setShippingPrice] = useState<{ amount: number; currency: string } | null>(null);
    const [totalPrice, setTotalPrice] = useState<{ amount: number; currency: string } | null>(null);

    // Initialize cart from local storage
    useEffect(() => {
        const storedToken = localStorage.getItem('checkoutToken');
        if (storedToken) {
            setCheckoutToken(storedToken);
            fetchCheckout(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCheckout = async (token: string) => {
        setLoading(true);
        try {
            const data = await getCheckout(token);
            if (data.checkout) {
                setCheckoutId(data.checkout.id);
                setItems(data.checkout.lines);
                setSubtotal(data.checkout.subtotalPrice?.gross || data.checkout.totalPrice?.gross);
                setShippingPrice(data.checkout.shippingPrice?.gross || null);
                setTotalPrice(data.checkout.totalPrice?.gross);
            } else {
                // Token invalid or checkout expired
                localStorage.removeItem('checkoutToken');
                setCheckoutToken(null);
                setItems([]);
            }
        } catch (error) {
            console.error('Failed to fetch checkout:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (variantId: string, quantity: number) => {
        setLoading(true);
        try {
            const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
            let currentToken = checkoutToken;

            // If no checkout exists, create one
            if (!currentToken) {
                const data = await createCheckout([{ variantId, quantity }], channel);
                if (data.checkoutCreate?.checkout) {
                    currentToken = data.checkoutCreate.checkout.token;
                    if (currentToken) {
                        localStorage.setItem('checkoutToken', currentToken);
                        setCheckoutToken(currentToken);
                        setCheckoutId(data.checkoutCreate.checkout.id);
                        setItems(data.checkoutCreate.checkout.lines);
                        setSubtotal(data.checkoutCreate.checkout.subtotalPrice?.gross || data.checkoutCreate.checkout.totalPrice?.gross);
                        setShippingPrice(data.checkoutCreate.checkout.shippingPrice?.gross || null);
                        setTotalPrice(data.checkoutCreate.checkout.totalPrice?.gross);
                    }
                } else if (data.checkoutCreate?.errors && data.checkoutCreate.errors.length > 0) {
                    console.error('Error creating checkout:', data.checkoutCreate.errors);
                    throw new Error(data.checkoutCreate.errors[0].message);
                }
            } else {
                // Add lines to existing checkout
                const data = await addLinesToCheckout(currentToken, [{ variantId, quantity }]);
                if (data.checkoutLinesAdd?.checkout) {
                    setItems(data.checkoutLinesAdd.checkout.lines);
                    setSubtotal(data.checkoutLinesAdd.checkout.subtotalPrice?.gross || data.checkoutLinesAdd.checkout.totalPrice?.gross);
                    setShippingPrice(data.checkoutLinesAdd.checkout.shippingPrice?.gross || null);
                    setTotalPrice(data.checkoutLinesAdd.checkout.totalPrice?.gross);
                } else if (data.checkoutLinesAdd?.errors && data.checkoutLinesAdd.errors.length > 0) {
                    console.error('Error adding lines:', data.checkoutLinesAdd.errors);
                    throw new Error(data.checkoutLinesAdd.errors[0].message);
                }
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add to cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateLineQuantity = async (lineId: string, quantity: number) => {
        if (!checkoutToken) return;
        setLoading(true);
        try {
            const data = await updateCheckoutLines(checkoutToken, [{ lineId, quantity }]);
            if (data.checkoutLinesUpdate?.checkout) {
                setItems(data.checkoutLinesUpdate.checkout.lines);
                setSubtotal(data.checkoutLinesUpdate.checkout.subtotalPrice?.gross || data.checkoutLinesUpdate.checkout.totalPrice?.gross);
                setShippingPrice(data.checkoutLinesUpdate.checkout.shippingPrice?.gross || null);
                setTotalPrice(data.checkoutLinesUpdate.checkout.totalPrice?.gross);
            } else if (data.checkoutLinesUpdate?.errors && data.checkoutLinesUpdate.errors.length > 0) {
                console.error('Error updating line:', data.checkoutLinesUpdate.errors);
            }
        } catch (error) {
            console.error('Failed to update cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (lineId: string) => {
        if (!checkoutToken) return;
        setLoading(true);
        try {
            const data = await deleteCheckoutLines(checkoutToken, [lineId]);
            if (data.checkoutLinesDelete?.checkout) {
                setItems(data.checkoutLinesDelete.checkout.lines);
                setSubtotal(data.checkoutLinesDelete.checkout.subtotalPrice?.gross || data.checkoutLinesDelete.checkout.totalPrice?.gross);
                setShippingPrice(data.checkoutLinesDelete.checkout.shippingPrice?.gross || null);
                setTotalPrice(data.checkoutLinesDelete.checkout.totalPrice?.gross);
            } else if (data.checkoutLinesDelete?.errors && data.checkoutLinesDelete.errors.length > 0) {
                console.error('Error removing line:', data.checkoutLinesDelete.errors);
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            checkoutId,
            checkoutToken,
            items,
            loading,
            addToCart,
            updateLineQuantity,
            removeFromCart,
            cartCount,
            subtotal,
            shippingPrice,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
