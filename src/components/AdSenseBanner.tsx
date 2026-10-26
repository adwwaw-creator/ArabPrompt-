/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AdSensePlaceholder, { AdSensePlaceholderProps } from './AdSensePlaceholder';

export interface AdSenseBannerProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  showPlaceholderBadge?: boolean;
  lang?: 'ar' | 'en' | string;
  minHeight?: number | string;
  onOpenCheckout?: () => void;
}

export default function AdSenseBanner({
  client = 'ca-pub-3312377428939400',
  slot = 'auto',
  format = 'auto',
  responsive = true,
  className = '',
  showPlaceholderBadge = true,
  lang = 'ar',
  minHeight = 110,
  onOpenCheckout
}: AdSenseBannerProps) {
  return (
    <AdSensePlaceholder
      client={client}
      slot={slot}
      format={format}
      responsive={responsive}
      className={className}
      showStatusBadge={showPlaceholderBadge}
      lang={lang}
      minHeight={minHeight}
      onOpenCheckout={onOpenCheckout}
    />
  );
}
