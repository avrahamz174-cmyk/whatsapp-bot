const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post("/webhook", async (req, res) => {
  try {
    const incomingMessage = req.body.Body;
    const from = req.body.From;

    // פנייה ל-Groq (חינם)
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "אתה עוזר חכם בוואטסאפ. תענה בעברית קצרה ולעניין."
          },
          {
            role: "user",
            content: incomingMessage
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiText = aiResponse.data.choices[0].message.content;

    // שליחת התשובה לוואטסאפ
    await client.messages.create({
      body: aiText,
      from: "whatsapp:+14155238886", 
      to: from
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("Bot is running for free with Groq!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
          
