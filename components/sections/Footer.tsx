import { Logo } from "@/components/ui/Logo";
import { InstagramIcon, LinkedinIcon } from "@/components/vectors/SocialIcons";

const socials = [
    { label: "Instagram", href: "https://www.instagram.com/evelyn.digitalmkt/", Icon: InstagramIcon },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/evebogado/", Icon: LinkedinIcon },
] as const

export const Footer = () => {
    return (
        <footer className="border-t border-hairline bg-surface">
            <div className="container grid items-center gap-6 py-12 md:grid-cols-3">
                <a href="#home" className="inline-flex min-h-11 w-fit items-center text-foreground">
                    <span className="sr-only">Evelyn Bogado, volver al inicio</span>
                    <span aria-hidden="true" className="block h-6 w-[121px] [&_svg]:size-full [&_svg]:fill-current">
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
        </footer>
    )
}

export default Footer
