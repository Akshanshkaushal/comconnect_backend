const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const taskRoutes = require("./routes/taskAllocatorRoutes.js");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const Connection = require("./config/db");

dotenv.config();

const app = express();

app.use(
cors({
origin: "*",
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
})
);

app.options("*", cors());

app.use(express.json());

const PORT = process.env.PORT || 5001;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

Connection(username, password);

app.get("/", (req, res) => {
res.status(200).send("Welcome to the API");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
console.log(`Server running on PORT ${PORT}...`);
});

const io = require("socket.io")(server, {
pingTimeout: 60000,
cors: {
origin: "*",
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
},
});

io.on("connection", (socket) => {
console.log("Connected to socket.io");

socket.on("setup", (userData) => {
try {
if (!userData || !userData._id) {
console.log("Invalid setup payload:", userData);
socket.emit("socket_error", {
message: "Invalid setup payload",
});
return;
}


  socket.join(userData._id.toString());

  console.log(`User connected: ${userData._id}`);

  socket.emit("connected");
} catch (err) {
  console.error("Setup Error:", err);
}


});

socket.on("join chat", (room) => {
try {
if (!room) {
console.log("Invalid room:", room);
return;
}


  socket.join(room.toString());

  console.log("User Joined Room:", room);
} catch (err) {
  console.error("Join Chat Error:", err);
}


});

socket.on("typing", (room) => {
if (!room) return;
socket.in(room).emit("typing");
});

socket.on("stop typing", (room) => {
if (!room) return;
socket.in(room).emit("stop typing");
});

socket.on("new message", (newMessageReceived) => {
try {
const chat = newMessageReceived?.chat;


  if (!chat || !chat.users) {
    console.log("chat.users not defined");
    return;
  }

  chat.users.forEach((user) => {
    if (
      user?._id?.toString() ===
      newMessageReceived?.sender?._id?.toString()
    ) {
      return;
    }

    socket
      .in(user._id.toString())
      .emit("message recieved", newMessageReceived);
  });
} catch (err) {
  console.error("New Message Error:", err);
} 

});

socket.on("disconnect", () => {
console.log("USER DISCONNECTED");
});

socket.on("error", (err) => {
console.error("Socket Error:", err);
});
});
