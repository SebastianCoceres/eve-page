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
        'h1': 'text-4xl md:text-6xl font-bold my-4',
        'h2': 'text-3xl md:text-4xl font-semibold my-4',
        'h3': 'text-2xl md:text-3xl font-semibold my-4',
        'h4': 'text-xl md:text-2xl font-semibold my-4',
        'h5': 'text-lg md:text-xl font-semibold my-4',
        'h6': 'text-md md:text-lg font-semibold my-4',
    };

    const classes = cn(
        baseClasses[is as keyof typeof baseClasses],
        className
    );

    return <Component className={`${classes}`} ref={ref}>{children}</Component>;
};

export default Heading;
