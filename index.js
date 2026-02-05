const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { MessagingResponse } = require('twilio').twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/webhook', async (req, res) => {
    const incomingMessage = req.body.Body;
    const twiml = new MessagingResponse();

    try {
        const aiResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "אתה עוזר חכם בוואטסאפ. תענה בעברית קצרה ולעניין." },
                    { role: "user", content: incomingMessage }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const botReply = aiResponse.data.choices[0].message.content;
        twiml.message(botReply);
    } catch (error) {
        console.error("Error details:", error.response ? error.response.data : error.message);
        twiml.message("מצטער, יש לי תקלה קטנה במוח. נסה שוב מאוחר יותר.");
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
