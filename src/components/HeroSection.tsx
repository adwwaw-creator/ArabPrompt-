/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppLanguage } from '../types';
import AdSenseBanner from './AdSenseBanner';

interface HeroSectionProps {
  lang: AppLanguage;
  onGetStarted?: () => void;
  onOpenVisualLibrary?: () => void;
}

export default function HeroSection({ lang }: HeroSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-2">
      <AdSenseBanner
        client="ca-pub-3312377428939400"
        lang={lang}
        format="auto"
        responsive={true}
        showPlaceholderBadge={true}
        className="shadow-xs max-w-4xl mx-auto"
      />
    </section>
  );
}
