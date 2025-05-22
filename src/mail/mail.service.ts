import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'indietrackeri@gmail.com',
      pass: process.env.MAIL_APP_PASSWORD, // <-- MATCH THE ENV VAR NAME
    },
  });

  async sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: '"IndieTracker" <contact@indietracker.infy.uk>',
      to,
      subject,
      text,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
