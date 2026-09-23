'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { useCategoriesContext } from '../context/CategoriesContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import SearchModal from './SearchModal';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Record<string, boolean>>({});
  const { language, t, dir } = useLanguage();
  const categories = useCategoriesContext();
  const { items: wishlistItems } = useWishlist();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMobileCategory = (href: string) => {
    setExpandedMobileCategories(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  // Map Saleor categories to nav structure
  const navLinks = categories.map(category => {
    // Try API translation, then local translation fallback, then raw name
    const localNav = t.nav as any;
    const fallbackName = localNav[category.name.toLowerCase()] ||
      localNav[category.slug.toLowerCase()] ||
      (category.name.toLowerCase() === 'clothing' ? t.nav.clothes : null);

    const categoryName = category.translation?.name || fallbackName || category.name;

    const children = category.children?.edges?.map(edge => {
      const childName = edge.node.translation?.name ||
        localNav[edge.node.name.toLowerCase()] ||
        localNav[edge.node.slug.toLowerCase()] ||
        edge.node.name;

      return {
        href: `/category/${edge.node.slug}`,
        label: childName,
      };
    }) || [];

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
    <>
      <header
        translate="no"
        className={`fixed top-8 left-0 right-0 z-50 px-4 md:px-8 lg:px-16 smooth-transition notranslate ${
          isScrolled ? 'bg-background shadow-md' : 'bg-background/90 backdrop-blur-sm'
        }`}
        dir={dir}
      >
        <div className="container mx-auto px-2 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-700 hover:text-accent transition-colors"
              aria-label="Open mobile menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="relative w-28 md:w-32 h-9 md:h-10">
              <Image
                src="/logo.png"
                alt="SHMLH"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group/dropdown">
                <Link
                  href={link.href}
                  className="text-base font-semibold smooth-transition hover:text-accent relative group text-gray-800 flex items-center gap-1"
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
          <div className="flex items-center gap-4 md:gap-8">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t.header.searchTitle}
              className="p-1 smooth-transition hover:text-accent text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </button>

            <Link
              href="/cart"
              className="p-1 smooth-transition hover:text-accent relative text-gray-700"
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
              className="p-1 smooth-transition hover:text-accent text-gray-700 relative"
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
              className="p-1 smooth-transition hover:text-accent text-gray-700"
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

        {/* Search Modal */}
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" dir={dir}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div
            className={`fixed inset-y-0 ${
              dir === 'rtl' ? 'right-0' : 'left-0'
            } w-[85vw] max-w-[340px] bg-white shadow-2xl flex flex-col z-[101] animate-in slide-in-from-${
              dir === 'rtl' ? 'right' : 'left'
            } duration-300`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#FAF9F6]">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="relative w-28 h-8 block"
              >
                <Image
                  src="/logo.png"
                  alt="SHMLH"
                  fill
                  className="object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-accent rounded-full hover:bg-white transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4 px-4 divide-y divide-gray-100">
              <div className="space-y-1 pb-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-md text-base font-semibold text-gray-800 hover:bg-gray-50 hover:text-accent transition-colors"
                >
                  <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
                </Link>

                {navLinks.map((link) => {
                  const hasChildren = link.children && link.children.length > 0;
                  const isExpanded = !!expandedMobileCategories[link.href];

                  return (
                    <div key={link.href} className="rounded-md overflow-hidden">
                      <div className="flex items-center justify-between">
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 px-3 py-3 text-base font-semibold text-gray-800 hover:text-accent transition-colors"
                        >
                          {link.label}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => toggleMobileCategory(link.href)}
                            className="p-3 text-gray-400 hover:text-accent transition-colors"
                            aria-label={`Toggle ${link.label}`}
                          >
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-accent' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Subcategories Accordion */}
                      {hasChildren && isExpanded && (
                        <div className="bg-gray-50/70 rounded-md py-1 my-1 ps-4 pe-2 space-y-1">
                          {link.children?.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-2 px-3 text-sm text-gray-600 hover:text-accent transition-colors rounded-sm hover:bg-white"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Account & Quick Links */}
              <div className="pt-4 space-y-1">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-accent transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>{t.home.viewAll}</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-accent transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{t.header.account}</span>
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-accent transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>{t.profile.orders}</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-accent transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{t.footer.links_label.contact}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
