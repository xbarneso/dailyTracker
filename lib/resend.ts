import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendHabitReminderEmail(
  to: string,
  habitName: string,
  frequency: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Habit Tracker <onboarding@resend.dev>',
      to: [to],
      subject: `Recordatorio: ${habitName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f0f9f4;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                color: #2a7447;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .content {
                color: #333;
                line-height: 1.6;
              }
              .habit-name {
                font-weight: bold;
                color: #38915a;
                font-size: 18px;
              }
              .button {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background-color: #38915a;
                color: white;
                text-decoration: none;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="header">🌿 Recordatorio de Hábito</h1>
              <div class="content">
                <p>Hola,</p>
                <p>Te recordamos que aún no has completado tu hábito:</p>
                <p class="habit-name">${habitName}</p>
                <p>Frecuencia: ${frequency === 'daily' ? 'Diario' : frequency === 'weekly' ? 'Semanal' : 'Mensual'}</p>
                <p>¡No olvides completarlo hoy!</p>
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Ir al Dashboard</a>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { error }
  }
}

