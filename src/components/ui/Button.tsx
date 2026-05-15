'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconAfter?: string;
}

const BASE =
  'font-body font-bold inline-flex items-center justify-center gap-2 select-none whitespace-nowrap border-2 border-ink-900 cursor-pointer transition-all duration-micro ease-smooth disabled:opacity-40 disabled:cursor-not-allowed';

const SIZES: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-[13px] rounded-sm',
  md: 'px-[22px] py-3 text-[15px] rounded-md',
  lg: 'px-7 py-4 text-[17px] rounded-md',
};

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-terracotta-500 text-white-warm shadow-stamp-primary ' +
    'hover:-translate-y-px hover:shadow-stamp-primary-hover ' +
    'active:translate-y-0.5 active:shadow-none active:bg-terracotta-600',

  secondary:
    'bg-paper text-ink-900 shadow-stamp ' +
    'hover:-translate-y-px hover:shadow-stamp-hover ' +
    'active:translate-y-0.5 active:shadow-none',

  success:
    'bg-sage-300 text-ink-900 shadow-stamp-success border-sage-700 ' +
    'hover:-translate-y-px hover:shadow-stamp-success-hover ' +
    'active:translate-y-0.5 active:shadow-none',

  ghost:
    'bg-transparent text-ink-900 border-transparent shadow-none ' +
    'hover:bg-ink-50 ' +
    'active:bg-ink-100',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconAfter, children, className = '', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {icon && <i className={`ph-bold ph-${icon}`} aria-hidden="true" />}
      {children}
      {iconAfter && <i className={`ph-bold ph-${iconAfter}`} aria-hidden="true" />}
    </button>
  );
});

export default Button;
