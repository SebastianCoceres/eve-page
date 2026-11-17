'use client';
import React from 'react'

import { cn } from "@/lib/utils"

interface NavbarContextType {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    panelId: string;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const NavbarContext = React.createContext<NavbarContextType | undefined>(undefined);

const useNavbarContext = () => {
    const context = React.useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbarContext must be used within a Navbar');
    }
    return context;
};

type NavbarProps = React.HTMLAttributes<HTMLElement>

/**
 * Navigation shell with a mobile panel. Owns the open state, locks page scroll
 * while the panel is open, closes on Escape and returns focus to the trigger.
 */
const Navbar: React.FC<NavbarProps> = ({ className, children, ...props }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const wasOpen = React.useRef(false);
    const panelId = React.useId();

    const open = React.useCallback(() => setIsOpen(true), []);
    const close = React.useCallback(() => setIsOpen(false), []);

    React.useEffect(() => {
        if (!isOpen) {
            if (wasOpen.current) triggerRef.current?.focus();
            wasOpen.current = false;
            return;
        }
        wasOpen.current = true;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    return (
        <NavbarContext.Provider value={{ isOpen, open, close, panelId, triggerRef }}>
            <nav className={cn("relative flex items-center", className)} {...props}>
                {children}
            </nav>
        </NavbarContext.Provider>
    )
}

type NavbarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const NavbarTrigger: React.FC<NavbarTriggerProps> = ({ className, children, ...props }) => {
    const { isOpen, open, panelId, triggerRef } = useNavbarContext();
    return (
        <button
            ref={triggerRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-haspopup="dialog"
            className={className}
            {...props}
            onClick={open}
        >
            {children}
        </button>
    )
}

type NavbarCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const NavbarClose: React.FC<NavbarCloseProps> = ({ className, children, ...props }) => {
    const { close } = useNavbarContext();
    return (
        <button type="button" className={className} {...props} onClick={close}>
            {children}
        </button>
    )
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface NavbarPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
}

/** Full-screen mobile panel: modal dialog with a focus trap. Rendered only while open. */
const NavbarPanel: React.FC<NavbarPanelProps> = ({ className, children, label, ...props }) => {
    const { isOpen, panelId } = useNavbarContext();
    const panelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!isOpen) return;
        const panel = panelRef.current;
        if (!panel) return;

        const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
        focusables()[0]?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;
            const items = focusables();
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        panel.addEventListener('keydown', onKeyDown);
        return () => panel.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={cn("fixed inset-0 z-50", className)}
            {...props}
        >
            {children}
        </div>
    )
}

type NavigationListProps = React.HTMLAttributes<HTMLUListElement>

const NavigationList: React.FC<NavigationListProps> = ({ className, children, ...props }) => (
    <ul className={cn("flex", className)} {...props}>
        {children}
    </ul>
)

interface NavigationItemProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string;
    isActive?: boolean;
    itemClassName?: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
    className,
    itemClassName,
    children,
    href,
    isActive = false,
    ...props
}) => (
    <li className={itemClassName}>
        <a
            href={href}
            aria-current={isActive ? "location" : undefined}
            className={className}
            {...props}
        >
            {children}
        </a>
    </li>
)

Navbar.displayName = "Navbar"
NavbarTrigger.displayName = "NavbarTrigger"
NavbarClose.displayName = "NavbarClose"
NavbarPanel.displayName = "NavbarPanel"
NavigationList.displayName = "NavigationList"
NavigationItem.displayName = "NavigationItem"

export {
    Navbar,
    NavbarTrigger,
    NavbarClose,
    NavbarPanel,
    NavigationList,
    NavigationItem,
    useNavbarContext,
}
