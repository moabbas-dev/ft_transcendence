import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config()

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},

});

/**
 * Send an email
 * @param {string} to Recipient email
 * @param {string} subject Email subject
 * @param {string} text Plain text body
 * @param {string} html html HTML body
 */
export async function sendEmail(to, subject, text = null, html) {
	console.log(to);
	console.log(subject);
	try {
		const info = await transporter.sendMail({
			from: process.env.EMAIL_FROM,
			to,
			subject,
			text,
			html,
		});
		console.log(`Email sent:, ${info.messageId}`);
		return info;
	} catch (error) {
		console.error("Error sending email message:", error);
		throw error;
	}
}
