import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'mail.xkorin.com',
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER || 'contact@xkorin.com',
        pass: process.env.MAIL_PASSWORD || 'xxxxxxxx',
    },
    tls: {
        rejectUnauthorized: false
    }
});

interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: MailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'Xkorin School'}" <${process.env.MAIL_SOURCE || 'contact@xkorin.com'}>`,
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email: ", error);
        return { success: false, error };
    }
};

export const sendInvitationEmail = async (email: string, link: string, className: string) => {
    const subject = `Invitation à rejoindre la classe ${className}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #007bff;">Bienvenue sur Xkorin School !</h2>
            <p>Vous avez été invité à rejoindre la classe <strong>${className}</strong>.</p>
            <p>Pour accepter l'invitation et accéder à votre classe, veuillez cliquer sur le bouton ci-dessous :</p>
            <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Rejoindre la classe</a>
            <p style="margin-top: 20px;">Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
            <p><a href="${link}">${link}</a></p>
        </div>
    `;
    return sendEmail({ to: email, subject, html });
};

export const sendAccountActivationEmail = async (email: string, link: string, className: string, tempPassword?: string) => {
    const subject = `Activation de votre compte Xkorin School`;

    let passwordSection = '';
    if (tempPassword) {
        passwordSection = `
            <p>Votre mot de passe temporaire est : <strong>${tempPassword}</strong></p>
            <p>Nous vous recommandons de le changer dès votre première connexion.</p>
        `;
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #007bff;">Bienvenue sur Xkorin School !</h2>
            <p>Un compte a été créé pour vous afin de rejoindre la classe <strong>${className}</strong>.</p>
            ${passwordSection}
            <p>Pour activer votre compte et rejoindre la classe automatiquement, cliquez sur le bouton ci-dessous :</p>
            <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Activer mon compte</a>
            <p style="margin-top: 20px;">Ou utilisez ce lien :</p>
            <p><a href="${link}">${link}</a></p>
        </div>
    `;
    return sendEmail({ to: email, subject, html });
};
