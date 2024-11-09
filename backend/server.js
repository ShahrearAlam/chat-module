import express from "express"
import http from "http"
const app = express();
const server = http.createServer(app);
import dotenv from "dotenv"
import mongoose from "mongoose"
import colors from "colors"
import { Server } from "socket.io"
import cors from "cors"
import FCM from "fcm-node"
import path from "path";

const serverKey = "AAAA1LiUmbA:APA91bG4OwUARY4L9FJZyzoYob6WOirhTTOjX4R0PpkIfG9QIpg7O6ICy7LbRkuxkt5GhntST8YdhRBKe6x6ZRZv5Qoi6ihzjbkSGTGJtos1T1J1qaIoEfqVRMWH2knmL81wD79pOO88"
const fcm = new FCM(serverKey);

// development socket config
// const io = new Server(server, {
//     pingTimeout: 60000,
//     cors: {
//         origin: "http://localhost:3000"
//     }
// })

// production socket config
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*"
    }
})

dotenv.config();


// routes
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import { notFound, errorHandler } from "./middlewares/errorMiddleware.js"
import User from "./models/userModel.js";
import firebase from "./firebase/index.js";

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("successfully connected to the database".magenta.bold);
    })
    .catch((err) => {
        console.log("Error connection database : ", err);
    })

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cors({
//     origin: [process.env.CLIENT_URL, process.env.IQSOCIAL_API_URL]
// }))

app.use(cors());
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// test route
app.get("/api/", (req, res) => {
    res.send("server is running");
})

// used only for vps deploy
const _dirname = path.dirname("");
const buildpath = path.join(_dirname, "../frontend/build");
app.use(express.static(buildpath));


const port = process.env.PORT || 9000;

server.listen(port, () => {
    console.log(`server is running on port ${port}`.yellow.bold);
})

io.on("connection", (socket) => {

    socket.on("hello", () => {
        // Sending a reply to the client
        socket.emit("reply", "Hello from the server!");
    });

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    })

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("user joined room : ", room);
    })

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users.length) return console.log("chat.users is not defined");

        chat.users.forEach(async (user) => {
            if (user._id === newMessageReceived.sender._id) return;

            const getUser = await User.findById(user._id);
            let notifications = getUser.notification;

            const existedMessage = notifications.find(n => n.chat._id === newMessageReceived.chat._id);

            if (!existedMessage) {
                notifications.unshift(newMessageReceived);

                const savedNotification = await User.findByIdAndUpdate(user._id, { notification: notifications }, { new: true });
            }

            try {
                let message = {
                    token: getUser.fcmToken.toString(),
                    notification: {
                        title: "New Message",
                        body: newMessageReceived.content.toString().length > 40 ? newMessageReceived.content.toString().slice(0, 40) + "..." : newMessageReceived.content.toString(),
                        // image: "https://www.freepnglogos.com/uploads/discord-logo-png/discord-will-provide-official-verification-esports-team-4.png"
                    }
                }
                const response = await firebase.messaging().send(message);

                console.log("message sent payload : ", response);
            } catch (err) {
                console.log(err);
            }

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    })

    socket.on("typing", (room) => socket.in(room).emit("typing", room));

    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // clean up
    socket.off("setup", () => {
        console.log("user disconnected");
        socket.leave(userData._id);
    })
})