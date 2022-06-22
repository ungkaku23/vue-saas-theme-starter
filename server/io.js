const io = require("socket.io")();

io.on("connection", (socket) => {
  console.log("user connected");
  /* socket.emit("message", { backend: "hey how are you?" });
  socket.on("another event", (data) => {
    console.log(data);
  }); */

  socket.on("disconnect", () => {
    console.log("user disconnected");
    io.emit("message", "user disconnected");
  });
});

module.exports = io;
