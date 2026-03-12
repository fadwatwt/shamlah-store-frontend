
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

interface ProductDetailsProps {
    product: any;
    price: number;
    currency: string;
    images: string[];
    sizes: string[];
    attributes?: Array<{
        attribute: { name: string; slug: string };
        values: Array<{ name: string }>;
    }>;
    variants?: any[];
}

export default function ProductDetails({ product, price, currency, images, sizes, attributes = [], variants = [] }: ProductDetailsProps) {
    const { t, dir, language } = useLanguage();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart, loading: loadingCart } = useCart();
    const [selectedSize, setSelectedSize] = useState(sizes[0] || 'M');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(images[0]);

    // Mock colors - usually this would come from product variants
    const colors = [
        { name: 'Beige', hex: '#ECE5D3' },
        { name: 'Black', hex: '#1A1A1A' },
        { name: 'Red', hex: '#79272C' },
    ];
    const [selectedColor, setSelectedColor] = useState(colors[2]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out ${product.name} on SHMLH`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
        }
    };

    const toggleTab = (tab: string) => {
        setActiveTab(activeTab === tab ? null : tab);
    };

    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

    // Group variants by attributes (e.g., Size, Color)
    const variantAttributes = useMemo(() => {
        const map = new Map<string, Set<string>>();
        if (variants) {
            variants.forEach((variant: any) => {
                variant.attributes?.forEach((attr: any) => {
                    const attrName = attr.attribute.name;
                    const attrValue = attr.values[0]?.name;
                    if (attrName && attrValue) {
                        if (!map.has(attrName)) {
                            map.set(attrName, new Set());
                        }
                        map.get(attrName)?.add(attrValue);
                    }
                });
            });
        }
        return map;
    }, [variants]);

    // State for selected attribute options
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    // Initialize selection on mount
    useEffect(() => {
        if (variants && variants.length > 0) {
            // If specific variant not selected, select the first one
            if (!selectedVariantId) {
                const defaultVariant = variants[0];
                setSelectedVariantId(defaultVariant.id);

                // Initialize options for dynamic UI
                if (variantAttributes.size > 0 && Object.keys(selectedOptions).length === 0) {
                    const initialOptions: Record<string, string> = {};
                    // Try to match default variant's options
                    defaultVariant.attributes?.forEach((attr: any) => {
                        if (attr.values[0]?.name) {
                            initialOptions[attr.attribute.name] = attr.values[0].name;
                        }
                    });
                    // Fill gaps if any
                    variantAttributes.forEach((values, name) => {
                        if (!initialOptions[name]) {
                            initialOptions[name] = Array.from(values)[0];
                        }
                    });
                    setSelectedOptions(initialOptions);
                }
            }
        }
    }, [variants, selectedVariantId, variantAttributes, selectedOptions]);

    // Find the variant that matches selected options
    const selectedVariant = product.variants?.find((variant: any) => {
        if (selectedVariantId) return variant.id === selectedVariantId;

        // Fallback to logic if ID not set (though useEffect should catch it)
        if (!variant.attributes || Object.keys(selectedOptions).length === 0) return false;
        return variant.attributes.every((attr: any) => {
            const attrName = attr.attribute.name;
            const attrValue = attr.values[0]?.name;
            return selectedOptions[attrName] === attrValue;
        });
    }) || product.variants?.find((v: any) => v.id === selectedVariantId) || product.variants?.[0];

    // Update displayed price based on selected variant
    const distinctPrice = selectedVariant?.pricing?.price?.gross?.amount || price;


    const handleOptionChange = (attributeName: string, value: string) => {
        const newOptions = { ...selectedOptions, [attributeName]: value };
        setSelectedOptions(newOptions);

        // Find variant matching these new options to update image if needed
        const newlySelectedVariant = product.variants?.find((variant: any) => {
            return variant.attributes?.every((attr: any) => {
                return newOptions[attr.attribute.name] === attr.values[0]?.name;
            });
        });

        if (newlySelectedVariant) {
            setSelectedVariantId(newlySelectedVariant.id);
            // Optionally update image if variant has specific image
            if (newlySelectedVariant.images?.length > 0) {
                setSelectedImage(newlySelectedVariant.images[0].url);
            }
        }
    };

    // Handler for fallback size selection
    const handleLegacySizeChange = (sizeName: string) => {
        setSelectedSize(sizeName);
        // Try to find variant with this name
        const variant = variants?.find((v: any) => v.name === sizeName);
        if (variant) {
            setSelectedVariantId(variant.id);
            if (variant.images?.length > 0) {
                setSelectedImage(variant.images[0].url);
            }
        }
    };

    // Mock colors - if no variant colors, keep mock
    const hasColorAttribute = variantAttributes.has('Color') || variantAttributes.has('اللون');

    // ... (rest of component)

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">

                {/* Upper Section: Breadcrumbs & Navigation */}
                <div className="flex justify-end mb-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="hover:text-accent smooth-transition">{t.product.breadcrumb.home}</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-accent smooth-transition">{t.product.breadcrumb.store}</Link>
                        <span>/</span>
                        <span className="text-gray-900">{product.name}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">

                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden">
                            {/* New Tag */}
                            {/* Badges Container */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                                {/* Sold Out Badge */}
                                {selectedVariant?.quantityAvailable !== undefined && selectedVariant.quantityAvailable <= 0 && (
                                    <div className="bg-gray-800 text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                                        {language === 'ar' ? 'نفد المخزون' : 'Sold Out'}
                                    </div>
                                )}

                                {/* Low Stock Badge */}
                                {selectedVariant?.quantityAvailable !== undefined && selectedVariant.quantityAvailable > 0 && selectedVariant.quantityAvailable <= 5 && (
                                    <div className="bg-orange-600 text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                                        {language === 'ar' ? 'كمية محدودة' : 'Low Stock'}
                                    </div>
                                )}

                                {/* Pre-order Badge */}
                                {selectedVariant?.preorder?.endDate && (
                                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                                        {language === 'ar' ? 'طلب مسبق' : 'Pre-Order'}
                                    </div>
                                )}

                                {/* Custom Product Label Attribute */}
                                {product.attributes?.map((attr: any, idx: number) => {
                                    if (attr.attribute.name === 'Product Label' || attr.attribute.name === 'Label') {
                                        return attr.values.map((val: any, vIdx: number) => (
                                            <div key={`${idx}-${vIdx}`} className="bg-[#79272C] text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                                                {val.name}
                                            </div>
                                        ));
                                    }
                                    return null;
                                })}

                                {/* New Tag (Fallback or explicit attribute) */}
                                {/* Keeping existing hardcoded New tag if no custom label overrides or always show? 
                                    Let's keep it but maybe conditional?
                                    The user asked for consistency. 
                                    If "Product Label" attribute handles "New", we shouldn't hardcode it. 
                                    But let's keep it safe: removed hardcoded "New" in favor of attribute Logic? 
                                    The user said: "Attributes... New... values: (جديد...)"
                                    So if we have the attribute logic, we don't need the hardcoded one.
                                    However, to matching exact current behavior + new badges, I will remove the hardcoded static "New" since it wasn't dynamic.
                                */}
                            </div>

                            <Image
                                src={selectedImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative w-24 h-24 flex-shrink-0 border-2 rounded-md overflow-hidden transition-all ${selectedImage === img ? 'border-accent' : 'border-transparent'}`}
                                >
                                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div>
                        {/* Decorative Icon */}
                        <div className="flex justify-end mb-4">
                            <Image
                                src="/image3.png"
                                alt="Decoration"
                                width={40}
                                height={40}
                                className="opacity-60"
                            />
                        </div>

                        {/* Title & Price */}
                        <div className="text-right mb-8">
                            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 font-serif">{product.name}</h1>
                            <p className="text-2xl text-accent font-medium" dir="ltr">
                                {currency} {Math.round(distinctPrice)}
                            </p>
                        </div>

                        {/* Actions: Share & Wishlist */}
                        <div className="flex gap-4 mb-8">
                            <button onClick={handleShare} className="text-gray-400 hover:text-accent transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </button>
                            <button
                                onClick={() => {
                                    const quantity = variants?.reduce((acc, v) => acc + (v.quantityAvailable || 0), 0) || 0;
                                    const isPreorder = variants?.some((v: any) => v.preorder?.endDate) || false;

                                    toggleWishlist({
                                        id: product.id,
                                        name: product.name,
                                        price: distinctPrice,
                                        image: images[0],
                                        rating: 5,
                                        quantityAvailable: quantity,
                                        isPreorder: isPreorder,
                                        isBestSeller: false, // Or pass if available
                                        attributes: attributes,
                                        variants: variants
                                    });
                                }}
                                className={`${isInWishlist(product.id) ? 'text-accent fill-accent' : 'text-gray-400 hover:text-accent'} transition-colors`}
                            >
                                <svg className="w-6 h-6" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mb-10 text-right">
                            <h3 className="font-bold text-gray-900 mb-3">{t.product.description}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {product.description || "قطعة فاخرة تجمع بين التراث الفلسطيني الأصيل والتصميم العصري. كل تفصيل في هذه القطعة يحكي قصة الأرض والإنسان، مصنوعة بحرفية عالية من مواد فاخرة مختارة بعناية."}
                            </p>
                        </div>

                        {/* Selectors */}
                        <div className="space-y-6 mb-10 text-right">

                            {/* Dynamic Variant Selectors */}
                            {Array.from(variantAttributes.entries()).map(([attrName, values]) => (
                                <div key={attrName}>
                                    <h3 className="font-bold text-gray-900 mb-3">{attrName}</h3>
                                    <div className="flex justify-end gap-3 flex-wrap">
                                        {Array.from(values).map((value) => {
                                            const isSelected = selectedOptions[attrName] === value || (!selectedOptions[attrName] && Array.from(values)[0] === value);

                                            // Handling initialization visually if state is empty
                                            // Ideally we update state, but visual feedback works too

                                            return (
                                                <button
                                                    key={value}
                                                    onClick={() => handleOptionChange(attrName, value)}
                                                    className={`px-6 py-2 border rounded-sm text-sm transition-all ${isSelected
                                                        ? 'border-accent text-accent bg-red-50/10'
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Fallback for explicit Size/Color if no variants found (Legacy/Mock support) */}
                            {variantAttributes.size === 0 && (
                                <>
                                    {/* Size */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">{t.product.size}</h3>
                                        <div className="flex justify-end gap-3">
                                            {sizes.length > 0 ? sizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => handleLegacySizeChange(size)}
                                                    className={`px-6 py-2 border rounded-sm text-sm transition-all ${selectedSize === size ? 'border-accent text-accent' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                                >
                                                    {size}
                                                </button>
                                            )) : (
                                                ['S', 'M', 'L'].map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => handleLegacySizeChange(size)}
                                                        className={`px-6 py-2 border rounded-sm text-sm transition-all ${selectedSize === size ? 'border-accent text-accent' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                                    >
                                                        {size === 'S' ? 'صغير' : size === 'M' ? 'متوسط' : 'كبير'}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Color */}
                                    {!hasColorAttribute && (
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-3">{t.product.color}</h3>
                                            <div className="flex justify-end gap-3">
                                                {colors.map((color) => (
                                                    <button
                                                        key={color.name}
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor.name === color.name ? 'border-accent scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color.hex, boxShadow: '0 0 0 1px #e5e5e5' }}
                                                        aria-label={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Quantity */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">{t.product.quantity}</h3>
                                <div className="flex justify-end">
                                    <div className="flex items-center border border-gray-200 rounded-sm">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 border-l border-gray-200"
                                        >-</button>
                                        <span className="px-4 py-2 text-gray-900 w-12 text-center font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 border-r border-gray-200"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 mb-12">
                            <button
                                onClick={async () => {
                                    if (!selectedVariantId) {
                                        alert(language === 'ar' ? 'الرجاء اختيار الخيارات المطلوبة' : 'Please select options');
                                        return;
                                    }
                                    await addToCart(selectedVariantId, quantity);
                                    alert(language === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart');
                                }}
                                className="w-full bg-accent text-white py-4 rounded-sm font-bold text-lg hover:bg-accent/90 smooth-transition shadow-sm"
                            >
                                {loadingCart ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') : t.product.addToCart}
                            </button>
                            <button className="w-full bg-transparent border border-accent text-accent py-4 rounded-sm font-bold text-lg hover:bg-accent hover:text-white smooth-transition">
                                {t.product.buyNow}
                            </button>
                        </div>

                        {/* Collapsibles */}
                        <div className="border-t border-gray-200">
                            {/* Features */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleTab('features')}
                                    className="w-full py-4 flex justify-between items-center text-gray-900 font-medium hover:text-accent transition-colors"
                                >
                                    <span>{t.product.features}</span>
                                    <svg className={`w-4 h-4 transition-transform ${activeTab === 'features' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {activeTab === 'features' && (
                                    <div className="pb-4 text-sm text-gray-600 leading-relaxed text-right">
                                        {attributes.length > 0 ? (
                                            <ul className="list-disc pr-5 space-y-1">
                                                {attributes.map((attr, idx) => (
                                                    <li key={idx}>
                                                        <span className="font-semibold">{attr.attribute.name}:</span>{' '}
                                                        {attr.values.map(v => v.name).join(', ')}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <ul className="list-disc pr-5 space-y-1">
                                                <li>تصميم يدوي 100%</li>
                                                <li>مواد طبيعية وصديقة للبيئة</li>
                                                <li>تطريز فلسطيني أصيل</li>
                                                <li>ضمان الجودة مدى الحياة</li>
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Care Instructions */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleTab('care')}
                                    className="w-full py-4 flex justify-between items-center text-gray-900 font-medium hover:text-accent transition-colors"
                                >
                                    <span>{t.product.careInstructions}</span>
                                    <svg className={`w-4 h-4 transition-transform ${activeTab === 'care' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {activeTab === 'care' && (
                                    <div className="pb-4 text-sm text-gray-600 leading-relaxed text-right">
                                        يُنصح بالتنظيف الجاف فقط للحفاظ على جودة التطريز والألوان. تجنب التعرض المباشر لأشعة الشمس لفترات طويلة.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Related Products Divider */}
                <div className="flex flex-col items-center justify-center mb-16">
                    <Image
                        src="/image.png"
                        alt="Decoration"
                        width={24}
                        height={24}
                        className="opacity-40 mb-4"
                    />
                    <h2 className="text-3xl font-serif text-accent mb-2">{t.product.youMightLike}</h2>
                </div>

                {/* Related Products Grid (Mock Data for Visuals) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[1, 2, 3].map((i) => (
                        <ProductCard
                            key={i}
                            id={`related-${i}`}
                            name={i === 1 ? 'Burgundy Patterns Bag' : i === 2 ? 'Memory Luxury Bag' : 'Olive Classic Bag'}
                            price={i === 1 ? 1100 : i === 2 ? 1450 : 950}
                            image={i === 1 ? 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=400' :
                                i === 2 ? 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400' :
                                    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400'}
                            isBestSeller={i === 2}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
