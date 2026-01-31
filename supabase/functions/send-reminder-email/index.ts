const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reminder, mailConfig, userEmail } = await req.json()

    console.log('=== REMINDER EMAIL REQUEST ===')
    console.log('User Email:', userEmail)
    console.log('Extra Email:', reminder.extra_email || 'None')
    console.log('Attachment:', reminder.attachment_path || 'None')
    console.log('Reminder:', JSON.stringify(reminder, null, 2))
    console.log('SMTP Host:', mailConfig.host)
    console.log('SMTP Port:', mailConfig.port)
    console.log('==============================')

    // Format date components
    const reminderDate = new Date(reminder.start_date)
    const day = reminderDate.getDate()
    const month = reminderDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    const weekday = reminderDate.toLocaleString('en-US', { weekday: 'long' })
    const timeStr = reminderDate.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const fullDate = reminderDate.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const formattedDate = `${fullDate} at ${timeStr}` // Keep for text version compatibility

    // Modern Responsive Email Template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Reminder: ${reminder.title}</title>
  <!--[if mso]>
  <style>
    table {border-collapse:collapse;border-spacing:0;border:none;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    table, td, div, h1, p { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    @media screen and (max-width: 530px) {
      .col-lge { max-width: 100% !important; }
    }
    @media screen and (min-width: 531px) {
      .col-sml { max-width: 27% !important; }
      .col-lge { max-width: 73% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#f3f4f6;">
  <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f4f6;">
    <table role="presentation" style="width:100%;border:none;border-spacing:0;">
      <tr>
        <td align="center" style="padding:20px 0;">
          <!--[if mso]>
          <table role="presentation" align="center" style="width:600px;">
          <tr>
          <td>
          <![endif]-->
          <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;font-size:16px;line-height:22px;color:#363636;">
            <!-- Brand Header -->
            <tr>
              <td style="padding:20px;text-align:center;background-color:#009B84;border-radius:12px 12px 0 0;">
                 <h1 style="margin:0;font-size:24px;line-height:30px;font-weight:bold;color:#ffffff;">
                   🔔 Reminder
                 </h1>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding:40px 30px;background-color:#ffffff;border-radius:0 0 12px 12px;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                
                <h2 style="margin-top:0;margin-bottom:16px;font-size:20px;line-height:32px;font-weight:bold;letter-spacing:-0.02em;color:#1f2937;">
                  ${reminder.title}
                </h2>
                
                <div style="margin-bottom:24px;padding:24px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                   <!-- Calendar Row -->
                   <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                     <tr>
                       <!-- Date Badge -->
                       <td style="width:60px;vertical-align:top;padding-right:20px;">
                          <div style="text-align:center;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#ffffff;">
                             <div style="background-color:#EF4444;color:#ffffff;font-size:10px;font-weight:bold;padding:4px 0;text-transform:uppercase;">
                               ${month}
                             </div>
                             <div style="padding:8px 0;font-size:22px;font-weight:bold;color:#1f2937;line-height:1;">
                               ${day}
                             </div>
                          </div>
                       </td>
                       <!-- Date Details -->
                       <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:14px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">
                            ${weekday}
                          </p>
                          <p style="margin:4px 0 0 0;font-size:18px;font-weight:bold;color:#1f2937;">
                            ${timeStr}
                          </p>
                       </td>
                     </tr>
                   </table>
                </div>

                ${reminder.note ? `
                <div style="margin-bottom:24px;">
                   <p style="margin:0;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Description</p>
                   <p style="margin:4px 0 0;font-size:15px;line-height:24px;color:#4b5563;">
                      ${reminder.note.replace(/\n/g, '<br>')}
                   </p>
                </div>
                ` : ''}

                ${reminder.extra_email ? `
                <div style="margin-top:20px;padding-top:20px;border-top:1px dashed #e5e7eb;">
                   <p style="margin:0;font-size:13px;color:#9ca3af;">
                     <span style="display:inline-block;vertical-align:middle;margin-right:4px;">👥</span> 
                     Sent to you and: <span style="color:#4b5563;">${reminder.extra_email.split(',').join(', ')}</span>
                   </p>
                </div>
                ` : ''}
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding:30px;text-align:center;font-size:12px;background-color:#f3f4f6;color:#9ca3af;">
                <p style="margin:0 0 8px 0;">This notification was sent via Sisgate Hub.</p>
                <p style="margin:0;">&copy; ${new Date().getFullYear()} Sisgate Hub. All rights reserved.</p>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </div>
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

    // Fetch attachment if present
    let attachmentData: { content: string; filename: string; contentType: string } | null = null
    if (reminder.attachment_path) {
      try {
        console.log('Fetching attachment from:', reminder.attachment_path)
        const attachmentResponse = await fetch(reminder.attachment_path)
        if (attachmentResponse.ok) {
          const arrayBuffer = await attachmentResponse.arrayBuffer()
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
          const filename = reminder.attachment_path.split('/').pop() || 'attachment'
          const contentType = attachmentResponse.headers.get('content-type') || 'application/octet-stream'
          attachmentData = { content: base64Content, filename, contentType }
          console.log('Attachment fetched successfully:', filename)
        } else {
          console.warn('Failed to fetch attachment:', attachmentResponse.status)
        }
      } catch (attachErr) {
        console.warn('Error fetching attachment:', attachErr)
      }
    }

    try {
      console.log(`Attempting to send email via SMTP: ${mailConfig.host}:${mailConfig.port}`)

      // Use nodemailer-compatible approach with Deno
      const result = await sendEmailViaSMTP({
        host: mailConfig.host,
        port: parseInt(mailConfig.port),
        username: mailConfig.username,
        password: mailConfig.password,
        from: mailConfig.username,
        to: userEmail,
        subject: `🔔 Reminder: ${reminder.title}`,
        html: emailHtml,
        text: emailText,
        attachment: attachmentData
      })

      console.log('Email sent to primary user:', result)

      // Send to extra email if provided
      if (reminder.extra_email) {
        console.log('Sending to extra email:', reminder.extra_email)
        await sendEmailViaSMTP({
          host: mailConfig.host,
          port: parseInt(mailConfig.port),
          username: mailConfig.username,
          password: mailConfig.password,
          from: mailConfig.username,
          to: reminder.extra_email,
          subject: `🔔 Reminder: ${reminder.title}`,
          html: emailHtml,
          text: emailText,
          attachment: attachmentData
        })
        console.log('Email sent to extra recipient')
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Reminder email sent successfully',
          to: userEmail,
          extraEmail: reminder.extra_email || null,
          hasAttachment: !!attachmentData,
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
  attachment?: { content: string; filename: string; contentType: string } | null
}): Promise<string> {
  const { host, port, username, password, from, to, subject, html, text, attachment } = config

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
    const boundary = 'boundary123'
    const mixedBoundary = 'mixedboundary456'

    let emailContent: string

    if (attachment) {
      // With attachment: use multipart/mixed with nested multipart/alternative
      emailContent = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
        ``,
        `--${mixedBoundary}`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=UTF-8`,
        ``,
        text,
        ``,
        `--${boundary}`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        html,
        ``,
        `--${boundary}--`,
        ``,
        `--${mixedBoundary}`,
        `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        `Content-Transfer-Encoding: base64`,
        ``,
        attachment.content,
        ``,
        `--${mixedBoundary}--`,
        `.`
      ].join('\r\n')
    } else {
      // Without attachment: simple multipart/alternative
      emailContent = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=UTF-8`,
        ``,
        text,
        ``,
        `--${boundary}`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        html,
        ``,
        `--${boundary}--`,
        `.`
      ].join('\r\n')
    }

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
