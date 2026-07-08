import React from 'react';
import { cn } from '@/lib/utils';

type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface _Heading extends React.HTMLAttributes<HTMLHeadingElement> {
    is?: HeadingVariant;
    ref?: React.Ref<HTMLHeadingElement>;
}

const Heading: React.FC<_Heading> = ({ is = 'h1', ref, className, children }) => {
    const Component = is;
    const baseClasses = {
        'h1': 'text-5xl md:text-7xl font-extrabold my-4',
        'h2': 'text-3xl md:text-5xl font-semibold my-4',
        'h3': 'text-xl md:text-2xl font-medium my-4',
        'h4': 'text-lg md:text-xl font-medium my-4',
        'h5': 'text-base md:text-lg font-medium my-4',
        'h6': 'text-sm md:text-base font-medium my-4',
    };

    const classes = cn(
        baseClasses[is as keyof typeof baseClasses],
        className
    );

    return <Component className={`${classes}`} ref={ref}>{children}</Component>;
};

export default Heading;
export { Heading };
