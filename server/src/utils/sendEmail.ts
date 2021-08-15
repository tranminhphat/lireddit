import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(to: string, html: string): Promise<void> {
	// create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: "wsa2djxntzgfdkmn@ethereal.email", // generated ethereal user
			pass: "qT933sVaCnxaspRVtP", // generated ethereal password
		},
	});

	// send mail with defined transport object
	const info = await transporter.sendMail({
		to,
		html,
		subject: "Change password", // Subject line
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
	});

	console.log("Message sent: %s", info.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export default sendEmail;
