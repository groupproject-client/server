const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

/*
PLAN:
- kondisi awal: kedua tim waiting for player
- ijinkan user connect
- ijinkan user menekan tombol select team
  - set status tim menjadi ready to play. Lock tim tersebut menggunakan id player
    - jika disconnect: reset status tim menjadi waiting for player
  - matikan tombol select team 2
  - tunggu user ke 2 menekan tombol select team
*/

let stateTeam = {
  team1Ready: false,
  user1: '',
  point1: 0,
  team2Ready: false,
  user2: '',
  point2: 0,
  gameState: false,
}

io.on('connection', (socket) => {
  console.log('a user connected')

  const userId = socket.id

  socket.emit('init', stateTeam)

  socket.on('tombol1', (_) => {
    console.log('Tombol 1 got clicked')
    stateTeam.team1Ready = true
    stateTeam.user1 = userId
    io.emit('reply_tombol1', stateTeam)
  })

  socket.on('tombol2', (_) => {
    console.log('Tombol 2 got clicked')
    stateTeam.team2Ready = true
    stateTeam.user2 = userId
    io.emit('reply_tombol2', stateTeam)
  })

  socket.on('startGame', (_) => {
    console.log('Start the game')
    stateTeam.gameState = true
  })

  socket.on('endGame', (_) => {
    console.log('End the game')
    stateTeam.team1Ready = false
    stateTeam.user1 = ''
    stateTeam.team2Ready = false
    stateTeam.user2 = ''
    stateTeam.gameState = false
    io.emit('backToMenu', stateTeam)
  })

  socket.on('disconnecting', (_) => {
    if (userId == stateTeam.user1) {
      io.emit('resetTeam1')
      stateTeam.team1Ready = false
      stateTeam.user1 = ''
      stateTeam.point1 = 0
    } else if (userId == stateTeam.user2) {
      io.emit('resetTeam2')
      stateTeam.team2Ready = false
      stateTeam.user2 = ''
      stateTeam.point2 = 0
    }
    console.log('user disconnected')
  })
})

http.listen(3000, () => {
  console.log('listening on *:3000')
})
