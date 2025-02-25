const path = require("path");
require('dotenv').config({path: path.join(__dirname, ".env")})
const { Telegraf, session, Markup, Scenes} = require('telegraf');
const addReportScene = require("./addReportScene");
const { uploadFilesToDisk } = require("./yandexDiskFunctions");
const bot = new Telegraf(process.env.bot_token)

const stage = new Scenes.Stage([addReportScene])

bot.use(session())
bot.use(stage.on()) 

bot.on("photo", async ctx => console.log(await ctx.telegram.getFileLink(ctx.message.photo[ctx.message.photo.length - 1].file_id)))

bot.telegram.setMyCommands([{command: "send_report", description: "Отправить отчет"}])

bot.start(ctx => ctx.reply("Для того чтобы сдать отчет напиши команду /send_report", {reply_markup: {remove_keyboard: true}}))

bot.command("send_report", ctx => ctx.scene.enter("addReportScene"))

bot.command("get_chat_id", ctx => ctx.reply(ctx.chat.id.toString()))

bot.launch()