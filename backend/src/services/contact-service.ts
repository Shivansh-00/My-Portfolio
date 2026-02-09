import nodemailer from "nodemailer";
import { createContactMessage, listContactMessages } from "../repositories/contact-repository";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendNotificationEmail(data: {
  name: string;
  email: string;
  message: string;
}) {
  const to = process.env.CONTACT_EMAIL;
  if (!to || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Email not configured – skipping notification.");
    return;
  }

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to,
    replyTo: data.email,
    subject: `New Contact Message from ${data.name}`,
    text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <hr />
      <p>${data.message.replace(/\n/g, "<br />")}</p>
    `
  });
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  message: string;
}) {
  const message = await createContactMessage(data);

  // Send email in the background – don't let it block the API response
  sendNotificationEmail(data).catch((err) =>
    console.error("Failed to send notification email:", err)
  );

  return message;
}

export async function loadContactMessages() {
  return listContactMessages();
}
