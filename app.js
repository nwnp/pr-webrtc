const express = require("express");
const app = express();
const http = require("http");
const { v4: uuidV4 } = require("uuid");

const fs = require("fs");
const server = http.createServer(
  {
    key: fs.readFileSync("./private.pem"),
    cert: fs.readFileSync("./public.pem"),
  },
  app
);

const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res, next) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.io(roomId).emit("user-disconnected", userId);
    });

    socket.on("chat message", (message) => {
      console.log("message: " + message);
      // io.broadcast.emit("broadcast", "hi");
      io.emit("chat message", message);
    });
  });
});

server.listen(8080, () => {
  console.log("8080번에서 대기 중...");
});
