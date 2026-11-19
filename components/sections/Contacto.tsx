'use client'
import { Button } from "@/components/ui/Button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/Form";
import { RevealLead, RevealTitle } from "@/components/ui/TextReveal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { useFadeStagger } from "@/hooks/useFadeStagger";
import { Services } from "@/lib/services";
import { useServicesStore } from "@/stores/service/service-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SEND_ERROR = "No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme por Instagram."

const servicesMap = Object.fromEntries(Services.map((service) => ([service.key, service.key])))
const formSchema = z.object({
    username: z.string().trim().min(2, { message: "Escribe tu nombre (mínimo 2 caracteres)." }).max(50, { message: "Usa como máximo 50 caracteres." }),
    email: z.string().trim().min(1, { message: "Escribe tu correo para que pueda responderte." }).email({ message: "Revisa el correo: debe tener el formato nombre@dominio.com." }),
    asunto: z.nativeEnum({ ...servicesMap }).optional(),
    message: z.string().trim().min(10, { message: "Cuéntame un poco más (mínimo 10 caracteres)." }).max(500, { message: "Usa como máximo 500 caracteres." }),
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
    const { isSubmitting, isDirty, errors } = form.formState
    // The success line stays under the button until the visitor starts a new message
    // (the reset form is pristine; any edit makes it dirty again).
    const [sent, setSent] = useState(false)
    const showSent = sent && !isDirty

    useEffect(() => {
        if (selectedService) form.setValue("asunto", selectedService)
    }, [selectedService, form])

    async function onSubmit(values: ContactValues) {
        setSent(false)
        try {
            const res = await fetch("/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })
            if (!res.ok) throw new Error("send failed")
            form.clearErrors("root")
            form.reset({ username: "", email: "", asunto: undefined, message: "" })
            setSent(true)
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
                {/* The left column is the invitation: heading, lead and one quiet line of
                    help. The socials live once, in the footer. From 1280px the column is
                    the sun's last way down: it descends through the open space under the
                    help line toward the footer sea (useTravelingSun). */}
                <div ref={ref} className="grid gap-y-10 md:grid-cols-12 md:gap-x-6 md:gap-y-14">
                    <div className="reveal md:col-span-12 xl:col-span-5">
                        <RevealTitle text="Hablemos de tu proyecto" />
                        <RevealLead text="¡Estoy aquí para ti!" className="mt-4 max-w-[40ch]" />
                        <p className="mt-6 max-w-[36ch] text-[15px] leading-[1.6] text-muted-foreground">
                            Si prefieres, déjame tu número de teléfono y charlamos sobre tu proyecto.
                        </p>
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

                                {/* Inline confirmation instead of a passing toast: the end of the task
                                    stays on the page, in the voice of the page. */}
                                <p role="status" className="text-lead text-foreground md:col-span-2 empty:sr-only">
                                    {showSent ? "Mensaje enviado. Te responderé pronto." : ""}
                                </p>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Contacto
