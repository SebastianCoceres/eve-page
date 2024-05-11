import * as React from 'react';

interface EmailTemplateProps {
    username: string;
    email: string;
    message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    username, email, message
}) => (
    <div>
        <h1>De: ${username} - ${email}</h1>
        <p>${message}</p>
    </div>
);