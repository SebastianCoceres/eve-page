import nodemailer from 'nodemailer';
import { contactSchema, escapeHtml } from '@/lib/contact';
import { Services } from '@/lib/services';

export async function POST(req: Request) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // The same contract as the form: required fields, limits and the optional phone.
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
        return Response.json({ error: 'Invalid fields', issues: parsed.error.issues.map(({ path, message }) => ({ path, message })) }, { status: 400 })
    }
    const { username, email, phone, asunto, message } = parsed.data
    const service = asunto ? Services.find((item) => item.key === asunto)?.title ?? asunto : undefined

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.GMAIL_APP_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    })

    const info = await transporter.sendMail({
        from: process.env.GMAIL_APP_EMAIL,
        to: "bogadoevelyn12@gmail.com",
        subject: 'Contacto',
        html: `
            <p>Username: ${escapeHtml(username)}</p>
            <p>Email: ${escapeHtml(email)}</p>
            ${phone ? `<p>Teléfono: ${escapeHtml(phone)}</p>` : ''}
            ${service ? `<p>Me interesa: ${escapeHtml(service)}</p>` : ''}
            <p>Message: ${escapeHtml(message)}</p>
        `
    })

    return Response.json(info)
}
