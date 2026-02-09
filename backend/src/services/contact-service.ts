import { createContactMessage, listContactMessages } from "../repositories/contact-repository";

export async function submitContactMessage(data: {
  name: string;
  email: string;
  message: string;
}) {
  return createContactMessage(data);
}

export async function loadContactMessages() {
  return listContactMessages();
}
