# Morphling

Line bot API for creating evenything

### Technical stack

- Adapter
  - Hubot
  - Hubot-line-messaging

- Server
  - Heroku

- Catch
  - Redis
  
- RDB
  - PostgreSQL
  
- Library
  - Jieba

### Line settings

https://business.line.me/zh-hant/services/bot

```
Webhook URL: heroku host name
```

### Heroku settings

```
heroku config:add HUBOT_NAME=${your_bot_name}
heroku config:add HUBOT_LINE_TOKEN=${your_token}
heroku config:add LINE_CHANNEL_SECRET=${CHANNEL_SECRET}
```

### Debug on Heroku

```
heroku config:add HUBOT_LOG_LEVEL=debug
heroku logs --tail
```
