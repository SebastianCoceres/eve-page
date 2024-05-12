'use client'
import Heading from "@/components/ui/Heading";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/Button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/Form"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner"


const formSchema = z.object({
    username: z.string().min(2, { message: "Debe contener al menos 2 caracteres" }).max(50, { message: "Número máximo de caracteres excedido" }),
    email: z.string().email({ message: "El correo electrónico es inválido" }),
    message: z.string().min(10,{ message: "El mensaje debe tener al menos 10 caracteres"}).max(500, { message: "Número máximo de caracteres excedido" }),
})

export const Contacto = () => {
    const { ref } = useIsInViewWithStore("contact")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            message: "",
        },
        mode: "onChange",
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const res = await fetch("/api/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
        if (res.ok) {
            toast.success("Mensaje enviado")
            form.clearErrors("root")
            form.reset()
        } else {
            toast.error("Error al enviar el mensaje")
            form.setError("root", { message: "Error al enviar el mensaje" })
        }

    }

    return (
        <section id="contact" className=" flex flex-col justify-center items-center flex-fill min-h-screen bg-background">
            <div ref={ref} className="container md:max-w-6xl mx-auto">
                <Heading is="h2" className="text-secondary">¡Estoy aquí para ti!</Heading>
                <Heading is="h3" className="text-secondary">Hablemos de tu proyecto:</Heading>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <>
                                    <FormItem>
                                        <FormLabel className="sr-only">Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>

                                </>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <>
                                    <FormItem>
                                        <FormLabel className="sr-only">Correo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Correo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>

                                </>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <>
                                    <FormItem>
                                        <FormLabel className="sr-only">Mensaje</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Cuéntame tu historia" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>

                                </>
                            )}
                        />

                        <Button type="submit">Enviar</Button>
                    </form>
                </Form>
            </div>
        </section>
    )
}

export default Contacto