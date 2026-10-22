import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type QuoteEmailPayload = {
  productName?: string
  name: string
  email: string
  phone: string
  message?: string
}

export async function sendQuoteEmail(payload: QuoteEmailPayload) {
  const { productName, name, email, phone, message } = payload

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: [process.env.NOTIFY_EMAIL!],
    subject: `📩 New Quote Request – ${productName ?? "Product"}`,
    html: `
      <h2>New Quote Request</h2>
      <p><strong>Product:</strong> ${productName ?? "N/A"}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message ?? "—"}</p>
    `,
  })
}
