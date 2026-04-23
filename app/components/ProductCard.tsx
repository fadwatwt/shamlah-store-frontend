'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductVariant } from '../../lib/types/saleor';

export interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    rating?: number;
    isBestSeller?: boolean;
    quantityAvailable?: number;
    isPreorder?: boolean;
    attributes?: Array<{
        attribute: { name: string };
        values: Array<{ name: string }>;
    }>;
    variants?: ProductVariant[];
}

export default function ProductCard({
    id,
    name,
    price,
    image,
    rating = 5,
    isBestSeller = false,
    quantityAvailable = 0,
    isPreorder = false,
    attributes = [],
    variants = [],
    colors = ['#1a1a1a', '#2f3e46', '#79272C'] // Default mock colors matching the image style
}: ProductCardProps & { colors?: string[] }) {
    const { language, t } = useLanguage();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    const [addingToCart, setAddingToCart] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // precise variant identification logic as used in ProductDetails
        let variantIdToUse: string | undefined;

        if (variants && variants.length > 0) {
            variantIdToUse = variants[0].id;
        }

        if (variantIdToUse) {
            setAddingToCart(true);
            try {
                await addToCart(variantIdToUse, 1);
                alert(language === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart');
            } catch (err) {
                console.error('Failed to add to cart', err);
            } finally {
                setAddingToCart(false);
            }
        } else {
            // Fallback: Redirect to product page if no variant found (shouldn't happen with valid data)
            window.location.href = `/products/${id}`;
        }
    };

    return (
        <div className="group block">
            <div className="relative overflow-hidden bg-gray-50 rounded-lg mb-4">
                <Link href={`/products/${id}`}>
                    <Image
                        src={image}
                        alt={name}
                        width={400}
                        height={500}
                        className="w-full h-96 object-cover smooth-transition group-hover:scale-110"
                        unoptimized={image.startsWith('http://localhost:8000') || image.includes('onrender.com')}
                    />
                </Link>
                <div className="absolute top-4 end-4 flex flex-col gap-2 items-end">
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
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 start-4 flex gap-2 z-10">
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center smooth-transition shadow-sm ${isInWishlist(id) ? 'bg-accent/10' : 'bg-white hover:bg-gray-100'}`}
                        aria-label="Add to wishlist"
                    >
                        <svg className={`w-5 h-5 ${isInWishlist(id) ? 'text-accent fill-accent' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            if (navigator.share) {
                                try {
                                    await navigator.share({
                                        title: name,
                                        text: `Check out ${name} on SHMLH`,
                                        url: `${window.location.origin}/products/${id}`,
                                    });
                                } catch (error) {
                                    console.error('Error sharing:', error);
                                }
                            } else {
                                // Fallback: Copy to clipboard
                                navigator.clipboard.writeText(`${window.location.origin}/products/${id}`);
                                alert(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard');
                            }
                        }}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 smooth-transition shadow-sm"
                        aria-label="Share"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                    {/* Add to Cart Button on Card */}
                    <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || quantityAvailable <= 0}
                        className={`w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 smooth-transition shadow-sm ${addingToCart ? 'opacity-75 cursor-not-allowed' : ''}`}
                        aria-label="Add to cart"
                    >
                        {addingToCart ? (
                            <svg className="w-4 h-4 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <Link href={`/products/${id}`} className="block">
                <div className="p-6">
                    {/* <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-accent fill-accent' : 'text-gray-300'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            ))}
                        </div>
                    </div> */}

                    {/* Product Name */}
                    <h3 className="text-lg font-medium text-center  mb-2 text-gray-800 group-hover:text-accent smooth-transition">
                        {name}
                    </h3>

                    {/* Price */}
                    <p className="text-xl text-center font-semibold text-accent mb-3">
                        {Math.round(price)} {t.common.currency}
                    </p>

                    {/* Colors */}
                    <div className='flex justify-center'>
                        {colors && colors.length > 0 && (
                            <div className="flex items-center gap-2">
                                {colors.map((color, idx) => (
                                    <div
                                        key={idx}
                                        className="w-5 h-5 rounded-full border border-gray-200"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
