
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getProductsByCategory } from '@/lib/queries/products';
import { extractHexColors, isColorAttribute, isHandmadeProduct, isHexColor } from '@/lib/utils/attributes';
import { LoadingSpinner } from './LoadingSpinner';
import ProductCard from './ProductCard';

interface ProductDetailsProps {
    product: any;
    price: number;
    currency: string;
    images: string[];
    sizes: string[];
    attributes?: Array<{
        attribute: { name: string; slug: string; translation?: { name?: string } | null };
        values: Array<{ name: string; slug?: string; richText?: string | null; translation?: { name?: string } | null }>;
    }>;
    variants?: any[];
}

interface ParsedProductNotes {
    title: string;
    blocks: Array<
        | { type: 'paragraph'; text: string }
        | { type: 'list'; items: string[]; style: 'unordered' | 'ordered' }
    >;
}

function splitIntoBulletPoints(text: string): string[] {
    // Replace inline and leading bullets/hyphens with a special delimiter
    let normalized = text.trim().replace(/^[*•⁃-]\s*/, '|||');
    normalized = normalized.replace(/\s+[*•⁃-]\s+/g, '|||');
    normalized = normalized.replace(/\s*[*•⁃]\s*/g, '|||');
    
    // Split by the delimiter, trim each block, and filter out empty ones
    return normalized.split('|||').map(item => item.trim()).filter(Boolean);
}

function parseProductNotes(notesAttr: any, defaultTitle: string): ParsedProductNotes | null {
    if (!notesAttr || !notesAttr.values || notesAttr.values.length === 0) return null;
    
    const value = notesAttr.values[0];
    const translation = value.translation?.name;
    
    // If we have a translation, we treat it as plain text (since Saleor value translations are plain text)
    if (translation) {
        let title = defaultTitle;
        const blocks: ParsedProductNotes['blocks'] = [];
        
        const match = translation.match(/title:\s*["'«]([^"'»]+)["'»]/);
        if (match) {
            title = match[1];
            const rest = translation.replace(/title:\s*["'«][^"'»]+["'»]/, '').trim();
            if (rest) {
                const items = splitIntoBulletPoints(rest);
                if (items.length > 0) {
                    blocks.push({ type: 'list', items, style: 'unordered' });
                }
            }
        } else {
            const items = splitIntoBulletPoints(translation);
            if (items.length > 1) {
                blocks.push({ type: 'list', items, style: 'unordered' });
            } else if (translation.trim()) {
                blocks.push({ type: 'paragraph', text: translation });
            }
        }
        
        if (blocks.length === 0) return null;
        return { title, blocks };
    }
    
    let richTextJson: any = null;
    
    if (value.richText) {
        try {
            richTextJson = JSON.parse(value.richText);
        } catch (e) {
            console.error('Failed to parse Product Notes richText JSON', e);
        }
    }
    
    let title = defaultTitle;
    const blocks: ParsedProductNotes['blocks'] = [];
    
    if (richTextJson && richTextJson.blocks) {
        for (const block of richTextJson.blocks) {
            if (block.type === 'paragraph') {
                const text = block.data.text || '';
                const match = text.match(/title:\s*["'«]([^"'»]+)["'»]/);
                if (match) {
                    title = match[1];
                    const cleanedText = text.replace(/title:\s*["'«][^"'»]+["'»]/, '').replace(/<br\s*\/?>/gi, '').trim();
                    if (cleanedText) {
                        blocks.push({ type: 'paragraph', text: cleanedText });
                    }
                } else if (text.trim()) {
                    blocks.push({ type: 'paragraph', text });
                }
            } else if (block.type === 'list') {
                const items = (block.data.items || []).map((i: string) => i.trim()).filter(Boolean);
                if (items.length > 0) {
                    blocks.push({
                        type: 'list',
                        items,
                        style: block.data.style || 'unordered'
                    });
                }
            }
        }
    } else {
        const text = value.name || '';
        const match = text.match(/title:\s*["'«]([^"'»]+)["'»]/);
        if (match) {
            title = match[1];
            const rest = text.replace(/title:\s*["'«][^"'»]+["'»]/, '').trim();
            if (rest) {
                const items = splitIntoBulletPoints(rest);
                if (items.length > 0) {
                    blocks.push({ type: 'list', items, style: 'unordered' });
                }
            }
        } else {
            const items = splitIntoBulletPoints(text);
            if (items.length > 1) {
                blocks.push({ type: 'list', items, style: 'unordered' });
            } else if (text.trim()) {
                blocks.push({ type: 'paragraph', text });
            }
        }
    }
    
    if (blocks.length === 0) return null;
    return { title, blocks };
}

