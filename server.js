require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Create email transporter with enhanced settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  secure: true,
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5
});

app.post('/send-assignments', async (req, res) => {
  try {
    const { assignments, eventDetails } = req.body;

    // Send email to each participant
    for (const assignment of assignments) {
      const mailOptions = {
        from: {
          name: 'Secret Santa Generator',
          address: process.env.EMAIL_USER
        },
        to: assignment.giver.email,
        subject: '🎄 Your Secret Santa Assignment!',
        priority: 'high',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        },
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2b6cb0; text-align: center; margin-bottom: 20px;">Your Secret Santa Assignment 🎅</h1>
            
            <p style="font-size: 16px; color: #4a5568; margin-bottom: 20px;">
              Hello ${assignment.giver.name}! 👋
            </p>
            
            <p style="font-size: 16px; color: #4a5568; margin-bottom: 10px;">
              You have been assigned as the Secret Santa for:
            </p>
            
            <div style="background-color: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="color: #2b6cb0; margin: 0; font-size: 24px;">
                ${assignment.receiver.name}
              </h2>
            </div>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d3748; margin-bottom: 15px;">Event Details:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 10px;">
                  📅 <strong>Exchange Date:</strong> ${new Date(eventDetails.exchangeDate).toLocaleDateString()}
                </li>
                <li>
                  💰 <strong>Budget:</strong> $${eventDetails.budget}
                </li>
              </ul>
            </div>
            
            <p style="font-style: italic; color: #718096; text-align: center; margin-top: 30px;">
              Remember to keep it a secret! 🤫
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #a0aec0; font-size: 14px;">
              Sent with ❤️ from Secret Santa Generator
            </div>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${assignment.giver.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${assignment.giver.email}:`, error);
        throw error;
      }
    }

    res.json({ success: true, message: 'All assignments sent successfully!' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send emails',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});