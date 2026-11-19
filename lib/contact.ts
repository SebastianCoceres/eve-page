import { z } from "zod";
import { Services } from "@/lib/services";

/**
 * The contact form's one validation contract, shared by the form
 * (components/sections/Contacto, through zodResolver) and the send route
 * (app/api/send/route.ts), so the browser and the server accept exactly the same
 * messages. Error copy names the fix, in Eve's tú voice.
 */

/** Characters a phone number may use: digits, spaces, hyphens, parentheses and a leading +. */
const PHONE_CHARACTERS = /^\+?[\d\s()-]+$/;
export const PHONE_DIGITS = { min: 6, max: 20 } as const;

/**
 * Why a phone number is not usable, or null when it is fine. Lenient and
 * international: any spacing or grouping, an optional leading +, 6 to 20 digits.
 * An empty value is fine: the field is optional.
 */
export function phoneProblem(value: string | undefined): string | null {
    const phone = value?.trim() ?? "";
    if (phone === "") return null;
    if (!PHONE_CHARACTERS.test(phone)) return "Revisa el número: usa solo dígitos, espacios o el prefijo +.";
    const digits = phone.replace(/\D/g, "").length;
    if (digits < PHONE_DIGITS.min || digits > PHONE_DIGITS.max) {
        return `Revisa el número: debe tener entre ${PHONE_DIGITS.min} y ${PHONE_DIGITS.max} dígitos.`;
    }
    return null;
}

const servicesMap = Object.fromEntries(Services.map((service) => [service.key, service.key]));

export const contactSchema = z.object({
    username: z.string().trim().min(2, { message: "Escribe tu nombre (mínimo 2 caracteres)." }).max(50, { message: "Usa como máximo 50 caracteres." }),
    email: z.string().trim().min(1, { message: "Escribe tu correo para que pueda responderte." }).email({ message: "Revisa el correo: debe tener el formato nombre@dominio.com." }),
    phone: z.string().trim().optional().superRefine((value, ctx) => {
        const problem = phoneProblem(value);
        if (problem) ctx.addIssue({ code: "custom", message: problem });
    }),
    asunto: z.nativeEnum({ ...servicesMap }).optional(),
    message: z.string().trim().min(10, { message: "Cuéntame un poco más (mínimo 10 caracteres)." }).max(500, { message: "Usa como máximo 500 caracteres." }),
});

export type ContactValues = z.infer<typeof contactSchema>;

/** Escapes text for an HTML email body. */
export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
