import User from "../models/userModel.js";
import { generateToken, generateSSOTokenForIqSocial } from "../config/generateToken.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import bcrypt from "bcryptjs";

export const SignUp = async (req, res) => {
    try {
        const { name, email, password, pic } = req.body;

        if (!name || !email || !password) {
            res.status(400).json("Please fill all fields");
        }

        const userExists = await User.findOne({ email: email })

        if (userExists) {
            return res.status(400).json("User already exists!");
        }


        const salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            name, email, password: hashedPassword, pic
        });

        const savedUser = await user.save();

        if (savedUser) {
            return res.status(201).json({
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                pic: savedUser.pic,
                token: generateToken(savedUser._id)
            })
        } else {
            return res.status(400).json("Sign Up Failed. Try Again Later");
        }
    } catch (err) {
        console.log(err);

        return res.status(500).json("Something Went Wrong!");
    }
}

export const authUser = async (req, res) => {
    try {
        const { email, password, fcmToken } = req.body;

        const user = await User.findOne({ email: email });
        console.log(user);


        if (user && (await user.matchPassword(password))) {
            if (fcmToken) {
                const updateToken = await User.findOneAndUpdate({ email: email }, { fcmToken: fcmToken }, { new: true });
            }
            return res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    pic: user.pic,
                    fcmToken: fcmToken,
                    chatWidgetApiToken: user.chatWidgetApiToken,
                    token: generateToken(user._id)
                },
                notification: user.notification
            })
        } else {
            return res.status(403).json("Invalid Email or Password");
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json("Something Went Wrong");
    }
}

export const loginWithIqSocial = async (req, res) => {
    const { username, userId, email, password, fcmToken, chatWidgetApiToken, profilePicture } = req.body;

    console.log("received from iq sonet backend : ", req.body);
    console.log(profilePicture)
    if (email) {
        const user = await User.findOne({ email: email });

        if (user) {
            console.log({ email, password });

            if (user && (await user.matchPassword(password))) {
                let updatedToken = fcmToken;

                if (fcmToken) {
                    const updatedUser = await User.findOneAndUpdate({ email: email }, { fcmToken: fcmToken }, { new: true });

                    updatedToken = updatedUser.fcmToken;
                    console.log('this is the updated token : \n', updatedToken)
                }


                const newApiToken = generateSSOTokenForIqSocial(user?._id);
                const updatedUserWithApiToken = await User.findOneAndUpdate({ email: email }, { chatWidgetApiToken: newApiToken, pic: profilePicture, iqSocialId : userId }, { new: true })

                return res.json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        pic: profilePicture,
                        fcmToken: updatedToken,
                        token: generateToken(user._id),
                        chatWidgetApiToken: updatedUserWithApiToken?.chatWidgetApiToken
                    },
                    notification: user.notification
                })
            } else {
                return res.status(403).json("Invalid Email or Password");
            }

            return res.status(200).json({
                success: true,
                user
            })
        } else {
            // registering new user
            try {
                if (!username || !email || !password) {
                    res.status(400).json("Please fill all fields");
                }

                const salt = await bcrypt.genSalt(10);
                let hashedPassword = await bcrypt.hash(password, salt);

                const user = new User({
                    name: username,
                    email,
                    password: hashedPassword,
                    pic: profilePicture,
                    iqSocialId: userId
                });

                const savedUser = await user.save();

                let chatWidgetApiToken = null;

                if (savedUser) {
                    chatWidgetApiToken = generateSSOTokenForIqSocial(savedUser._id);
                    await User.findByIdAndUpdate(savedUser._id, { chatWidgetApiToken: chatWidgetApiToken }, { new: true })
                }

                if (savedUser) {
                    return res.status(201).json({
                        user: {
                            _id: savedUser._id,
                            name: savedUser.name,
                            email: savedUser.email,
                            pic: savedUser.pic,
                            chatWidgetApiToken,
                            token: generateToken(savedUser._id)
                        }
                    })
                } else {
                    return res.status(400).json("Sign Up Failed. Try Again Later");
                }
            } catch (err) {
                console.log(err);

                return res.status(500).json("Something Went Wrong!");
            }
        }
    }

}

