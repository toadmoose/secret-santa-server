require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/send-assignments', async (req, res) => {
  try {
    const { assignments, eventDetails } = req.body;

    // Send email to each participant
    for (const assignment of assignments) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: assignment.giver.email,
        subject: '🎄 Your Secret Santa Assignment!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2b6cb0;">Your Secret Santa Assignment</h1>
            <p>Hello ${assignment.giver.name}! 👋</p>
            <p>You have been assigned as the Secret Santa for:</p>
            <h2 style="color: #2b6cb0; background-color: #ebf8ff; padding: 10px; border-radius: 5px;">
              ${assignment.receiver.name}
            </h2>
            <div style="margin: 20px 0; padding: 15px; background-color: #f7fafc; border-radius: 5px;">
              <p><strong>Event Details:</strong></p>
              <ul style="list-style: none; padding-left: 0;">
                <li>📅 Exchange Date: ${new Date(eventDetails.exchangeDate).toLocaleDateString()}</li>
                <li>💰 Budget: $${eventDetails.budget}</li>
              </ul>
            </div>
            <p style="color: #718096; font-style: italic;">Remember to keep it a secret! 🤫</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ success: true, message: 'All assignments sent successfully!' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ success: false, message: 'Failed to send emails' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});