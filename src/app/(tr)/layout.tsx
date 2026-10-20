import type { ReactNode } from 'react';
import { Document } from '@/components/Document';

export { viewport } from '@/components/Document';

export default function TurkishLayout({ children }: { children: ReactNode }) {
  return <Document locale="tr">{children}</Document>;
}
