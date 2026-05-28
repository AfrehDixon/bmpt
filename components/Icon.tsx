import * as Lucide from 'lucide-react';
import type { LucideProps } from 'lucide-react';

/**
 * Renders a lucide-react icon by its string name (as stored in the CMS).
 * Falls back to a neutral dot icon if the name is unknown.
 */
export default function Icon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Cmp =
    (Lucide as unknown as Record<string, React.ComponentType<LucideProps>>)[name] ||
    Lucide.Circle;
  return <Cmp {...props} />;
}
