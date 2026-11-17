import { Logo } from "@/components/ui/Logo";
import { SeaField } from "@/components/ui/SeaField";
import { InstagramIcon, LinkedinIcon } from "@/components/vectors/SocialIcons";

const socials = [
    { label: "Instagram", href: "https://www.instagram.com/evelyn.digitalmkt/", Icon: InstagramIcon },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/evebogado/", Icon: LinkedinIcon },
] as const

// Sunset: the footer content sits above a shorter sea whose swell is mirrored
// (highest on the left), and the day ends there: from 768px up the sun sets on the
// left, into the swell, aligned with the content column; on phones, on the right.
// The footer has no top padding: Contacto's section padding is the pause before the
// close, and the footer content and the sea read as one block. The 96px under the
// content keeps the setting sun's visible cap 48px+ clear of the text.
export const Footer = () => {
    return (
        <footer className="relative z-10 overflow-hidden">
            <div className="container grid items-center gap-6 pb-24 md:grid-cols-3">
                <a href="#home" className="inline-flex min-h-11 w-fit items-center text-foreground">
                    <span className="sr-only">Evelyn Bogado, volver al inicio</span>
                    <span aria-hidden="true" className="block h-6 w-[154px] [&_svg]:size-full">
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
                                className="inline-flex min-h-11 items-center gap-2 text-[15px] text-foreground underline decoration-1 decoration-transparent underline-offset-[3px] transition-colors duration-150 ease-out hover:decoration-current motion-reduce:transition-none"
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
                motion it is the static sunset. */}
            <SeaField kind="footer" className="[--sun-d:140px] [--sun-sink:0.75] md:[--sun-d:200px] md:[--sun-sink:0.85] xl:[--sun-d:220px]">
                <div
                    data-sun-anchor="footer"
                    className="pointer-events-none absolute right-[calc(var(--sun-d)*-0.3)] bottom-[calc(120px-var(--sun-d)*var(--sun-sink))] size-[var(--sun-d)] motion-safe:invisible md:bottom-[calc(200px-var(--sun-d)*var(--sun-sink))] md:right-auto md:left-[max(40px,calc((100%-1200px)/2))]"
                >
                    <div className="size-full rounded-full bg-sun-warm" />
                </div>
                {/* The artist's seal, the page's final stamp, on the side opposite the sunset. */}
                <span className="absolute bottom-6 left-6 z-10 flex size-10 items-center justify-center bg-sun font-display text-[15px] leading-none text-field md:bottom-8 md:left-auto md:right-10">
                    EB
                </span>
            </SeaField>
        </footer>
    )
}

export default Footer
