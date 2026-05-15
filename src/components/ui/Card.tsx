import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  stamp?: boolean;
}

export default function Card({ stamp = false, children, className = '', style, ...props }: CardProps) {
  return (
    <div
      className={`bg-paper border-2 border-ink-900 rounded-lg p-6 ${stamp ? 'shadow-stamp' : 'shadow-vb-md'} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
