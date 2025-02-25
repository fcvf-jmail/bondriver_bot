const { Scenes } = require('telegraf')
const { createYandexDiskFolder, uploadFilesToDisk } = require('./yandexDiskFunctions')
require('dotenv').config()

const cancelButton = { text: "Отмена", callback_data: "cancelAdding" }

const typeOfReportInlineKeyboard = [[{ text: "Доставка", callback_data: "delivery" }, { text: "Вывоз", callback_data: "export" }], [cancelButton]]
const addPhotoesInlineKeyboard = [[{ text: "Готово", callback_data: "photoesUploaded" }], [cancelButton]]
const yesNoInlineKeyboard = [[{text: "Да", callback_data: "yes"}, {text: "Нет", callback_data: "no"}], [cancelButton]]

module.exports = new Scenes.WizardScene("addReportScene", 
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        await ctx.reply("Добрый день! Заполните пожалуйста отчет. Укажите дату рейса", {reply_markup: { inline_keyboard: [[cancelButton]], resize_keyboard: true }})
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        ctx.scene.session.state.date = ctx.message.text
        await ctx.reply("Укажите наименование контрагента", {reply_markup: { inline_keyboard: [[cancelButton]], resize_keyboard: true }})
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        ctx.scene.session.state.nameOfCounteragent = ctx.message.text
        await ctx.reply("Вы осуществляете доставку или вывоз?", {reply_markup: {resize_keyboard: true, inline_keyboard: typeOfReportInlineKeyboard }})
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        if (!["delivery", "export"].includes(ctx?.callbackQuery?.data)) return await ctx.reply("Выберите одну из кнопок\nВы осуществляете доставку или вывоз", { reply_markup: { inline_keyboard: typeOfReportInlineKeyboard, resize_keyboard: true }})
        ctx.scene.session.state.typeOfReport = ctx.callbackQuery.data == "delivery" ? "Доставка" : "Вывоз"
        await ctx.reply("Загрузите фотографии с объекта, после загрузки нажмите кнопку \"Готово\"", {reply_markup: {resize_keyboard: true, inline_keyboard: addPhotoesInlineKeyboard }})
        ctx.scene.session.state.photoes = []
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        
        if (ctx?.callbackQuery?.data == "photoesUploaded") {
            if (ctx.scene.session.state.photoes.length == 0) return await ctx.reply("Нужно добавить хотя бы одну фотографию")
            
            if (ctx.scene.session.state.typeOfReport == "Доставка") ctx.wizard.next()
            else ctx.wizard.selectStep(ctx.wizard.cursor + 4);
            
            return await ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
        
        if (!ctx?.message?.photo) return await ctx.reply("Отправьте фотографии с объекта, после загрузки нажмите кнопку \"Готово\"", {reply_markup: {resize_keyboard: true, inline_keyboard: addPhotoesInlineKeyboard }})
        if (ctx.scene.session.state.photoes.length < 9) return ctx.scene.session.state.photoes.push(ctx.message.photo[ctx.message.photo.length - 1].file_id)
        ctx.scene.session.state.photoes = []
        return await ctx.reply("Нельзя добавить больше 9 фото. Загрузи заново все необходимые фотографии", {reply_markup: {resize_keyboard: true, inline_keyboard: addPhotoesInlineKeyboard }})
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        await ctx.reply("Отправьте геолокацию (через телеграм)", {reply_markup: { inline_keyboard: [[cancelButton]], resize_keyboard: true }})
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        if (!ctx.message.location) return await ctx.reply("Отправьте геолокацию через телеграм")
        ctx.scene.session.state.geolocation = { latitude: ctx.message.location.latitude, longitude: ctx.message.location.longitude }
        await ctx.reply("Вы принимали оплату на объекте?", { reply_markup: { inline_keyboard: yesNoInlineKeyboard, resize_keyboard: true }})
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        if (!["yes", "no"].includes(ctx?.callbackQuery?.data)) return await ctx.reply("Выберите одну из кнопок\nВы принимали оплату на объекте?", { reply_markup: { inline_keyboard: yesNoInlineKeyboard, resize_keyboard: true }})

        if (ctx?.callbackQuery?.data == "yes") {
            await ctx.reply("Укажите сумму", {reply_markup: { inline_keyboard: [[cancelButton]], resize_keyboard: true }})
            return ctx.wizard.next()
        }
        
        await ctx.reply("Клиент подписал документы?", { reply_markup: { resize_keyboard: true, inline_keyboard: yesNoInlineKeyboard } })
        return ctx.wizard.selectStep(ctx.wizard.cursor + 2)
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        if (!ctx?.message?.text && !ctx?.callbackQuery?.data == "photoesUploaded") return await ctx.reply("Укажите сумму текстом")
        if(ctx?.message?.text) ctx.scene.session.state.summ = ctx?.message?.text
        await ctx.reply("Клиент подписал документы?", { reply_markup: { resize_keyboard: true, inline_keyboard: yesNoInlineKeyboard } })
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        if (!ctx?.callbackQuery?.data) return await ctx.reply("Выберите одну из кнопок\nКлиент подписал документы?", { reply_markup: { resize_keyboard: true, inline_keyboard: yesNoInlineKeyboard } })
        ctx.scene.session.state.documentsAreSigned = ctx.callbackQuery.data
        await ctx.reply("Оставьте комментарий, если на объекте возникли сложности. Если комментарий не нужен, нажмите кнопку продолжить", { reply_markup: { resize_keyboard: true, inline_keyboard: [[{ text: "Продолжить", callback_data: "continue" }], [ cancelButton ]]} })
        return ctx.wizard.next()
    },
    async ctx => {
        if (ctx?.callbackQuery?.data == "cancelAdding") return await cancelAdding(ctx);
        if (ctx?.callbackQuery?.data == "continue") ctx.scene.session.state.comment = "Коммнетарий отсутствует"
        else ctx.scene.session.state.comment = ctx?.message?.text

        if(ctx?.message?.location) ctx.scene.session.state.geolocation = { latitude: ctx.message.location.latitude, longitude: ctx.message.location.longitude }

        const messageText = await generateMessageText(ctx)

        var mediagroup = await generateMediaGroup(ctx.scene.session.state.photoes, messageText)
        
        await ctx.telegram.sendMediaGroup(process.env.chat_to_send, mediagroup)
        await ctx.reply("Спасибо за выполненный рейс!\n:)\nЕсли захотите отправить новый отчет напишите /send_report")
        
        var folderName = await generateFolderName(ctx)
        
        await createYandexDiskFolder(folderName)
        
        for (var fileId of ctx.scene.session.state.photoes) {
            var photoUrl = (await ctx.telegram.getFileLink(fileId)).href
            await uploadFilesToDisk(folderName, photoUrl)
        }

        await ctx.scene.leave()
    }
)

