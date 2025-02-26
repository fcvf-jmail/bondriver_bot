const { Scenes } = require("telegraf")
const path = require("path")
var fs = require("fs")
var chatIdsPath = path.join(__dirname, "..", "chatIds.json")

const cancelButton = {text: "Отмена", callback_data: "cancel"}
var editAllUserList = new Scenes.BaseScene("editAllUserList")

function enterScene(ctx) {
    ctx.scene.session.state = {}
    ctx.reply("Что вы хотите сделать?", {reply_markup: {inline_keyboard: [[{text: "Добавить сотрудника", callback_data: "add"}], [{text: "Удалить сотрудника", callback_data: "delete"}], [cancelButton]]}})
}

editAllUserList.enter(ctx => enterScene(ctx))

editAllUserList.action("backToListSellection", ctx => enterScene(ctx))

editAllUserList.action("cancel", ctx => cancelAdding(ctx))

editAllUserList.action("delete", async ctx => {
    var allUsers = JSON.parse(fs.readFileSync(chatIdsPath, "utf-8"))
    var inline_keyboard = []
    var backButton = [{text: "Назад", callback_data: "backToListSellection"}]
    if(allUsers.length == 0) return await ctx.reply("Чтобы кого-то удалить, надо сначала кого-то добавить, пока, что список сотрудников пуст", {reply_markup: {inline_keyboard: [backButton]}})
    for(var user of allUsers) inline_keyboard.push([{text: user.name, callback_data: "remove" + user.chatId}])
    inline_keyboard.push(backButton)
    await ctx.reply("Кого удаляем?", {reply_markup: {inline_keyboard}})
})


editAllUserList.action(/remove/ig, ctx => {
    var data = JSON.parse(fs.readFileSync(chatIdsPath, "utf-8"))
    var chatId = ctx.match.input.split("remove")[1]
    data = data.filter(user => user.chatId != chatId)
    fs.writeFileSync(chatIdsPath, JSON.stringify(data, null, 4), "utf-8")
    ctx.reply("Сотрудник удален", {reply_markup: {inline_keyboard: [[{text: "Назад", callback_data: "delete"}]]}})
})

editAllUserList.action("add", ctx => ctx.scene.enter("addUserScene", {sceneToGoBack: "editAllUserList"}))

async function cancelAdding(ctx) {
    await ctx.reply("Изменение списка сотрудников отменено")
    await ctx.scene.leave()
}

module.exports = editAllUserList