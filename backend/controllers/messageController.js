import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

export const sendMessage = async (req, res) => {
    const { content, chatId, file, reply } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        file: file,
        reply: reply,
        chat: chatId
    }

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await message.populate([{
            path: "reply", populate: {
                path: "sender",
                model: "User"
            }
        }]);
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email fcmToken"
        });

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message
        });

        res.json(message);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
}

export const allMessages = async (req, res) => {
    const chatId = req.params.chatId;

    try {
        const messages = await Message.find({ chat: chatId }).populate("sender", "name pic email").populate("chat").populate([{
            path: "reply", populate: {
                path: "sender",
                model: "User"
            }
        }]);

        res.json(messages);
    } catch (err) {
        console.log(err);
        res.status(400);
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.body;

        const message = await Message.findById(messageId);

        console.log("message : ", message);
        console.log("current user : ", req.user);
        if (message && String(message.sender) === String(req.user._id)) {
            const deletedMessage = await Message.findByIdAndDelete(messageId);

            if (deletedMessage) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(400).json("Could Not Delete Message")
            }
        }

        res.status(400).json("Only Sender Can Delete Message");
    } catch (err) {
        console.log(err);

        res.status(500).json("Internal Server Error")
    }
}

export const editMessage = async (req, res) => {
    try {
        const { messageId, content } = req.body;

        const message = await Message.findById(messageId);

        console.log("message : ", message);
        console.log("content : ", content);

        if (message && String(message.sender) === String(req.user._id)) {
            const updatedMessage = await Message.findByIdAndUpdate(messageId, { content: content }, { new: true });

            if (updatedMessage) {
                return res.status(200).json(updatedMessage);
            } else {
                return res.status(400).json("Could Not Update Message")
            }
        }

        res.status(400).json("Only Sender Can Update Message");
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal Server Error")
    }
}

export const reactToMessage = async (req, res) => {
    try {
        const { messageId, react } = req.body;

        const message = await Message.findById(messageId);
        const reactions = message.reactions;

        const isExist = reactions.filter(r => r.userId !== req.user._id);

        let updatedReaction;

        if (isExist.length > 0) {
            // remove that user's reaction
            const currentReaction = isExist[0];

            if (currentReaction.react !== react) {
                const removeCurrentReaction = await Message.findByIdAndUpdate(messageId, {
                    $pull: {
                        reactions: {
                            userId: req.user._id
                        }
                    },
                }, { new: true });

                updatedReaction = await Message.findByIdAndUpdate(messageId, {
                    $addToSet: {
                        reactions: {
                            userId: req.user._id,
                            react: react
                        }
                    },
                }, { new: true });
                console.log("updated pre-exist react : ", updatedReaction);
                return res.status(200).json(updatedReaction)
            } else {
                updatedReaction = await Message.findByIdAndUpdate(messageId, {
                    $pull: {
                        reactions: {
                            userId: req.user._id
                        }
                    },
                }, { new: true });
                console.log("removed react : ", updatedReaction);
                return res.status(200).json(updatedReaction)
            }
        }

        updatedReaction = await Message.findByIdAndUpdate(messageId, {
            $addToSet: {
                reactions: {
                    userId: req.user._id,
                    react: react
                }
            },
        }, { new: true });
        console.log("added react : ", updatedReaction);
        return res.status(200).json(updatedReaction)
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal Server Error")
    }
}