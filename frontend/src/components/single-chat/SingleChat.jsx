import { Box, CircularProgress, FormControl, IconButton, Image, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider"
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../../config/chatLogics";
import ProfileModal from "../modals/profile-modal/ProfileModal";
import UpdateGroupChatModal from "../modals/update-group-chat-modal/UpdateGroupChatModal";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "../scrollable-chat/ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../../animations/typing.json";
import { GrAttachment } from "react-icons/gr";
import { IoCheckmarkSharp } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { TiAttachmentOutline } from "react-icons/ti";
import { MdReply } from "react-icons/md";
// import addNotification from "react-push-notification";
import serviceKey from "../../servcie_key.json"

// const ENDPOINT = "http://localhost:9000"

const ENDPOINT = process.env.REACT_APP_SOCKET_URL;

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState("");
    const [reply, setReply] = useState(null);

    const ref = useRef(null);

    useEffect(() => {
        if (messages.length) {
            ref.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "start"
            });
        }
    }, [messages.length]);

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const toast = useToast();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            setLoading(true);

            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            socket.emit("join chat", selectedChat._id);
        } catch (err) {
            console.log(err);
            toast({
                title: "Failed to load messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
        } finally {
            setLoading(false);
        }
    }

    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }



                const { data } = await axios.post("/api/message", {
                    content: newMessage,
                    file: file,
                    reply: reply?._id,
                    chatId: selectedChat._id
                }, config);

                if (data) {
                    setNewMessage("");
                    setFile("");
                    setReply(null);
                }

                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (err) {
                console.log(err);
                toast({
                    title: "Failed to send Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })
            }
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        // typing indicator logic
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    }

    const uploadFile = (pic) => {
        setUploading(true);

        if (pic === undefined) {
            toast({
                title: "Please select an image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })

            return;
        }

        if (pic.type === "image/jpeg" || pic.type === "image/png") {
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
            data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

            fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "post",
                body: data
            }).then(res => res.json())
                .then((data) => {
                    setFile(data.url.toString());
                    setUploading(false);
                })
        } else if (pic.type === "video/mp4" || pic.type === "video/mkv" || pic.type === "video/avi" || pic.type === "video/wmv" || pic.type === "video/flv" || pic.type === "video/webm" || pic.type === "audio/mp3" || pic.type === "audio/wav" || pic.type === "audio/mpeg") {
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
            data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

            fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/video/upload`, {
                method: "post",
                body: data
            })
                .then(res => res.json())
                .then((data) => {
                    setFile(data.url.toString());
                    setUploading(false);
                })
                .catch(err => {
                    console.log("err : ", err);
                })
        } else if (pic.type === "application/pdf" || pic.type === "application/doc" || pic.type === "application/ms-doc" || pic.type === "application/msword" || pic.type === "application/xlsx" || pic.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || pic.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || pic.type === "text/plain" || pic.type === "application/x-zip-compressed") {
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
            data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

            fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/raw/upload`, {
                method: "post",
                body: data
            }).then(res => res.json())
                .then((data) => {
                    setFile(data.url.toString());
                    setUploading(false);
                }).catch(err => {
                    console.log("error in documents upload : ", err)
                })
        } else {
            toast({
                title: "File Format Not Supported",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setUploading(false);
            return;
        }
    }

    const saveNotification = async (message) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`
            }
        }
        const { data } = await axios.post("/api/user/save-notification", {
            message: message,
            userId: user._id
        }, config);
    }

    // initializing socket very first at frontend
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", (chatId) => {
            if (selectedChatCompare && chatId === selectedChatCompare._id) {
                setIsTyping(true);
            }
        });
        socket.on("stop typing", () => setIsTyping(false));
    }, [])

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                // give notification
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                    // addNotification({
                    //     title: `New Message`,
                    //     message: newMessageReceived.content.length > 20 ? newMessageReceived.content.slice(0, 20) + "..." : newMessageReceived.content,
                    //     duration: 4000,
                    //     icon: "/logo192.png",
                    //     native: true
                    // });

                    // save notification in database

                    saveNotification(newMessageReceived);
                }
            } else {
                setMessages([...messages, newMessageReceived]);
            }
        })
    })

    return (
        <>
            {selectedChat ? (
                <>
                    <Text display="flex" alignItems="center" justifyContent={{ base: "space-between" }} fontFamily="Work sans" w="100%" pb={3} px={2} fontSize={{ base: "28px", md: "30px" }}>
                        <IconButton icon={<ArrowBackIcon />} display={{ base: "flex", md: "none" }} onClick={() => setSelectedChat(null)} />

                        {
                            !selectedChat.isGroupChat ? (
                                <>
                                    {getSender(user, selectedChat.users)}
                                    <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                                </>
                            )
                        }
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {
                            loading ? (<Spinner
                                size="xl"
                                w={20}
                                h={20}
                                margin="auto"
                                alignSelf="center"
                            />) : (
                                <>
                                    {/* messages  */}
                                    <div className="messages">
                                        <ScrollableChat messages={messages} setMessages={setMessages} reply={reply} setReply={setReply} />
                                        <div ref={ref} style={{ paddingTop: "100px" }} />
                                    </div>

                                </>
                            )
                        }

                        {reply && (
                            <div style={{ background: "#dddddd", padding: "10px", borderRadius: "15px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <MdReply size={20} className="text-[20px]" />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div style={{ fontWeight: "600" }}>
                                            {reply.sender.name > 24 ? reply.sender.name.slice(0, 24) + "..." : reply.sender.name}
                                        </div>

                                        <div style={{ color: "GrayText", fontSize: "14px" }}>
                                            {
                                                reply.content
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {file && (
                            <div className="w-full !flex items-center gap-x-2">
                                <TiAttachmentOutline className="text-[20px]" />
                                <p>
                                    {file.length > 24 ? file.slice(0, 24) + "..." : file}
                                </p>
                            </div>
                        )}

                        {isTyping ? (
                            <div>
                                <Lottie
                                    options={defaultOptions}
                                    width={40}
                                    height={20}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />
                            </div>
                        ) : (<></>)}
                        <FormControl onKeyDown={sendMessage} isRequired mt={3} display="flex" alignItems="center">
                            <Input placeholder="what's on your mind..." variant="filled" bg="#E0E0E0" value={newMessage} onChange={typingHandler} autoComplete="off" />

                            <div className="px-2 ml-2">
                                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", backgroundColor: "#BEE3F8", cursor: "pointer", borderRadius: "5px", margin: "0 5px" }} >
                                    <input disabled={uploading} type="file" onChange={e => uploadFile(e.target.files[0])} style={{ display: "none" }} />
                                    {uploading ? <Spinner size="sm" /> : (
                                        !file ? (<GrAttachment />) : (
                                            <IoCheckmarkDone size="1.2rem" color="green" className="font-semibold text-[18px]" />
                                        )
                                    )}
                                </label>
                            </div>
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Start a new chat
                    </Text>
                </Box>
            )
            }
        </>
    )
}

export default SingleChat