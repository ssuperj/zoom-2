import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home.html"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomNum, done) => {
    socket.join(roomNum);
    done();
    socket.to(roomNum).emit("welcome");
  });
  socket.on("change_nick", (nickname, done) => {
    socket["nickname"] = nickname;
    done();
  });
  socket.on("new_message", (message, roomNum, done) => {
    socket.to(roomNum).emit("new_message", `${socket.nickname}: ${message}`);
    done(`You: ${message}`);
  });
  socket.on("offer", (offer, roomNum) => {
    socket.to(roomNum).emit("offer", offer);
  });
  socket.on("answer", (answer, roomNum) => {
    socket.to(roomNum).emit("answer", answer);
  });
  socket.on("ice", (ice, roomNum) => {
    socket.to(roomNum).emit("ice", ice);
  });
});

// wsServer.on("connection", (socket) => {
//   socket.on("join_room", (roomName, done) => {
//     socket.join(roomName);
//     done();
//     socket.to(roomName).emit("welcome");
//   });
// });

// server.listen(process.env.PORT);
httpServer.listen(3100);
