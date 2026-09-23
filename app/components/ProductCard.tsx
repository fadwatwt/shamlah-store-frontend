'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductVariant } from '../../lib/types/saleor';
import { formatPrice, getCurrencyForChannel, AR_LATN_LOCALE } from '@/lib/utils/formatPrice';
import { copyTextToClipboard } from '@/lib/utils/copyText';
import CopyToast from './CopyToast';
import { extractHexColors, isHandmadeProduct } from '@/lib/utils/attributes';

export interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    currency?: string;
    image: string;
    rating?: number;
    isBestSeller?: boolean;
    quantityAvailable?: number;
    isPreorder?: boolean;
    attributes?: Array<{
        attribute: { name: string; slug?: string };
        values: Array<{ name: string }>;
    }>;
    variants?: ProductVariant[];
}

export default function ProductCard({
    id,
    name,
    price,
    currency,
    image,
    rating = 5,
    isBestSeller = false,
    quantityAvailable = 0,
    isPreorder = false,
    attributes = [],
    variants = [],
}: ProductCardProps) {
    const { language, t } = useLanguage();
    const router = useRouter();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);
    const [copyStatus, setCopyStatus] = useState<'ok' | 'fail' | null>(null);
    const [showSizeSelector, setShowSizeSelector] = useState(false);
    const [activeAddingVariantId, setActiveAddingVariantId] = useState<string | null>(null);
    const [successVariantId, setSuccessVariantId] = useState<string | null>(null);

    const copyTimer = useRef<number | null>(null);
    const cartSuccessTimer = useRef<number | null>(null);
    const sizeSelectorTimer = useRef<number | null>(null);
    const shareButtonRef = useRef<HTMLButtonElement>(null);
    const addingRef = useRef(false);

    useEffect(() => {
        return () => {
            if (copyTimer.current) window.clearTimeout(copyTimer.current);
            if (cartSuccessTimer.current) window.clearTimeout(cartSuccessTimer.current);
            if (sizeSelectorTimer.current) window.clearTimeout(sizeSelectorTimer.current);
        };
    }, []);

    const flashCopyResult = (ok: boolean) => {
        setCopyStatus(ok ? 'ok' : 'fail');
        if (copyTimer.current) window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopyStatus(null), 2500);
    };

    const flashCartSuccess = () => {
        setCartSuccess(true);
        if (cartSuccessTimer.current) window.clearTimeout(cartSuccessTimer.current);
        cartSuccessTimer.current = window.setTimeout(() => setCartSuccess(false), 2000);
    };

    const productColors = useMemo(() => extractHexColors(attributes).map(c => c.hex), [attributes]);

    // Check if the product has multiple configurable attributes (options)
    const hasMultipleOptions = useMemo(() => {
        if (variants && variants.length > 1) return true;
        // Check if there are size/color/style attributes with multiple values
        const ignoredNames = ['product label', 'label', 'best seller', 'الأكثر مبيعاً', 'product notes', 'ملاحظات المنتج'];
        const configurable = attributes?.filter(a => !ignoredNames.includes((a.attribute.name || '').toLowerCase()));
        return configurable.some(a => a.values && a.values.length > 1);
    }, [variants, attributes]);

    // Helper to get human-friendly variant label
    const getVariantLabel = (variant: ProductVariant, index: number): string => {
        if (variant.translation?.name && variant.translation.name.trim() !== '') {
            return variant.translation.name;
        }
        if (variant.name && variant.name.trim() !== '') {
            return variant.name;
        }
        if (variant.attributes && variant.attributes.length > 0) {
            const label = variant.attributes
                .map(a => a.values.map(v => v.translation?.name || v.name).join('/'))
                .filter(Boolean)
                .join(' - ');
            if (label.trim() !== '') return label;
        }
        if (variant.sku && variant.sku.trim() !== '') {
            return variant.sku;
        }
        return language === 'ar' ? `خيار ${index + 1}` : `Option ${index + 1}`;
    };

    // Handle the cart icon click on the card
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!variants || variants.length === 0) {
            // No variants at all — navigate to product page
            router.push(`/products/${id}`);
            return;
        }

        if (variants.length > 1) {
            // Multiple variants — toggle the quick size/option selector overlay
            setShowSizeSelector(prev => !prev);
            return;
        }

        // Single variant:
        // If product has multiple attribute options that require choice, go to detail page
        if (hasMultipleOptions) {
            router.push(`/products/${id}`);
            return;
        }

        // Direct single variant add
        if (addingRef.current) return;
        addingRef.current = true;
        setAddingToCart(true);
        try {
            await addToCart(variants[0].id, 1);
            flashCartSuccess();
        } catch (err) {
            console.error('Failed to add to cart', err);
        } finally {
            addingRef.current = false;
            setAddingToCart(false);
        }
    };

    // Handle selecting a specific variant from the overlay
    const handleSelectVariantAndAdd = async (e: React.MouseEvent, variantId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (activeAddingVariantId) return; // already adding
        setActiveAddingVariantId(variantId);
        try {
            await addToCart(variantId, 1);
            setSuccessVariantId(variantId);
            flashCartSuccess();
            if (sizeSelectorTimer.current) window.clearTimeout(sizeSelectorTimer.current);
            sizeSelectorTimer.current = window.setTimeout(() => {
                setShowSizeSelector(false);
                setSuccessVariantId(null);
            }, 800);
        } catch (err) {
            console.error('Failed to add variant to cart', err);
        } finally {
            setActiveAddingVariantId(null);
        }
    };

    return (
        <div className="group block relative">
            <div className="relative overflow-hidden bg-gray-50 rounded-lg mb-4">
                <Link href={`/products/${id}`}>
                    <Image
                        src={image}
                        alt={name}
                        width={400}
                        height={500}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="w-full h-96 object-cover smooth-transition group-hover:scale-110"
                        unoptimized={image.startsWith('http://localhost:8000') || image.includes('onrender.com') || image.includes('placehold.co')}
                    />
                </Link>

                {/* Badges — top-end */}
                <div className="absolute top-4 end-4 flex flex-col gap-2 items-end pointer-events-none">
                    {/* Sold Out Badge */}
                    {quantityAvailable <= 0 && (
                        <div className="bg-gray-800 text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                            {language === 'ar' ? 'نفد المخزون' : 'Sold Out'}
                        </div>
                    )}

                    {/* Low Stock Badge */}
                    {quantityAvailable > 0 && quantityAvailable <= 5 && (
                        <div className="bg-orange-600 text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                            {language === 'ar' ? 'كمية محدودة' : 'Low Stock'}
                        </div>
                    )}

                    {/* Pre-order Badge */}
                    {isPreorder && (
                        <div className="bg-indigo-600 text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                            {language === 'ar' ? 'طلب مسبق' : 'Pre-Order'}
                        </div>
                    )}

                    {/* Custom Product Label Attribute */}
                    {attributes && attributes.map((attr, idx) => {
                        if (attr.attribute.name === 'Product Label' || attr.attribute.name === 'Label') {
                            return attr.values.map((val, vIdx) => (
                                <div key={`${idx}-${vIdx}`} className="bg-accent text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                                    {val.name}
                                </div>
                            ));
                        }
                        return null;
                    })}

                    {/* Best Seller Fallback */}
                    {isBestSeller && (
                        <div className="bg-accent text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                            {language === 'ar' ? 'الأكثر مبيعاً' : 'Best Seller'}
                        </div>
                    )}

                    {/* Handmade Badge */}
                    {isHandmadeProduct(attributes) && (
                        <div className="bg-accent text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                            {t.product.handmade}
                        </div>
                    )}
                </div>

                {/* Action Buttons — top-start */}
                <div className="absolute top-4 start-4 flex gap-2 z-10">
                    {/* Wishlist button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist({
                                id,
                                name,
                                price,
                                image,
                                rating,
                                quantityAvailable,
                                isPreorder,
                                isBestSeller,
                                attributes,
                                variants
                            });
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center smooth-transition shadow-sm cursor-pointer bg-secondary hover:bg-[#EAE4DB]"
                        aria-label="Add to wishlist"
                    >
                        <svg className={`w-5 h-5 ${isInWishlist(id) ? 'text-accent fill-accent' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* Share button */}
                    <button
                        ref={shareButtonRef}
                        onClick={async (e) => {
                            e.preventDefault();
                            const ok = await copyTextToClipboard(`${window.location.origin}/products/${id}`);
                            flashCopyResult(ok);
                        }}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 smooth-transition shadow-sm cursor-pointer"
                        aria-label="Share"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>

                    {/* Add to Cart button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || quantityAvailable <= 0}
                        className={`w-8 h-8 rounded-full flex items-center justify-center smooth-transition shadow-sm cursor-pointer disabled:cursor-not-allowed ${
                            cartSuccess
                                ? 'bg-green-600 text-white'
                                : 'bg-white hover:bg-gray-100 text-gray-600'
                        } ${addingToCart ? 'opacity-75 cursor-not-allowed' : ''}`}
                        aria-label="Add to cart"
                    >
                        {addingToCart ? (
                            <svg className="w-4 h-4 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : cartSuccess ? (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Quick Size/Option Selector Overlay */}
                {showSizeSelector && variants.length > 1 && (
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur-md rounded-b-lg p-3 shadow-lg border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                {language === 'ar' ? 'اختر الخيار المطلوب' : 'Select Option'}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowSizeSelector(false);
                                }}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg leading-none cursor-pointer"
                                aria-label="Close selector"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                            {variants.map((variant, idx) => {
                                const isOutOfStock = (variant.quantityAvailable ?? 0) <= 0 && !variant.preorder;
                                const isAdding = activeAddingVariantId === variant.id;
                                const isSuccess = successVariantId === variant.id;
                                const label = getVariantLabel(variant, idx);

                                return (
                                    <button
                                        key={variant.id}
                                        onClick={(e) => handleSelectVariantAndAdd(e, variant.id)}
                                        disabled={isOutOfStock || !!activeAddingVariantId}
                                        className={`
                                            px-2.5 py-1.5 text-xs font-medium rounded border smooth-transition
                                            ${isOutOfStock
                                                ? 'border-gray-200 text-gray-300 line-through cursor-not-allowed bg-gray-50'
                                                : isSuccess
                                                ? 'border-green-500 bg-green-50 text-green-600 font-bold'
                                                : 'border-gray-300 text-gray-700 hover:border-accent hover:text-accent bg-white cursor-pointer'
                                            }
                                            ${isAdding ? 'opacity-70 cursor-not-allowed' : ''}
                                        `}
                                        aria-label={`Add ${label} to cart`}
                                    >
                                        {isAdding ? (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3 animate-spin inline" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>{label}</span>
                                            </span>
                                        ) : isSuccess ? (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <span>✓</span>
                                                <span>{label}</span>
                                            </span>
                                        ) : (
                                            label
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Link href={`/products/${id}`} className="block">
                <div className="p-6">
                    {/* Product Name */}
                    <h3 className="text-lg font-medium text-center mb-2 text-gray-800 group-hover:text-accent smooth-transition">
                        {name}
                    </h3>

                    {/* Price */}
                    <p className="text-xl text-center font-semibold text-accent mb-3">
                        {formatPrice(price, currency || getCurrencyForChannel(), language === 'ar' ? AR_LATN_LOCALE : 'en-US')}
                    </p>

                    {/* Colors */}
                    {productColors.length > 0 && (
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2">
                                {productColors.map((hex, idx) => (
                                    <div
                                        key={idx}
                                        className="w-5 h-5 rounded-full border border-gray-200"
                                        style={{ backgroundColor: hex }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Link>
            <CopyToast status={copyStatus} language={language} targetRef={shareButtonRef} />
        </div>
    );
}