export default function ProductDetails({ product, price, currency, images, sizes, attributes = [], variants = [] }: ProductDetailsProps) {
    const { t, dir, language } = useLanguage();
    const router = useRouter();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart, loading: loadingCart } = useCart();
    
    const notesAttr = attributes.find(a =>
        a.attribute.name.toLowerCase() === 'product notes' ||
        a.attribute.slug === 'product-notes' ||
        a.attribute.name === 'ملاحظات المنتج'
    );
    const defaultNotesTitle = language === 'ar' ? 'ملاحظات المنتج' : 'Product Notes';
    const parsedNotes = parseProductNotes(notesAttr, defaultNotesTitle);
    const [selectedSize, setSelectedSize] = useState(sizes[0] || 'M');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

    const handleAddToCart = async () => {
        if (!selectedVariantId) {
            alert(language === 'ar' ? 'الرجاء اختيار الخيارات المطلوبة' : 'Please select options');
            return;
        }
        await addToCart(selectedVariantId, quantity);
    };

    const handleBuyNow = async () => {
        if (!selectedVariantId) {
            alert(language === 'ar' ? 'الرجاء اختيار الخيارات المطلوبة' : 'Please select options');
            return;
        }
        try {
            await addToCart(selectedVariantId, quantity);
            router.push('/checkout');
        } catch (err) {
            console.error('Buy Now failed', err);
        }
    };



    // Derive color swatches from the product's color attribute (values are hex codes from Saleor)
    const productColors = useMemo(() => extractHexColors(attributes), [attributes]);
    const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
    useEffect(() => {
        setSelectedColor(productColors[0] ?? null);
    }, [productColors]);

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

    useEffect(() => {
        const fetchData = async () => {
            const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'global-usd';
            const langCode = language === 'ar' ? 'AR' : 'EN';

            // Fetch related products if category exists
            if (product.category?.id) {
                const products = await getProductsByCategory(product.category.id, 4, channel, langCode);
                const filtered = products
                    .filter((p: any) => p.id !== product.id)
                    .slice(0, 3);
                setRelatedProducts(filtered);
            }
        };
        fetchData();
    }, [product.id, product.category?.id, language]);

    // Group variants by attributes (e.g., Size, Color)
    const variantAttributes = useMemo(() => {
        const map = new Map<string, Set<string>>();
        if (variants) {
            variants.forEach((variant: any) => {
                variant.attributes?.forEach((attr: any) => {
                    const attrName = attr.attribute.translation?.name || attr.attribute.name;
                    const attrValue = attr.values[0]?.translation?.name || attr.values[0]?.name;
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
                        const name = attr.attribute.translation?.name || attr.attribute.name;
                        const val = attr.values[0]?.translation?.name || attr.values[0]?.name;
                        if (val) {
                            initialOptions[name] = val;
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
                const name = attr.attribute.translation?.name || attr.attribute.name;
                const val = attr.values[0]?.translation?.name || attr.values[0]?.name;
                return newOptions[name] === val;
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

    // Handler for fallback size selection. The displayed label is a variant
    // attribute value (translated), so resolve it back to the matching variant.
    const handleLegacySizeChange = (sizeName: string) => {
        setSelectedSize(sizeName);
        const variant = variants?.find((v: any) => {
            const attrValues: string[] = (v.attributes || []).flatMap((a: any) =>
                (a.values || []).flatMap((val: any) => [val.translation?.name, val.name].filter(Boolean))
            );
            if (attrValues.includes(sizeName)) return true;
            return v.translation?.name === sizeName || v.name === sizeName;
        });
        if (variant) {
            setSelectedVariantId(variant.id);
            if (variant.images?.length > 0) {
                setSelectedImage(variant.images[0].url);
            }
        }
    };

    // True when variants already expose a color selector (then the fallback swatches stay hidden)
    const hasColorAttribute = Array.from(variantAttributes.keys()).some(key =>
        isColorAttribute({ name: key }) || Array.from(variantAttributes.get(key) || []).every(v => isHexColor(v))
    );

    // Translation handling
    const displayName = product.translation?.name || product.name || '';
    const displayDescription = product.translation?.description || product.description;

    // Parse EditorJS description if it's in JSON format
    const renderDescription = (desc: string | null) => {
        if (!desc) {
            return language === 'ar'
                ? 'قطعة فاخرة تجمع بين التراث الفلسطيني الأصيل والتصميم العصري. كل تفصيل يحكي قصة الأرض والإنسان، مصنوعة بحرفية عالية من مواد فاخرة مختارة بعناية.'
                : 'A luxury piece combining authentic Palestinian heritage with contemporary design. Every detail tells the story of the land and its people, crafted with exceptional skill from carefully selected premium materials.';
        }
        
        try {
            // Check if it's JSON
            if (desc.trim().startsWith('{') || desc.trim().startsWith('[')) {
                const parsed = JSON.parse(desc);
                if (parsed.blocks) {
                    return parsed.blocks.map((block: any, index: number) => {
                        if (block.type === 'paragraph') {
                            return <p key={index} className="mb-2">{block.data.text}</p>;
                        }
                        if (block.type === 'header') {
                            const Tag = `h${block.data.level || 3}` as any;
                            return <Tag key={index} className="font-bold mb-2">{block.data.text}</Tag>;
                        }
                        if (block.type === 'list') {
                            const Tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                            return (
                                <Tag key={index} className="list-inside list-disc mb-2">
                                    {block.data.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                </Tag>
                            );
                        }
                        return null;
                    });
                }
            }
        } catch (e) {
            // Fallback to plain text if not JSON
        }
        return desc;
    };

    return (
        <>
        <main className="min-h-screen pt-32 pb-20 bg-background" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">

                {/* Upper Section: Breadcrumbs */}
                <div className="flex justify-start mb-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="hover:text-accent smooth-transition">{t.product.breadcrumb.home}</Link>
                        <svg className={`w-3 h-3 text-gray-400 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <Link href="/products" className="hover:text-accent smooth-transition">{t.product.breadcrumb.store}</Link>
                        <svg className={`w-3 h-3 text-gray-400 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <span className="text-accent">{displayName}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">

                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden">
                            {/* Badges Container */}
                            <div className="absolute top-4 end-4 z-10 flex flex-col gap-2 items-end">
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

                                {/* Handmade Badge */}
                                {isHandmadeProduct(attributes) && (
                                    <div className="bg-accent text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                                        {t.product.handmade}
                                    </div>
                                )}

                                {/* Custom Product Label Attribute */}
                                {product.attributes?.map((attr: any, idx: number) => {
                                    if (attr.attribute.name === 'Product Label' || attr.attribute.name === 'Label') {
                                        return attr.values.map((val: any, vIdx: number) => (
                                            <div key={`${idx}-${vIdx}`} className="bg-[#79272C] text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider">
                                                {val.translation?.name || val.name}
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
                                alt={displayName}
                                fill
                                className="object-cover"
                                priority
                                unoptimized={process.env.NODE_ENV === 'production' || selectedImage.startsWith('http://localhost:8000') || selectedImage.includes('onrender.com')}
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
                                    <Image
                                        src={img}
                                        alt={`Thumbnail ${idx}`}
                                        fill
                                        className="object-cover"
                                        unoptimized={process.env.NODE_ENV === 'production' || img.startsWith('http://localhost:8000') || img.includes('onrender.com')}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div>
                        {/* Decorative Icon */}
                        <div className="flex justify-start mb-4">
                            <Image
                                src="/image3.png"
                                alt="Decoration"
                                width={40}
                                height={40}
                                className="opacity-60"
                            />
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 font-serif text-start">{displayName}</h1>

                        {/* Price & Actions Row */}
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                            <p className="text-2xl text-accent font-medium">
                                {language === 'ar'
                                    ? `${Math.round(distinctPrice)} ${t.common.currency}`
                                    : `$${Math.round(distinctPrice)}`}
                            </p>
                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={() => {
                                        const quantity = variants?.reduce((acc, v) => acc + (v.quantityAvailable || 0), 0) || 0;
                                        const isPreorder = variants?.some((v: any) => v.preorder?.endDate) || false;

                                        toggleWishlist({
                                            id: product.id,
                                            name: displayName,
                                            price: distinctPrice,
                                            image: images[0],
                                            rating: 5,
                                            quantityAvailable: quantity,
                                            isPreorder: isPreorder,
                                            isBestSeller: false,
                                            attributes: attributes,
                                            variants: variants
                                        });
                                    }}
                                    aria-label={language === 'ar' ? 'إضافة للمفضلة' : 'Add to wishlist'}
                                    className={`${isInWishlist(product.id) ? 'text-accent' : 'text-gray-400 hover:text-accent'} transition-colors`}
                                >
                                    <svg className="w-6 h-6" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </button>
                                <button
                                    onClick={handleShare}
                                    aria-label={language === 'ar' ? 'مشاركة' : 'Share'}
                                    className="text-gray-400 hover:text-accent transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-10 text-start">
                            <h3 className="font-bold text-gray-900 mb-3">{t.product.description}</h3>
                            <div className="text-gray-600 leading-relaxed text-sm">
                                {renderDescription(displayDescription)}
                            </div>
                        </div>

                        {/* Selectors */}
                        <div className="space-y-6 mb-10 text-start">

                            {/* Dynamic Variant Selectors */}
                            {Array.from(variantAttributes.entries()).map(([attrName, values]) => {
                                const valueList = Array.from(values);
                                // Color groups (hex values) render as swatch circles, not text buttons
                                const isSwatchGroup = valueList.length > 0 && valueList.every(v => isHexColor(v));
                                return (
                                <div key={attrName}>
                                    <h3 className="font-bold text-gray-900 mb-3">{attrName}</h3>
                                    <div className="flex justify-start gap-3 flex-wrap">
                                        {valueList.map((value) => {
                                            const isSelected = selectedOptions[attrName] === value || (!selectedOptions[attrName] && valueList[0] === value);

                                            // Handling initialization visually if state is empty
                                            // Ideally we update state, but visual feedback works too

                                            if (isSwatchGroup) {
                                                return (
                                                    <button
                                                        key={value}
                                                        onClick={() => handleOptionChange(attrName, value)}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-accent scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: value, boxShadow: '0 0 0 1px #e5e5e5' }}
                                                        aria-label={value}
                                                        title={value}
                                                    />
                                                );
                                            }

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
                                );
                            })}

                            {/* Fallback for explicit Size/Color if no variants found (Legacy/Mock support) */}
                            {variantAttributes.size === 0 && (
                                <>
                                    {/* Size */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">{t.product.size}</h3>
                                        <div className="flex justify-start gap-3">
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
                                                        {language === 'ar'
                                                            ? (size === 'S' ? 'صغير' : size === 'M' ? 'متوسط' : 'كبير')
                                                            : (size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large')}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Color — only if Saleor "Colors" attribute exists on the product */}
                                    {!hasColorAttribute && productColors.length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-3">{t.product.color}</h3>
                                            <div className="flex justify-start gap-3">
                                                {productColors.map((color) => (
                                                    <button
                                                        key={color.hex}
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor?.hex === color.hex ? 'border-accent scale-110' : 'border-transparent'}`}
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
                                <div className="flex justify-start">
                                    <div className="flex items-center border border-gray-200 rounded-sm">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 border-e border-gray-200"
                                        >-</button>
                                        <span className="px-4 py-2 text-gray-900 w-12 text-center font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 border-s border-gray-200"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 mb-12">
                            <button
                                onClick={handleAddToCart}
                                disabled={loadingCart}
                                className="w-full bg-accent text-white py-4 rounded-sm font-bold text-lg hover:bg-accent/90 smooth-transition shadow-sm flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {loadingCart ? (
                                    <>
                                        <LoadingSpinner size="sm" color="white" />
                                        <span>{language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}</span>
                                    </>
                                ) : t.product.addToCart}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={loadingCart}
                                className="w-full bg-transparent border border-accent text-accent py-4 rounded-sm font-bold text-lg hover:bg-accent hover:text-white smooth-transition flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {loadingCart ? <LoadingSpinner size="sm" color="accent" /> : t.product.buyNow}
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
                                    <div className={`pb-4 text-sm text-gray-600 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {attributes.length > 0 ? (
                                            <ul className={`list-disc ${language === 'ar' ? 'pr-5' : 'pl-5'} space-y-1`}>
                                                {attributes.filter(attr => {
                                                    if (isColorAttribute(attr.attribute)) return false;
                                                    const n = attr.attribute.name?.toLowerCase();
                                                    const s = attr.attribute.slug?.toLowerCase();
                                                    return n !== 'best seller' && s !== 'best-seller' && n !== 'الأكثر مبيعاً'
                                                        && n !== 'product label' && n !== 'label' && s !== 'product-label' && s !== 'label'
                                                        && n !== 'product notes' && s !== 'product-notes' && n !== 'ملاحظات المنتج'
                                                        && !['Care Instructions', 'Care', 'تعليمات العناية', 'العناية'].includes(attr.attribute.name);
                                                }).map(attr => ({
                                                    attr,
                                                    valueText: attr.values
                                                        .map(v => v.translation?.name || v.name)
                                                        .filter(Boolean)
                                                        .join(', ')
                                                        .trim(),
                                                })).filter(({ valueText }) => valueText.length > 0)
                                                .map(({ attr, valueText }, idx) => (
                                                    <li key={idx}>
                                                        <span className="font-semibold">{attr.attribute.translation?.name || attr.attribute.name}:</span>{' '}
                                                        {valueText}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <ul className={`list-disc ${language === 'ar' ? 'pr-5' : 'pl-5'} space-y-1`}>
                                                <li>{language === 'ar' ? 'تصميم يدوي 100%' : '100% Handmade design'}</li>
                                                <li>{language === 'ar' ? 'مواد طبيعية وصديقة للبيئة' : 'Natural and eco-friendly materials'}</li>
                                                <li>{language === 'ar' ? 'تطريز فلسطيني أصيل' : 'Authentic Palestinian embroidery'}</li>
                                                <li>{language === 'ar' ? 'ضمان الجودة مدى الحياة' : 'Lifetime quality guarantee'}</li>
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Product Notes Collapsible */}
                            {parsedNotes && (
                                <div className="border-b border-gray-200">
                                    <button
                                        onClick={() => toggleTab('notes')}
                                        className="w-full py-4 flex justify-between items-center text-gray-900 font-medium hover:text-accent transition-colors text-start"
                                    >
                                        <span>{parsedNotes.title}</span>
                                        <svg className={`w-4 h-4 transition-transform ${activeTab === 'notes' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {activeTab === 'notes' && (
                                        <div className={`pb-4 text-sm text-gray-600 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            <div className="space-y-4">
                                                {parsedNotes.blocks.map((block, idx) => {
                                                    if (block.type === 'paragraph') {
                                                        return (
                                                            <p key={idx} dangerouslySetInnerHTML={{ __html: block.text }} />
                                                        );
                                                    } else if (block.type === 'list') {
                                                        const ListTag = block.style === 'ordered' ? 'ol' : 'ul';
                                                        return (
                                                            <ListTag key={idx} className={`list-disc ${language === 'ar' ? 'pr-5' : 'pl-5'} space-y-1`}>
                                                                {block.items.map((item, itemIdx) => (
                                                                    <li key={itemIdx} dangerouslySetInnerHTML={{ __html: item }} />
                                                                ))}
                                                            </ListTag>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                            {relatedProducts.map((p) => {
                                const price = p.pricing?.priceRange?.start?.gross?.amount || 0;
                                const image = p.thumbnail?.url || p.images?.[0]?.url || 'https://placehold.co/400x500?text=No+Image';
                                const name = p.translation?.name || p.name;
                                
                                return (
                                    <ProductCard
                                        key={p.id}
                                        id={p.id}
                                        name={name}
                                        price={price}
                                        image={image}
                                        isBestSeller={false}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </main>
        </>
    );
}
