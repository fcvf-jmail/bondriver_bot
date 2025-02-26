const { Scenes } = require("telegraf")
const path = require("path")
var fs = require("fs")
var chatIdsPath = path.join(__dirname, "..", "chatIds.json")

const cancelButton = {text: "Отмена", callback_data: "cancel"}

module.exports = new Scenes.WizardScene("addUserScene",
    ctx => {
        ctx.reply("Введите имя сотрудника", {reply_markup: {inline_keyboard: [[cancelButton]]}})
        return ctx.wizard.next()
    },
    ctx => {
        if (ctx?.callbackQuery?.data == "cancel") return cancelAdding(ctx)
        if (ctx?.callbackQuery) return
        var name = ctx.message.text
        var user = checkUnick("name", name)
        if (typeof user == "object") return ctx.reply(`Данное имя уже занято сотрудником с чат айди ${user.chatId}`, {reply_markup: {inline_keyboard: [[cancelButton]]}})
        ctx.scene.session.state.name = name
        ctx.reply("Отлично, теперь чат айди этого сотрудника\nP.S, для того чтобы узнать чат айди сотрудник, попросите его написать в этого бота команду /getId", {reply_markup: {inline_keyboard: [[cancelButton]]}})
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancel") return cancelAdding(ctx)
        if (ctx.callbackQuery) return
        var chatId = ctx.message.text
        if (Number(chatId).toString() == "NaN") return ctx.reply("Чат айди должен содержать только цифры. Попробуйте снова", {reply_markup: {inline_keyboard: [[cancelButton]]}})
        var user = checkUnick("chatId", chatId)
        if (typeof user == "object") return ctx.reply(`Данный чат айди уже добавлен для сотрудника с именем ${user.name}`, {reply_markup: {inline_keyboard: [[cancelButton]]}})
        addUser(ctx.scene.session.state.name, chatId)
        await ctx.reply(`Добавил нового пользователя с именем ${ctx.scene.session.state.name} и чат айди ${chatId}\nВозвращаю в главное меню`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return await ctx.scene.enter(ctx.scene.session.state.sceneToGoBack)
    }
)

function checkUnick(key, value) {
    var allUsers = JSON.parse(fs.readFileSync(chatIdsPath, "utf-8"))
    var userToFind = allUsers.find(user => user[key] == value)
    if (userToFind) return userToFind
    return true
}

function addUser(name, chatId) {
    var data = JSON.parse(fs.readFileSync(chatIdsPath, "utf-8"))
    data.push({name, chatId})
    fs.writeFileSync(chatIdsPath, JSON.stringify(data, null, 4), "utf-8")
}

async function cancelAdding(ctx) {
    await ctx.reply("Добавление нового сотрудника отменено, возвращаю в главное меню")
    await ctx.scene.leave()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await ctx.scene.enter("editAllUserList")
}