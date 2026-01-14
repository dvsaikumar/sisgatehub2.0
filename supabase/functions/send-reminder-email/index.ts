import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reminder, mailConfig, userEmail } = await req.json()

    console.log('=== REMINDER EMAIL REQUEST ===')
    console.log('User Email:', userEmail)
    console.log('Reminder:', JSON.stringify(reminder, null, 2))
    console.log('Mail Config:', JSON.stringify(mailConfig, null, 2))
    console.log('SMTP Host:', mailConfig.host)
    console.log('SMTP Port:', mailConfig.port)
    console.log('==============================')

    // Format the date nicely
    const reminderDate = new Date(reminder.start_date)
    const formattedDate = reminderDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: ${reminder.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔔 Reminder Alert</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">${reminder.title}</h2>
              
              ${reminder.note ? `
              <div style="margin: 0 0 30px; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
                <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.6;">${reminder.note}</p>
              </div>
              ` : ''}
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #718096; font-size: 14px; font-weight: 600;">📅 Scheduled For:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${formattedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <div style="margin: 30px 0 0; padding: 20px; background-color: #edf2f7; border-radius: 4px; text-align: center;">
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                  This is an automated reminder from <strong>Sisgate Hub</strong>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #718096; font-size: 12px;">
                © ${new Date().getFullYear()} Sisgate Hub. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Create plain text version
    const emailText = `
REMINDER: ${reminder.title}

${reminder.note ? `${reminder.note}\n\n` : ''}
Scheduled For: ${formattedDate}

---
This is an automated reminder from Sisgate Hub.
    `

    try {
      console.log(`Attempting to send email via SMTP: ${mailConfig.host}:${mailConfig.port}`)

      // Use nodemailer-compatible approach with Deno
      // We'll use a simple TCP connection to send SMTP commands
      const result = await sendEmailViaSMTP({
        host: mailConfig.host,
        port: parseInt(mailConfig.port),
        username: mailConfig.username,
        password: mailConfig.password,
        from: mailConfig.username,
        to: userEmail,
        subject: `🔔 Reminder: ${reminder.title}`,
        html: emailHtml,
        text: emailText
      })

      console.log('Email sent successfully:', result)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Reminder email sent successfully',
          to: userEmail,
          subject: reminder.title
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (smtpError: any) {
      console.error('SMTP Error:', smtpError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `SMTP Error: ${smtpError?.message || 'Unknown error'}`,
          details: smtpError?.toString() || 'No details available',
          phase: 'smtp_send',
          config: {
            host: mailConfig.host,
            port: mailConfig.port
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Internal server error',
        details: error?.toString() || 'No details available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to send email via SMTP using raw TCP connection
async function sendEmailViaSMTP(config: {
  host: string
  port: number
  username: string
  password: string
  from: string
  to: string
  subject: string
  html: string
  text: string
}): Promise<string> {
  const { host, port, username, password, from, to, subject, html, text } = config

  console.log(`Connecting to ${host}:${port}...`)

  try {
    // For port 465 (SSL) or 587 (STARTTLS), we'll use Deno.connectTls
    const useTLS = port === 465

    let conn: Deno.TcpConn | Deno.TlsConn

    if (useTLS) {
      conn = await Deno.connectTls({ hostname: host, port })
      console.log('Connected via TLS (port 465)')
    } else {
      conn = await Deno.connect({ hostname: host, port })
      console.log('Connected via TCP (port 587)')
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Helper to read SMTP response
    const readResponse = async (): Promise<string> => {
      const buffer = new Uint8Array(4096)
      const n = await conn.read(buffer)
      if (n === null) throw new Error('Connection closed')
      return decoder.decode(buffer.subarray(0, n))
    }

    // Helper to send SMTP command
    const sendCommand = async (command: string): Promise<string> => {
      console.log('SMTP >', command.replace(/\r\n$/, ''))
      await conn.write(encoder.encode(command + '\r\n'))
      const response = await readResponse()
      console.log('SMTP <', response.trim())
      return response
    }

    // Read initial greeting
    const greeting = await readResponse()
    console.log('SMTP <', greeting.trim())
    if (!greeting.startsWith('220')) {
      throw new Error(`SMTP greeting failed: ${greeting}`)
    }

    // EHLO
    await sendCommand(`EHLO ${host}`)

    // For port 587, send STARTTLS
    if (port === 587 && !useTLS) {
      await sendCommand('STARTTLS')
      // Upgrade to TLS
      conn = await Deno.startTls(conn as Deno.TcpConn, { hostname: host })
      console.log('Upgraded to TLS via STARTTLS')
      await sendCommand(`EHLO ${host}`)
    }

    // AUTH LOGIN
    await sendCommand('AUTH LOGIN')
    await sendCommand(btoa(username))
    await sendCommand(btoa(password))

    // MAIL FROM
    await sendCommand(`MAIL FROM:<${from}>`)

    // RCPT TO
    await sendCommand(`RCPT TO:<${to}>`)

    // DATA
    await sendCommand('DATA')

    // Email headers and body
    const emailContent = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="boundary123"`,
      ``,
      `--boundary123`,
      `Content-Type: text/plain; charset=UTF-8`,
      ``,
      text,
      ``,
      `--boundary123`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      html,
      ``,
      `--boundary123--`,
      `.`
    ].join('\r\n')

    await conn.write(encoder.encode(emailContent + '\r\n'))
    const dataResponse = await readResponse()
    console.log('SMTP <', dataResponse.trim())

    // QUIT
    await sendCommand('QUIT')

    conn.close()
    console.log('Connection closed successfully')

    return 'Email sent successfully via SMTP'
  } catch (error: any) {
    console.error('SMTP Connection Error:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
