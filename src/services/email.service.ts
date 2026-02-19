import nodemailer from 'nodemailer'
import { env } from '~/config/env.config'

class EmailService {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.OTP_EMAIL,
        pass: env.OTP_EMAIL_PASSWORD
      }
    })
  }

  /**
   * Send OTP email to user
   * @param recipientEmail User's email address
   * @param otp OTP code
   */
  async sendOTPEmail(to: string, subject: string, htmlContent: string) {
    const mailOptions = {
      from: {
        name: env.OTP_EMAIL_NAME,
        address: env.OTP_EMAIL
      },
      to,
      subject,
      html: htmlContent
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent: ' + info.response)
      return info
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    const mailOptions = {
      from: {
        name: env.OTP_EMAIL_NAME,
        address: env.OTP_EMAIL
      },
      to,
      subject,
      html: htmlContent
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent: ' + info.response)
      return info
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }
}

const emailService = new EmailService()
export default emailService
