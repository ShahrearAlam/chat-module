import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("userId params not sent with request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password").populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
}

export const fetchChats = async (req, res) => {
    try {
        Chat.find({
            users: {
                $elemMatch: { $eq: req.user._id }
            }
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email fcmToken",
                });

                res.status(200).json(results);
            })

    } catch (err) {
        console.log(err);
        res.status(400);
    }
}

export const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({
            message: "Please fill all fields"
        })
    }

    var users = req.body.users;

    if (users.length < 1) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        return res.status(200).json(fullGroupChat);
    } catch (err) {
        console.log(err);
        res.status(400);
    }

}

export const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName
        },
        {
            new: true
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!updatedChat) {
        res.status(404);

    } else {
        res.json(updatedChat);
    }
}

export const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId }
        },
        {
            new: true
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!added) {
        res.status(400);
        console.log("Chat Not Found");
    } else {
        res.json(added);
    }
}

export const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId }
        },
        {
            new: true
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!removed) {
        res.status(400);
        console.log("Chat Not Found");
    } else {
        res.json(removed);
    }
}

export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.body;

        const chat = await Chat.findById(chatId);

        console.log("chat : ", chat);

        if (chat) {
            if (chat.users.length === 1) {
                const deletedChat = await Chat.findByIdAndDelete(chatId);
                const messagesOfThatChat = await Message.deleteMany({ chat: chatId });
            } else {
                const deletedChat = await Chat.findByIdAndUpdate(chatId,
                    { $pull: { users: req.user._id } },
                    { new: true }
                );
            }

            if (deleteChat) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(400).json("Could Not Delete Chat")
            }
        }

        res.status(400).json("Only Users In This Room Can Delete This Chat");
    } catch (err) {
        console.log(err);

        res.status(500).json("Internal Server Error")
    }
}