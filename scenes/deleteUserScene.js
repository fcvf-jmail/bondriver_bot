const { Scenes } = require("telegraf");
const { getAllUsers, deleteUser } = require("../passwordManager")

const deleteUserScene = new Scenes.WizardScene(
    "deleteUserScene",
    async (ctx) => {
        const users = getAllUsers()

        if (users.length === 0) {
            await ctx.reply("Список пользователей пуст");
            return ctx.scene.leave();
        }

        var inlineKeyboard = []
        
        users.forEach(user => inlineKeyboard.push([{text: `${user.firstName} @${user.username}`, callback_data: `select_${user.chatId}`}]));

        await ctx.reply("Выберите пользователя для удаления:", { reply_markup: { inline_keyboard: inlineKeyboard, resize_keyboard: true }});

        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.callbackQuery || !ctx.callbackQuery.data.startsWith("select_")) return;

        ctx.scene.session.state.chatIdToDelete = ctx.callbackQuery.data.split("_")[1];

        await ctx.reply("Вы уверены, что хотите удалить пользователя?", {reply_markup: {inline_keyboard: [[{text: "Да", callback_data: "confirmDelete"}], [{text: "Отмена", callback_data: "cancelDeleting"}]]}});
    },
    async (ctx) => {
        if (!ctx.callbackQuery) return;

        if (ctx.callbackQuery.data === "confirmDelete") {
            deleteUser(ctx.scene.session.state.chatIdToDelete);
            await ctx.reply("Пользователь удалён");
        }
        
        else if (ctx.callbackQuery.data == "cancelDeleting") await ctx.reply("Удаление отменено");

        return ctx.scene.leave();
    }
);

module.exports = deleteUserScene;
