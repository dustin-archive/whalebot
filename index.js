
const micro = require('micro')
const tmi = require('tmi.js')

const { createReadStream, readFile } = require('fs')
const { exec } = require('child_process')
const WebSocket = require('ws')

//
// # Twitch
// =============================================================================

const twitch = new tmi.client({
  options: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: 'whaaaley',
    password: 'oauth:p3lw983modwqcbibbb4xm437ikvp5f'
  },
  channels: ['#whaaaley']
})

twitch.connect()

//
// # Micro
// =============================================================================

const server = micro(async (req, res) => {
  if (req.url === '/') {
    readFile('h8ball.html', (err, data) => {
      if (err) console.error(err)
      res.end(data)
    })
  } else {
    createReadStream('./' + req.url).pipe(res)
  }
})

const ws = new WebSocket.Server({ server })

ws.on('connection', client => {
  client.on('error', err => console.error(err))

  client.on('message', body => exec(`say ${body}`))

  twitch.on('message', (channel, userstate, message, self) => {
    if (message.startsWith('!eightball ')) {
      client.send(JSON.stringify({
        question: `${userstate.username} asks: ${message.slice(10)}`
      }))
    }
  })
})

server.listen(3000)
