require('dotenv/config')
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

bot.on('ready', () => {
    console.log('미쳤습니까 휴먼? 제정신이 아니군요.')
})

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
})
const openai = new OpenAIApi(configuration);

bot.on('messageCreate', async (message) => {
    if(message.author.bot) return;
    if(message.channel.id !== process.env.CHANNEL_ID) return;
    if(message.content.startsWith('!')) return;

    let conversationLog = [{ role : 'system', content : "What up, human?" }]

    await message.channel.sendTyping();

    let prevmessages = await message.channel.messages.fetch({ limit: 15 });
    prevmessages.reverse();

    prevmessages.forEach((msg) => {
        if(message.content.startsWith('!')) return;
        if(msg.author.id !== bot.user.id && message.author.bot) return;
        if(msg.author.id !== message.author.id) return;

        conversationLog.push({
            role : 'user',
            content : msg.content
        })
    }) 

    const result = await openai.createChatCompletion({
        model : 'gpt-3.5-turbo',
        messages : conversationLog,
    })

    message.reply(result.data.choices[0].message);
})

bot.login(process.env.TOKEN);