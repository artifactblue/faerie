# Morphling

Line bot API for creating evenything

### Technical stack

- Adapter
  - Hubot
  - Hubot-line-messaging-api

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

### Postgres settings

```
-- install postgres
homebrew install postgres

-- set DATABASE_URL
export DATABASE_URL=postgres://...

-- connect to postgres on heroku
heroku pg:psql DATABASE_URL --app morphling

```

### Heroku settings

```
heroku config:add HUBOT_NAME=${your_bot_name}
heroku config:add HUBOT_LINE_TOKEN=${your_token}
heroku config:add LINE_CHANNEL_SECRET=${CHANNEL_SECRET}
heroku config:add HUBOT_HEROKU_KEEPALIVE_URL=
```

### Heroku-Redis

Reference: https://devcenter.heroku.com/articles/heroku-redis

```
heroku redis:cli -a {app} -c {app}
```

### Debug on Localhost

```
-- use localhost setting
export HUBOT_HEROKU_KEEPALIVE_URL=https://2919a97d.ngrok.io
export HUBOT_LINE_CHANNEL_ID=
export HUBOT_LINE_TOKEN=
export HUBOT_NAME=morphling
export LINE_CHANNEL_SECRET=
export DATABASE_URL=
export REDIS_URL=
```

```
-- install ngork
npm install ngrok -g
-- hubot default port 8080
ngrok http 8080
-- copy ngork https to line webhook

-- run morphling
bin/hubot -a line-messaging-api
```

### Debug on Heroku

```
heroku config:add HUBOT_LOG_LEVEL=debug
heroku logs --tail
```

### Message format

```
2017-01-08T16:55:47.625528+00:00 app[web.1]: message:  StickerMessage {
2017-01-08T16:55:47.625550+00:00 app[web.1]:   user:
2017-01-08T16:55:47.625551+00:00 app[web.1]:    User {
2017-01-08T16:55:47.625552+00:00 app[web.1]:      id: 'U33823165fc452e43a0a66ad60fba52bf',
2017-01-08T16:55:47.625553+00:00 app[web.1]:      name: 'U33823165fc452e43a0a66ad60fba52bf' },
2017-01-08T16:55:47.625554+00:00 app[web.1]:   stickerId: '1',
2017-01-08T16:55:47.625554+00:00 app[web.1]:   packageId: '4',
2017-01-08T16:55:47.625555+00:00 app[web.1]:   id: '5473772221994',
2017-01-08T16:55:47.625555+00:00 app[web.1]:   replyToken: '45de1e2bb62445dbb5a351fd32c34793',
2017-01-08T16:55:47.625556+00:00 app[web.1]:   done: '1',
2017-01-08T16:55:47.625556+00:00 app[web.1]:   room: undefined,
2017-01-08T16:55:47.625557+00:00 app[web.1]:   type: 'sticker' }

2017-01-08T16:55:47.625561+00:00 app[web.1]: result:  false

2017-01-08T16:55:47.626156+00:00 app[web.1]: message:  CatchAllMessage {
2017-01-08T16:55:47.626158+00:00 app[web.1]:   message:
2017-01-08T16:55:47.626159+00:00 app[web.1]:    StickerMessage {
2017-01-08T16:55:47.626159+00:00 app[web.1]:      user:
2017-01-08T16:55:47.626160+00:00 app[web.1]:       User {
2017-01-08T16:55:47.626160+00:00 app[web.1]:         id: 'U33823165fc452e43a0a66ad60fba52bf',
2017-01-08T16:55:47.626161+00:00 app[web.1]:         name: 'U33823165fc452e43a0a66ad60fba52bf' },
2017-01-08T16:55:47.626161+00:00 app[web.1]:      stickerId: '1',
2017-01-08T16:55:47.626162+00:00 app[web.1]:      packageId: '4',
2017-01-08T16:55:47.626162+00:00 app[web.1]:      id: '5473772221994',
2017-01-08T16:55:47.626163+00:00 app[web.1]:      replyToken: '45de1e2bb62445dbb5a351fd32c34793',
2017-01-08T16:55:47.626163+00:00 app[web.1]:      done: '1',
2017-01-08T16:55:47.626164+00:00 app[web.1]:      room: undefined,
2017-01-08T16:55:47.626165+00:00 app[web.1]:      type: 'sticker' },
2017-01-08T16:55:47.626165+00:00 app[web.1]:   user:
2017-01-08T16:55:47.626166+00:00 app[web.1]:    User {
2017-01-08T16:55:47.626166+00:00 app[web.1]:      id: 'U33823165fc452e43a0a66ad60fba52bf',
2017-01-08T16:55:47.626167+00:00 app[web.1]:      name: 'U33823165fc452e43a0a66ad60fba52bf' },
2017-01-08T16:55:47.626168+00:00 app[web.1]:   done: false,
2017-01-08T16:55:47.626168+00:00 app[web.1]:   room: undefined }
```

### Line API list

Reference : https://devdocs.line.me/en/#messaging-api
