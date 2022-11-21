const TelegramBotApi = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')

const token = require("./data/settings/token")
const bot = new TelegramBotApi(token, { polling: true })
const users = require('./data/base/users.json')
const { appendFile } = require('fs')

const webAppUrl = "https://earnest-phoenix-33c020.netlify.app/"

function prettify(number) {
    return String(number).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, "$1 ").replace(/\s/g, '.')
}

setInterval(() => {
    require('fs').writeFileSync('./data/base/users.json', JSON.stringify(users, null, '\t'))
}, 9000)


const app = express()

app.use(express.json())
app.use(cors())

bot.on('message', msg => {
    var user = users.filter(x => x.id === msg.from.id)[0]
    if (!user) {
        users.push({
            id: msg.from.id,
            nick: msg.from.username,
            chat: msg.chat.id

        })
        user = users.filter(x => x.id === msg.from.id)[0]
    }
})


const menuCommandKeyBoard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: 'Меню', web_app: {url: webAppUrl}}]
        ]
    })
}


bot.on('message', msg => {
    const text = msg.text
    const chatId = msg.chat.id
    
    if(text === "/start"){
        bot.sendMessage(chatId, "Привет ты попал в интернет магазин! Зайди в меню.", menuCommandKeyBoard)
    }
})

app.post("/we-data", async (req, res)  =>  {
    const {queryId, product_price} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Товар выбран",
            input_message_content: {message_text: "Вы успешно выбрали товар перейдите к оплате"}
        })
        return res.status(200).json({});
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Не удалось приобрести товар",
            input_message_content: {message_text: "Не удалось приобрести товар"}
        })
        return res.status(500).json({});

    }
} )

const PORT = 8080
app.listen(PORT, () => console.log(`server started in port ${PORT}`))