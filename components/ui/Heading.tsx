import React from 'react';
import { cn } from '@/lib/utils';

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingVariant = 'display' | 'title' | 'subtitle' | 'item';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    is?: HeadingElement;
    variant?: HeadingVariant;
    ref?: React.Ref<HTMLHeadingElement>;
}

// The element carries the document outline; the variant carries the look.
// Serif display for the voice, Geist 500 for list items. Never uppercase.
const variantClasses: Record<HeadingVariant, string> = {
    display: 'text-display',
    title: 'text-title',
    subtitle: 'text-subtitle',
    item: 'font-sans text-xl font-medium leading-[1.35] tracking-[-0.005em]',
};

const defaultVariant: Record<HeadingElement, HeadingVariant> = {
    h1: 'display',
    h2: 'title',
    h3: 'subtitle',
    h4: 'item',
    h5: 'item',
    h6: 'item',
};

const Heading: React.FC<HeadingProps> = ({ is = 'h2', variant, ref, className, children, ...props }) => {
    const Component = is;

    return (
        <Component
            className={cn('text-foreground', variantClasses[variant ?? defaultVariant[is]], className)}
            ref={ref}
            {...props}
        >
            {children}
        </Component>
    );
};

export default Heading;
export { Heading };
