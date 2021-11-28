const server = require('net').createServer();
let counter = 0;
let participents = {};
const PORT = process.env.PORT || 8383;

server.on('connection', (socket) => {
  socket.setEncoding('utf-8');
  socket.id = counter++;

  console.log('Client Connected!');

  socket.write('Please ENTER your chat name: ');

  socket.on('data', (data) => {
    if (!socket.name) {
      const name = data.toString().trim();
      socket.name = name;
      socket.write(`Hey there ${name}!\n`);
      const values = Object.values(participents);
      if (values.length)
        socket.write(`In the room: ${values.map((s) => s.name).join(', ')}\n`);
      else socket.write('You are the first! Waiting for others to join...\n');
      participents[socket.id] = socket;
      sendToAll(socket, `${name} joined the chat!\n`);
      return;
    }
    sendToAll(socket, data);
  });

  socket.on('end', () => {
    delete participents[socket.id];
    sendToAll(socket, 'Left the chat...\n');
  });
});

server.listen(PORT, () => console.log('Chat server is up!'));

function sendToAll(from, data) {
  Object.entries(participents).forEach(([id, p]) => {
    if (!!from) {
      from.id != id && p.write(`${from.name}: ${data}`);
    } else {
      p.write(`${data}`);
    }
  });
}