export const loginWithIqSocialSocialAuth = async (req, res) => {
    const { username, userId, email, password, fcmToken, chatWidgetApiToken, profilePicture } = req.body;
    console.log("received from iq sonet backend for social auth: ", req.body);
    console.log(profilePicture)

    try {
        if (!username || !email || !userId) {
            res.status(400).json("Email or Username or IqSocial User Id not defined");
        }

        const user = await User.findOne({ email: email });

        if (user) {
            let updatedToken = fcmToken;

            if (fcmToken) {
                const updatedUser = await User.findOneAndUpdate({ email: email }, { fcmToken: fcmToken }, { new: true });

                updatedToken = updatedUser.fcmToken;
                console.log('this is the updated token : \n', updatedToken)
            }

            const newApiToken = generateSSOTokenForIqSocial(user?._id);
            const updatedUserWithApiToken = await User.findOneAndUpdate({ email: email }, { chatWidgetApiToken: newApiToken, pic: profilePicture, iqSocialId : userId}, { new: true })
            return res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    pic: profilePicture,
                    fcmToken: updatedToken,
                    token: generateToken(user._id),
                    chatWidgetApiToken: updatedUserWithApiToken?.chatWidgetApiToken
                },
                notification: user.notification
            })

        } else {
            // registering new user
            try {
                if (!username || !email) {
                    res.status(400).json("Please fill all fields");
                }

                const user = new User({
                    name: username, email,
                    iqSocialId: userId,
                    pic: profilePicture,
                });

                const savedUser = await user.save();

                let chatWidgetApiToken = null;

                if (savedUser) {
                    chatWidgetApiToken = generateSSOTokenForIqSocial(savedUser._id);

                    await User.findByIdAndUpdate(savedUser._id, { chatWidgetApiToken: chatWidgetApiToken }, { new: true })
                }

                if (savedUser) {
                    return res.status(201).json({
                        user: {
                            _id: savedUser._id,
                            name: savedUser.name,
                            email: savedUser.email,
                            pic: savedUser.pic,
                            chatWidgetApiToken,
                            token: generateToken(savedUser._id)
                        }
                    })
                } else {
                    return res.status(400).json("Sign Up Failed. Try Again Later");
                }
            } catch (err) {
                console.log(err);

                return res.status(500).json("Something Went Wrong!");
            }
        }


    } catch (err) {
        console.log(err);
        res.status(500).json("Internal Server Error!");
    }
}

export const resetPasswordWithIqSocial = async (req, res) => {
    console.log("password reset request from iq social backend");
    const { userId, email, username, newPassword } = req.body;
    console.log('password reset data : ', req.body)
    if (!email || !newPassword) {
        return res.status(400).json("Email or Password Not Defined!");
    }

    const user = await User.findOne({ email: email });

    if (user) {
        const salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(newPassword, salt);
        const updatedUser = await User.findOneAndUpdate({ iqSocialId: userId }, { password: hashedPassword }, { new: true });

        return res.status(200).json({
            success: true
        })
    } else {
        return res.status(404).json("User Not Found!");
    }

}

export const updatePasswordFromIqSocial = async (req, res) => {
    const { email, password, userId } = req.body;

    if (!email || !password) {
        return res.status(400).json("Email or Password Not Defined!");
    }

    const user = await User.findOne({ email: email });

    if (user) {
        const salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);
        const updatedUser = await User.findOneAndUpdate({ iqSocialId: userId }, { password: hashedPassword }, { new: true });

        return res.status(200).json({
            success: true
        })
    } else {
        return res.status(404).json("User Not Found!");
    }
}

export const allUsers = async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
        ]
    } : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select("name email pic");

    res.json(users);
}

export const getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const notifications = user.notification

        // console.log("new notifications : ", notifications);
        res.status(200).json(notifications);

    } catch (err) {
        console.log(err);
        res.status(401);
    }
}

export const saveNotification = async (req, res) => {
    const { message } = req.body;

    try {
        const user = await User.findById(req.user._id);
        let notifications = user.notification;

        const existedMessage = notifications.find(n => n.chat._id === message.chat._id);

        if (!existedMessage) {
            notifications.unshift(message);

            const savedNotification = await User.findByIdAndUpdate(req.user._id, { notification: notifications }, { new: true });

            res.json({ success: true });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json("Error Saving Notification");
    }

}

export const removeNotification = async (req, res) => {
    const { chatId } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        const user = await User.findById(req.user._id);

        const notifications = user.notification;
        console.log("notificaons : ", notifications);
        let removedNotifications = notifications.filter(n => String(n.chat._id) !== String(chat._id));



        console.log("removed notificaitions : ", removedNotifications)

        const savedNotification = await User.findByIdAndUpdate(req.user._id, { notification: removedNotifications }, { new: true });

        res.json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(400).json("Error Saving Notification");
    }

}

export const saveFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;

        const user = await User.findByIdAndUpdate(req.user._id, { fcmToken: fcmToken }, { new: true });

        res.status(200).json({
            fcmToken: user.fcmToken
        })

    } catch (err) {
        console.log(err);
        res.status(400);
    }
}
