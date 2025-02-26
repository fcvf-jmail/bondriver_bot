const path = require("path");
require('dotenv').config({path: path.join(__dirname, ".env")})
const fs = require("fs")
const { Telegraf, session, Markup, Scenes} = require('telegraf');
const addReportScene = require("./scenes/addReportScene");
const editAllUserList = require("./scenes/editAllUserList");
const addUserScene = require("./scenes/addUserScene");
const bot = new Telegraf(process.env.bot_token)

const chatIdsPath = path.join(__dirname, "chatIds.json")

const stage = new Scenes.Stage([addReportScene, addUserScene, editAllUserList])

bot.use(session())
bot.use(stage.on()) 

bot.on("photo", async ctx => console.log(await ctx.telegram.getFileLink(ctx.message.photo[ctx.message.photo.length - 1].file_id)))

bot.telegram.setMyCommands([{command: "send_report", description: "Отправить отчет"}])

bot.start(ctx => ctx.reply("Для того чтобы сдать отчет напиши команду /send_report", {reply_markup: {remove_keyboard: true}}))

bot.command("send_report", ctx => {
    var allUsers = JSON.parse(fs.readFileSync(chatIdsPath, "utf-8"))
    if(!allUsers.find(user => user.chatId == ctx.from.id)) return ctx.reply("У вас нет доступа к этой команде")
    ctx.scene.enter("addReportScene")
})

bot.command("admin_tools", ctx => {
    const allUsers = JSON.parse(fs.readFileSync(chatIdsPath, "utf-8"))
    if(allUsers.find(user => user.chatId == ctx.from.id)) return ctx.scene.enter("editAllUserList")
})

bot.command("get_chat_id", ctx => ctx.reply(ctx.chat.id.toString()))

bot.launch()