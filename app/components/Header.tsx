'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { useCategories } from '../hooks/useCategories';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, t, dir } = useLanguage();
  const { categories, loading } = useCategories(language === 'ar' ? 'AR' : 'EN');
  const { items: wishlistItems } = useWishlist();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Map Saleor categories to nav structure
  const navLinks = categories.map(category => {
    const categoryName = category.translation?.name || category.name;
    const children = category.children?.edges?.map(edge => ({
      href: `/category/${edge.node.slug}`,
      label: edge.node.translation?.name || edge.node.name,
    })) || [];

    // Add "View All" as first item if there are children
    if (children.length > 0) {
      children.unshift({
        href: `/category/${category.slug}`,
        label: language === 'ar' ? `عرض جميع ${categoryName}` : `View All ${categoryName}`,
      });
    }

    return {
      href: `/category/${category.slug}`,
      label: categoryName,
      children: children.length > 0 ? children : undefined,
    };
  });

  // Add static links (Collections, Our Story)
  navLinks.push(
    { href: '/collections', label: t.nav.collections, children: undefined },
    { href: '/story', label: t.nav.story, children: undefined }
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 smooth-transition ${isScrolled ? 'bg-background shadow-md' : 'bg-background/90 backdrop-blur-sm'
        }`}
      dir={dir}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative w-32 h-10">
          <Image
            src="/logo.png"
            alt="SHMLH"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.href} className="relative group/dropdown">
              <Link
                href={link.href}
                className="text-base font-medium smooth-transition hover:text-accent relative group text-gray-800 flex items-center gap-1"
              >
                {link.label}
                {link.children && (
                  <svg className="w-4 h-4 transition-transform group-hover/dropdown:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent smooth-transition group-hover:w-full"></span>
              </Link>

              {/* Dropdown Menu */}
              {link.children && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-50">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-lg py-2 min-w-[200px] overflow-hidden">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-6">
          <Link
            href="/cart"
            className="smooth-transition hover:text-accent relative text-gray-700"
            aria-label={t.header.cart}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/wishlist"
            className="smooth-transition hover:text-accent text-gray-700 relative"
            aria-label={t.header.favorites}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link
            href="/profile"
            className="smooth-transition hover:text-accent text-gray-700"
            aria-label={t.header.account}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header >
  );
}
