import { EmailTemplate } from '@/components/ui/EmailTemplate';
import nodemailer from 'nodemailer';


export async function POST(req: Request) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.GMAIL_APP_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    })

    const { email, username, message } = await req.json();
    if (!email || !username || !message) {
        return Response.json({ error: 'Missing required fields' });
    }

    const info = await transporter.sendMail({
        from: process.env.GMAIL_APP_EMAIL,
        to: process.env.GMAIL_APP_EMAIL,
        subject: 'Contacto',
        html: `
            <p>Username: ${username}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
        `
    })

    return Response.json(info)

}
