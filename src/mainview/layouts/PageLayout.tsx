import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`h-screen flex flex-col bg-gray-900 text-gray-100 ${className}`}>
      {children}
    </div>
  );
}
