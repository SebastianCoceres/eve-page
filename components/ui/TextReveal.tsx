'use client'
import SplitText from "@/components/ui/SplitText";

// The page's two text reveals, as presets of the React Bits SplitText
// (components/ui/SplitText), in the one motion grammar (expo.out / power3.out,
// 0.6–1.1s, once, on enter). Reduced motion: SplitText bails out and shows the text.
// The server markup is the readable text; nothing is hidden without JavaScript.

interface RevealProps {
    text: string;
    className?: string;
}

/** A section heading: its lines rise out of a mask, 80ms apart. */
export const RevealTitle = ({ text, className = "", tag = "h2" }: RevealProps & { tag?: "h2" | "h3" }) => (
    <SplitText
        tag={tag}
        text={text}
        className={`w-full text-title text-foreground ${className}`}
        splitType="lines"
        mask
        from={{ yPercent: 125 }}
        to={{ yPercent: 0 }}
        ease="expo.out"
        duration={1}
        delay={80}
        threshold={0.12}
        rootMargin="0px"
    />
);

/** A lead paragraph: its lines fade in, 80ms apart. */
export const RevealLead = ({ text, className = "" }: RevealProps) => (
    <SplitText
        tag="p"
        text={text}
        className={`text-lead text-foreground ${className}`}
        splitType="lines"
        effect="fade"
        ease="power3.out"
        duration={0.9}
        delay={80}
        threshold={0.15}
        rootMargin="0px"
    />
);
