import nodemailer from 'nodemailer';

import config from './index';

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	host: config.SMTP_MAIL_PORT,
	port: config.SMTP_MAIL_PORT,
	secure: false,
	auth: {
		user: config.SMTP_MAIL_USERNAME,
		pass: config.SMTP_MAIL_PASSWORD,
	},
});

export default transporter;
