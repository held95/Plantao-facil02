'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';

/**
 * Logo Component
 *
 * Reusable logo component with multiple variants and fallback handling.
 * If logo file is missing, falls back to text + icon.
 */

export type LogoVariant = 'main' | 'white' | 'small';

export interface LogoProps {
  /** Logo variant to display */
  variant?: LogoVariant;
  /** Custom size (height in pixels) - overrides default */
  size?: number;
  /** Whether to wrap logo in a Link to home page */
  linkToHome?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const LOGO_PATHS: Record<LogoVariant, string> = {
  main: '/logos/logo-main.svg',
  white: '/logos/logo-white.svg',
  small: '/logos/logo-small.svg',
};

const LOGO_FALLBACK_PATHS: Record<LogoVariant, string> = {
  main: '/logos/logo-main.png',
  white: '/logos/logo-white.png',
  small: '/logos/logo-small.png',
};

const DEFAULT_SIZES: Record<LogoVariant, number> = {
  main: 40,
  white: 40,
  small: 32,
};

export function Logo({
  variant = 'main',
  size,
  linkToHome = true,
  className = '',
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [useFallbackPng, setUseFallbackPng] = useState(false);

  const logoHeight = size || DEFAULT_SIZES[variant];
  const logoPath = useFallbackPng
    ? LOGO_FALLBACK_PATHS[variant]
    : LOGO_PATHS[variant];

  const handleImageError = () => {
    if (!useFallbackPng) {
      // Try PNG fallback first
      setUseFallbackPng(true);
    } else {
      // If PNG also fails, show text fallback
      setImageError(true);
    }
  };

  // Fallback: Text logo with icon
  const TextFallback = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg">
        <Calendar className="h-6 w-6 text-white" />
      </div>
      <div>
        <span className="text-lg font-bold text-gray-900 block leading-tight">
          Gestão de Plantões
        </span>
        <span className="text-xs text-gray-500">ProTime</span>
      </div>
    </div>
  );

  // Image logo
  const ImageLogo = () => (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoPath}
        alt="Plantão Fácil - ProTime"
        height={logoHeight * 3} // 3x for high DPI displays (120px actual, renders at 40px)
        width={logoHeight * 3} // Square aspect ratio (1:1) for ProTime logo
        onError={handleImageError}
        priority
        style={{ height: logoHeight, width: logoHeight, objectFit: 'contain' }}
      />
    </div>
  );

  const LogoContent = imageError ? <TextFallback /> : <ImageLogo />;

  if (linkToHome) {
    return (
      <Link href="/" className="inline-block">
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
}

/**
 * Simplified logo component for emails
 * Uses absolute URL and PNG format for better email client compatibility
 */
export interface EmailLogoProps {
  /** Base URL of the application */
  baseUrl: string;
  /** Height in pixels */
  height?: number;
}

export function EmailLogo({ baseUrl, height = 40 }: EmailLogoProps) {
  const logoUrl = `${baseUrl}/logos/logo-email.png`;

  return (
    <img
      src={logoUrl}
      alt="Plantão Fácil"
      style={{
        height: `${height}px`,
        width: 'auto',
        display: 'block',
      }}
    />
  );
}
