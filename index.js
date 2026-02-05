const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { MessagingResponse } = require('twilio').twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// השורה הזו קריטית! היא אומרת ל-Railway שהבוט חי
app.get('/', (req, res) => res.send('Bot is Alive!'));

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
                    "Authorization": Bearer ${process.env.GROQ_API_KEY},
                    "Content-Type": "application/json"
                }
            }
        );

        const botReply = aiResponse.data.choices[0].message.content;
        twiml.message(botReply);
    } catch (error) {
        console.error("AI Error:", error.message);
        twiml.message("אופס, יש לי תקלה זמנית. נסה שוב בעוד רגע.");
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(Server is running on port ${PORT}));
