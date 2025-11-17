export const dynamic = 'force-dynamic';
import ExplorerClient from './ui/ExplorerClient';
import type { ComponentType } from 'react';

// @ts-ignore - ExplorerClient is a runtime React component but its inferred type is () => void
const ExplorerClientComponent = ExplorerClient as unknown as ComponentType<any>;

export default function Page() {
  return <ExplorerClientComponent />;
}