async function cancelAdding(ctx) {
    await ctx.reply("Добавление отчета отменено, вы в любой момент можете его добавить написав команду /send_report", {reply_markup: {resize_keyboard: true, remove_keyboard: true}})
    await ctx.scene.leave()
}

async function generateMessageText(ctx) {
    var messageText = `${ctx.from.first_name}${ctx.from.username ? ` @${ctx.from.username}` : ""}\nДата ${ctx.scene.session.state.date}\n${ctx.scene.session.state.typeOfReport}\n\nКонтрагент - ${ctx.scene.session.state.nameOfCounteragent}\n\n`

    if (ctx.scene.session.state.typeOfReport == "Доставка") {
        messageText += `📍Геолокация: <a href="https://yandex.ru/maps/?text=${ctx.scene.session.state.geolocation.latitude},${ctx.scene.session.state.geolocation.longitude}">${ctx.scene.session.state.geolocation.latitude}, ${ctx.scene.session.state.geolocation.longitude}</a>\n`
        if (ctx.scene.session.state.summ) messageText += `🫰Сумма: ${ctx.scene.session.state.summ}\n`
    }
    
    messageText += `${ctx.scene.session.state.documentsAreSigned == "yes" ? "📋Документы подписаны" : "📋Документы не подписаны"}`
    if(ctx.scene.session.state.comment) messageText += `\n✏Комментарий: ${ctx.scene.session.state.comment}`
    
    return messageText
}

async function generateMediaGroup(photoes, messageText) {
    var mediagroup = []
    
    for (var i = 0; i < photoes.length; i++) mediagroup.push({ type: "photo", media: photoes[i] })
    
    mediagroup[0].caption = messageText
    mediagroup[0].parse_mode = "html"
    
    return mediagroup
}

async function generateFolderName(ctx) {
    var folderName = `/Доставки и вывозы/${ctx.scene.session.state.date}|${ctx.scene.session.state.nameOfCounteragent}|${ctx.from.first_name}${ctx.from.username ? ` @${ctx.from.username}` : ""}`
    if(ctx.scene.session.state.geolocation) folderName += `|${ctx.scene.session.state.geolocation.latitude}, ${ctx.scene.session.state.geolocation.longitude}`
    
    return folderName
}