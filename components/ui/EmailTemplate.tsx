import * as React from 'react';

interface EmailTemplateProps {
    username: string;
    email: string;
    message: string;
    asunto: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    username, email, message, asunto
}) => (
    <div>
        <h1>De: ${username} - ${email}</h1>
        <p>Asunto: ${asunto}</p>
        <p>${message}</p>
    </div>
);