
  

# Как получить яндекс токен
1\) [Входим](https://id.yandex.ru/) в яндекс аккаунт  
2\) Переходим по ссылке https://oauth.yandex.ru/client/new/  
3\) Вписываем в поле "Название вашего сервиса" что-нибудь  
4\) В поле "Платформы приложения" выбираем "Веб-сервисы"  
5\) В "Redirect URI" вписываем "https://oauth.yandex.ru/verification_code"  
6\) В поле "Доступ к данным" последовательно вписываем "Запись в любом месте на Диске", "Чтение всего Диска", "Доступ к информации о Диске"  
7\) Нажимаем "Создать приложение"  
8\) Вписываем client id в ссылку https://oauth.yandex.ru/authorize?response_type=token&client_id= и переходим по ней  
9\) Копируем токен  