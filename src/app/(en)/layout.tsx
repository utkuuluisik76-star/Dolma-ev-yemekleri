import type { ReactNode } from 'react';
import { Document } from '@/components/Document';

export { viewport } from '@/components/Document';

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <Document locale="en">{children}</Document>;
}
