const axios = require("axios");
const path = require("path");
require('dotenv').config()


async function createYandexDiskFolder(folderName) {
    const url = `https://cloud-api.yandex.net/v1/disk/resources?path=${folderName}`
    const options = { method: "PUT", headers: { "Authorization": `OAuth ${process.env.yandex_token}` } };

    try {
        const response = await axios(url, options);
        if (response.data) return response.data;
        else console.log(`Ошибка: ${response.status}\n\nОтвет: ${JSON.stringify(response.data)}`);
    } 
    catch (error) {
        console.error("Ошибка запроса:", error.response ? error.response.data : error.message);
    }
}

async function uploadFilesToDisk(folderName, photoUrl) {
    try {
        const url = "https://cloud-api.yandex.net/v1/disk/resources/upload";
    
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `OAuth ${process.env.yandex_token}`
        };
    
        const fileName = path.basename(photoUrl);
    
        const params = {
            path: `${folderName}/${fileName}`,
            url: photoUrl
        };
    
        axios.post(url, undefined, { headers, params })
        .then(response => {
            console.log("Файл загружен: ", response.data);
        })
        .catch(error => {
            console.error("Ошибка:", error.response ? error.response.data : error.message);
        });
    }

    catch (error) {
        console.error("Ошибка запроса:", error.response ? error.response.data : error.message);
    }
}

module.exports = { createYandexDiskFolder, uploadFilesToDisk }