const nodemailer = require('nodemailer')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { name, email, message } = JSON.parse(event.body)

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const ownerEmail = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Nouveau message de ${name} — Portfolio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nouveau message portfolio</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <hr />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    }

    const clientEmail = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Confirmation — Message reçu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>Votre message a bien été reçu. Je vous répondrai dans les plus brefs délais.</p>
          <blockquote style="border-left: 3px solid #7c5cff; padding-left: 12px; color: #555;">
            ${message}
          </blockquote>
          <p>Cordialement,<br><strong>Soufiane HAJJI</strong></p>
        </div>
      `,
    }

    await transporter.sendMail(ownerEmail)
    await transporter.sendMail(clientEmail)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Message envoyé avec succès' }),
    }
  } catch (error) {
    console.error('Contact function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur lors de l\'envoi du message' }),
    }
  }
}
