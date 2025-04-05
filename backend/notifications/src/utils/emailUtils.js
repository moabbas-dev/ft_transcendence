const nodemailer = require("nodemailer");

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
async function sendEmail(to, subject, text = null, html) {
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
		console.error("Error sending email:", error);
		throw error;
	}
}

module.exports = { sendEmail };