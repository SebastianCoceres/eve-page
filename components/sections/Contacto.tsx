'use client'
import { Services } from "@/components/sections/Servicios";
import { Button } from "@/components/ui/Button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/Form";
import Heading from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { useServicesStore } from "@/stores/service/service-provider";
import { useEffect, useState } from "react";

const servicesMap = Object.fromEntries(Services.map((service) => ([service.key, service.key])))
const formSchema = z.object({
    username: z.string().min(2, { message: "Debe contener al menos 2 caracteres" }).max(50, { message: "Número máximo de caracteres excedido" }),
    email: z.string().email({ message: "El correo electrónico es inválido" }),
    asunto: z.nativeEnum({ ...servicesMap }).optional(),
    message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres" }).max(500, { message: "Número máximo de caracteres excedido" }),
})

export const Contacto = () => {
    const { ref } = useIsInViewWithStore("contact")
    const { selectedService } = useServicesStore(state => state)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            asunto: selectedService,
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
        <section id="contact" className=" flex flex-col justify-center items-center flex-fill pb-36 bg-background">
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
                            name="asunto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Me interesa un servicio</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={selectedService ? servicesMap[selectedService] : undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Me interesa..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white">
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
        </section >
    )
}

export default Contacto