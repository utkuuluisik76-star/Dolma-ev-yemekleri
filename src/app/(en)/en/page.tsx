import {buildMetadata} from '@/components/Document';
import {DolmaPage} from '@/components/DolmaPage';
export const metadata=buildMetadata('en');
export default function Page(){return <DolmaPage locale="en"/>;}
