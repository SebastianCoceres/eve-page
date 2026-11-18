import { Logo } from "@/components/ui/Logo";
import { SeaField } from "@/components/ui/SeaField";
import { InstagramIcon, LinkedinIcon } from "@/components/vectors/SocialIcons";

const socials = [
    { label: "Instagram", href: "https://www.instagram.com/evelyn.digitalmkt/", Icon: InstagramIcon },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/evebogado/", Icon: LinkedinIcon },
] as const

/**
 * The artist's seal (hanko), the page's final stamp: a 42px square in the setting
 * sun's persimmon, an inset 1.25px paper-coloured border and an E and B joined by
 * their top and bottom bars, drawn as 1.5px paper-coloured strokes.
 */
const Seal = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 42 42" width="42" height="42" aria-hidden="true" focusable="false" className={className}>
        <rect width="42" height="42" fill="var(--sun-warm)" />
        <rect x="3.5" y="3.5" width="35" height="35" fill="none" stroke="var(--paper)" strokeWidth="1.25" />
        <g fill="none" stroke="var(--paper)" strokeWidth="1.5" strokeLinejoin="miter">
            <path d="M21 12.75H13V29.25H21M13 21H18.25" />
            <path d="M21 29.25V12.75H24.9a4.125 4.125 0 0 1 0 8.25H21M21 21H25.4a4.125 4.125 0 0 1 0 8.25H21" />
        </g>
    </svg>
)

// Sunset: the footer content sits above a shorter sea that stays calm on the left
// and swells toward the right. The day ends on the left at every width (east to
// west): on the content's left edge below 1280px, and from 1280px in the open
// space between the logo and the socials, where the sun's last descent comes
// down. It sinks into the calm trough with about half its disc above the crests,
// which overlap only its lower edge. The footer has no top padding: Contacto's section padding is the
// pause before the close. The 96px under the content keeps the sun's cap 48px+
// clear of the text. The seal closes the content column on the right.
export const Footer = () => {
    return (
        <footer className="relative z-10 overflow-hidden">
            <div className="container grid items-center gap-6 pb-24 md:grid-cols-3">
                <a href="#home" className="inline-flex min-h-11 w-fit items-center text-foreground">
                    <span className="sr-only">Evelyn Bogado, volver al inicio</span>
                    <span aria-hidden="true" className="block h-6 w-[150px] [&_svg]:size-full">
                        <Logo />
                    </span>
                </a>
                <ul className="flex flex-wrap gap-x-6 md:justify-center">
                    {socials.map(({ label, href, Icon }) => (
                        <li key={label}>
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link inline-flex min-h-11 items-center gap-2 text-[15px] font-medium"
                            >
                                <Icon className="size-5" />
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-muted-foreground tabular-nums md:text-right">
                    © {new Date().getFullYear()} Evelyn Bogado
                </p>
            </div>

            {/* Where the sun sets: TravelingSun ends on this anchor; under reduced
                motion it is the static sunset. Sizes and offsets match the sea
                presets in lib/seigaiha (field 120/200px, trough on the left). */}
            <SeaField kind="footer">
                <div
                    data-sun-anchor="footer"
                    className="pointer-events-none absolute bottom-[23px] left-6 size-[120px] motion-safe:invisible md:bottom-[36px] md:left-[max(40px,calc((100%-1200px)/2))] md:size-[200px] xl:left-[calc((100%-1200px)/2+222px)]"
                >
                    <div className="size-full rounded-full bg-sun-warm" />
                </div>
                <Seal className="absolute bottom-6 right-6 z-10 md:bottom-8 md:right-[max(40px,calc((100%-1200px)/2))]" />
            </SeaField>
        </footer>
    )
}

export default Footer
