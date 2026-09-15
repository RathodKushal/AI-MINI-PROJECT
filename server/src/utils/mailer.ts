import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Use Gmail if credentials exist in .env
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log("Using Gmail SMTP for sending emails.");
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        return transporter;
    }

    // Fallback: Generate test SMTP service account from ethereal.email
    console.log("No SMTP credentials found. Falling back to Ethereal Email sandbox.");
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    return transporter;
}

export const sendReceiptEmail = async (
    toEmail: string,
    customerName: string,
    companyName: string,
    productName: string,
    quantity: number,
    price: number
) => {
    try {
        const mailer = await getTransporter();
        const fromEmail = process.env.SMTP_USER || `billing@${companyName.replace(/\s+/g, '').toLowerCase()}.com`;
        
        const info = await mailer.sendMail({
            from: `"${companyName} Billing" <${fromEmail}>`,
            to: toEmail,
            subject: `Your Receipt from ${companyName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #333; text-align: center;">${companyName}</h2>
                    <p>Hi <strong>${customerName}</strong>,</p>
                    <p>Thank you for your purchase! Here are your receipt details:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
                                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: center;">Quantity</th>
                                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">${productName}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${quantity}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;"><strong>$${price.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 30px; text-align: center; color: #666; font-size: 0.9em;">
                        <p>We hope to see you again soon!</p>
                    </div>
                </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        
        // If we used Ethereal, return the preview URL
        if (!process.env.SMTP_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return nodemailer.getTestMessageUrl(info);
        }
        
        return null; // For real Gmail, we don't return a preview URL, the email is just sent!
    } catch (err) {
        console.error("Error sending email:", err);
        return null;
    }
};
