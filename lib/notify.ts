import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

type QuoteAlertPayload = {
  productName?: string
  name: string
  phone: string
}

export async function sendSMSAlert(payload: QuoteAlertPayload) {
  const message = `
New Quote Request
Product: ${payload.productName ?? "N/A"}
Name: ${payload.name}
Phone: ${payload.phone}
`

  await client.messages.create({
    from: process.env.TWILIO_SMS_FROM!,
    to: process.env.ADMIN_PHONE!,
    body: message,
  })

  // WHATSAPP VERSION
  await client.messages.create({
  from: "whatsapp:+14155238886", // Twilio sandbox or approved sender
  to: `whatsapp:${process.env.ADMIN_PHONE}`,
  body: message,
})

}
