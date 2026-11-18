'use client'
import { Button } from "@/components/ui/Button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/Form";
import Heading from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { InstagramIcon, LinkedinIcon } from "@/components/vectors/SocialIcons";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { useFadeStagger } from "@/hooks/useFadeStagger";
import { Services } from "@/lib/services";
import { useServicesStore } from "@/stores/service/service-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SEND_ERROR = "No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme por Instagram."

const socials = [
    { label: "Instagram", href: "https://www.instagram.com/evelyn.digitalmkt/", Icon: InstagramIcon },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/evebogado/", Icon: LinkedinIcon },
] as const

const servicesMap = Object.fromEntries(Services.map((service) => ([service.key, service.key])))
const formSchema = z.object({
    username: z.string().trim().min(2, { message: "Escribe tu nombre (mínimo 2 caracteres)." }).max(50, { message: "Número máximo de caracteres excedido" }),
    email: z.string().trim().email({ message: "Revisa el correo: debe tener el formato nombre@dominio.com." }),
    asunto: z.nativeEnum({ ...servicesMap }).optional(),
    message: z.string().trim().min(10, { message: "Cuéntame un poco más (mínimo 10 caracteres)." }).max(500, { message: "Número máximo de caracteres excedido" }),
})

type ContactValues = z.infer<typeof formSchema>

export const Contacto = () => {
    const { ref } = useIsInViewWithStore("contact")
    const scope = useFadeStagger()
    const selectedService = useServicesStore(state => state.selectedService)
    const form = useForm<ContactValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            asunto: selectedService,
            message: "",
        },
        // Validate on blur first, then re-check on every change so a fixed error clears at once.
        mode: "onTouched",
    })
    const { isSubmitting, errors } = form.formState

    useEffect(() => {
        if (selectedService) form.setValue("asunto", selectedService)
    }, [selectedService, form])

    async function onSubmit(values: ContactValues) {
        try {
            const res = await fetch("/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })
            if (!res.ok) throw new Error("send failed")
            toast.success("Mensaje enviado. Te responderé pronto.")
            form.clearErrors("root")
            form.reset({ username: "", email: "", asunto: undefined, message: "" })
        } catch {
            toast.error(SEND_ERROR)
            form.setError("root", { message: SEND_ERROR })
        }
    }

    // Submitting is signalled with aria-disabled, never the disabled attribute, so
    // the button stays focusable; repeat submits are ignored here instead.
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        if (form.formState.isSubmitting) {
            event.preventDefault()
            return
        }
        return form.handleSubmit(onSubmit)(event)
    }

    return (
        <section id="contact" tabIndex={-1} className="section-pad scroll-mt-16 focus:outline-none">
            <div ref={scope} className="container">
                {/* Heading and lead open the left column; from 1280px the socials close it,
                    level with the send button, and the low afternoon sun parks between
                    them (useTravelingSun). Below 1280px everything stacks tightly. */}
                <div ref={ref} className="grid gap-y-12 md:grid-cols-12 md:gap-x-6 md:gap-y-16">
                    <div className="reveal flex flex-col md:col-span-12 xl:col-span-5">
                        <Heading is="h2">Hablemos de tu proyecto</Heading>
                        <p className="mt-4 max-w-[40ch] text-lead text-foreground">¡Estoy aquí para ti!</p>
                        <ul className="mt-8 flex flex-wrap gap-x-8 xl:mt-auto xl:pt-12">
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
                    </div>

                    <div className="reveal md:col-span-12 xl:col-span-6 xl:col-start-7">
                        <Form {...form}>
                            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2" noValidate aria-busy={isSubmitting}>
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input autoComplete="name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correo</FormLabel>
                                            <FormControl>
                                                <Input type="email" inputMode="email" placeholder="nombre@empresa.com" autoComplete="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="asunto"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Me interesa un servicio</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value ?? ""} name={field.name}>
                                                <FormControl>
                                                    <SelectTrigger onBlur={field.onBlur}>
                                                        <SelectValue placeholder="Elige un servicio (opcional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Services.map((service) => (
                                                        <SelectItem key={service.key} value={service.key}>{service.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Mensaje</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Cuéntame tu historia" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            <FormDescription>
                                                Si prefieres, déjame tu número de teléfono y charlamos sobre tu proyecto.
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                {errors.root?.message && (
                                    <p role="alert" className="text-sm leading-[1.5] text-error md:col-span-2">{errors.root.message}</p>
                                )}

                                <div className="pt-2 md:col-span-2">
                                    <Button
                                        type="submit"
                                        aria-disabled={isSubmitting || undefined}
                                        className="w-full md:w-auto"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                                                Enviando…
                                            </>
                                        ) : "Enviar mensaje"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Contacto
