import { Avatar, Button, Image, Menu, MenuButton, MenuItem, MenuList, Spinner, Tooltip, filter, useToast } from "@chakra-ui/react"
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../../config/chatLogics"
import { ChatState } from "../../context/ChatProvider"
import PreviewFileModal from "../modals/preview-file-modal/PreviewFileModal";
import { IoDocuments } from "react-icons/io5";
import { FaAngleDown, FaLaughSquint } from "react-icons/fa";
import EditMessageModal from "../modals/edit-message-modal/EditMessageModal";
import { GoSmiley } from "react-icons/go";
import { AiOutlineLike } from "react-icons/ai";
import { FaFaceAngry, FaRegFaceSadCry } from "react-icons/fa6";
import axios from "axios";
import { useEffect, useState } from "react";
import { AiFillLike } from "react-icons/ai";
import { MdReply } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";

const MessageCard = ({ messages, setMessages, m, i, reply, setReply }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(null);
    const [currentReact, setCurrentReact] = useState(null);
    const [reactions, setReactions] = useState([]);

    const { user, chats, setChats } = ChatState();
    const toast = useToast();

    const getExtension = (filename) => {
        const extension = filename.split('.').pop();
        // console.log(extension);

        switch (extension) {
            case 'png':
                return 'jpg';
            case 'gif':
                return 'jpg';
            case 'jpeg':
                return 'jpg';
            case 'zip':
                return 'doc';
            case 'rar':
                return 'doc';
            case 'mp4':
                return 'mp4';
            case 'flv':
                return 'mp4';
            case 'wmv':
                return 'mp4';
            case 'mkv':
                return 'mp4';
            case 'avi':
                return 'mp4';
            case 'webm':
                return 'mp4';
            case 'mp3':
                return 'mp3';
            case 'wav':
                return 'mp3';
            case 'mpeg':
                return 'mp3';
            case 'pdf':
                return 'doc';
            case 'pptx':
                return 'doc';
            case 'docx':
                return 'doc';
            case 'xlsx':
                return 'doc';
            case 'txt':
                return 'doc';
            default:
                return extension;
        }
    }

    const deleteMessage = async (message) => {
        setCurrentMessage(message);

        try {
            setIsDeleting(true);
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.post("/api/message/delete", { messageId: message._id }, config);

            if (data.success) {
                const filteredArr = messages.filter(m => m._id !== message._id);

                setMessages(filteredArr);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsDeleting(false);
        }

    }

    const handleReact = async (message, react) => {
        console.log("message to react : ", message);
        // console.log("reaction : ", react);

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.post("/api/message/react", { messageId: message._id, react }, config);

            if (data.reactions.length > 0) {
                // let filteredArrWithOutUser = reactions.filter(r => r.userId !== user._id);
                // let filteredArrWithOutUser = data.reactions.map(r => {
                //     for (let i = 0; i <= data.reactions.length; i++) {
                //         console.log(reactions)
                //         if (reactions[i]?.userId !== user?._id) {
                //             return r;
                //         }
                //     }
                // });
                let updatedArr = data.reactions;

                function updateCurrentReactions(array, userId, react) {
                    for (let i = 0; i < array.length; i++) {
                        if (array[i].userId === userId) {
                            array[i].react = react;
                            // Assuming there's only one person with the given name
                            break;
                        }
                    }
                }

                for(let i= 0; i < data.reactions.length; i++){
                    updateCurrentReactions(updatedArr, data.reactions[i]?.userId, data.reactions[i]?.react)
                }
                setReactions(updatedArr);
            } else {
                setReactions(data.reactions)
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleReply = async (message) => {
        setReply(message);
        console.log(message)
    }

    // useEffect(() => {
    //     const filteredArr = m.reactions.filter(r => r.userId === user._id);

    //     if (filteredArr.length > 0) {
    //         setCurrentReact(filteredArr[0].react);
    //     }
    // }, [])

    useEffect(() => {
        const filteredArr = m.reactions.slice(0, 3);

        console.log(filteredArr);
        setReactions(filteredArr);
    }, [])


    return (
        <div style={{ display: "flex", marginBottom: "10px" }}>
            {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                    <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                        <Avatar
                            mt="7px"
                            mr={1}
                            size="sm"
                            cursor="pointer"
                            name={m.sender.name}
                            src={m.sender.pic}
                        />
                    </Tooltip>
                )}

            <div style={{
                backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                    }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",

            }}>
                <div style={{ cursor: "pointer" }}>
                    {m.file && (
                        <>
                            {getExtension(m.file) === "doc" && (
                                <PreviewFileModal file={m.file} extension={getExtension(m.file)}>
                                    <IoDocuments size={200} className="!text-[24px]" />
                                </PreviewFileModal>
                            )}

                            {getExtension(m.file) === "jpg" && (
                                <PreviewFileModal file={m.file} extension={getExtension(m.file)}>
                                    <Image src={m.file} alt={m.file} width={250} height={180} className="w-[350px] h=[150px] object-cover rounded-md my-2" />

                                </PreviewFileModal>
                            )}

                            {
                                getExtension(m.file) === "mp4" && (
                                    <>
                                        <video width="320" height="240" controls>
                                            <source src={m.file} type="video/mp4" />
                                            <source src={m.file} type="video/ogg" />
                                            <source src={m.file} type="video/webm" />
                                            <source src={m.file} type="video/flv" />
                                            <source src={m.file} type="video/mkv" />
                                            <source src={m.file} type="video/avi" />
                                            <source src={m.file} type="video/wmv" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </>
                                )

                            }

                            {
                                getExtension(m.file) === "mp3" && (
                                    <>
                                        <audio controls>
                                            <source src={m.file} type="audio/ogg" />
                                            <source src={m.file} type="audio/mpeg" />
                                            <source src={m.file} type="audio/wav" />
                                            <source src={m.file} type="audio/mp3" />
                                            Your browser does not support the audio tag.
                                        </audio>
                                    </>
                                )

                            }
                        </>
                    )}
                </div>

                <div style={{ padding: `${m?.reply && "5px 0"}` }}>
                    {
                        m?.reply && (
                            <div style={{ minWidth: "120px", background: "#95b2c1", padding: "10px", borderRadius: "15px", paddingRight: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <MdReply size={20} className="text-[20px]" />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div style={{ fontWeight: "600" }}>
                                            {m?.reply?.sender?.name > 24 ? m?.reply?.sender?.name.slice(0, 24) + "..." : m?.reply?.sender?.name}
                                        </div>

                                        <div style={{ color: "#021926", fontSize: "14px" }}>
                                            {
                                                m?.reply?.content
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )
                    }
                </div>

                <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${m?.file ? "5px 0" : "0"}` }}>
                    <span style={{ display: "flex", gap: "5px" }}>
                        {(isDeleting && currentMessage._id === m._id) && <Spinner color='red.500' />}
                        {m.content}
                    </span>


                    <Menu>
                        <MenuButton size="sm" paddingRight={0} as={Button} bg="transparent" _hover={{ bg: "transparent" }} _active={{ bg: "transparent" }}>
                            <FaAngleDown size={16} />
                            {/* previous */}
                            {/* {!currentReact && (
                                <FaAngleDown size={16} />
                            )} */}

                            {/* {currentReact === "like" && (<Image
                                src="/like.png"
                                width={8}
                                height={8}
                                alt="like"
                            />)}

                            {currentReact === "laugh" && (<Image
                                src="/laugh.png"
                                width={8}
                                height={8}
                                alt="laugh"
                            />)}

                            {currentReact === "sad" && (<Image
                                src="/sad.png"
                                width={8}
                                height={8}
                                alt="sad"
                            />)}

                            {currentReact === "angry" && (<Image
                                src="/angry.png"
                                width={8}
                                height={8}
                                alt="like"
                                onClick={() => handleReact(m, "angry")}
                            />)} */}
                        </MenuButton>
                        <MenuList position="relative">
                            <EditMessageModal m={m} messages={messages} setMessages={setMessages}>
                                <MenuItem display="flex" alignItems="center" gap={2}>
                                    <FiEdit3 />
                                    Edit
                                </MenuItem>
                            </EditMessageModal>
                            <MenuItem display="flex" alignItems="center" gap={2} onClick={() => deleteMessage(m)}>
                                <RiDeleteBin5Line />
                                Delete
                            </MenuItem>
                            <MenuItem display="flex" alignItems="center" gap={2} onClick={() => handleReply(m)}>
                                <MdReply />
                                Reply

                            </MenuItem>
                            <MenuItem>
                                <div class="itemsContainer">
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px 8px" }} className="image">
                                        <GoSmiley />
                                        React
                                    </div>
                                    <div className="reaction-buttons">
                                        {/* <AiOutlineLike
                                            size={24}
                                            style={{ color: "teal", fontSize: "14px" }}
                                            onClick={() => handleReact(m, "like")}
                                        />
                                        <FaLaughSquint
                                            size={24}
                                            style={{ color: " #ffe900", fontSize: "14px" }}
                                            onClick={() => handleReact(m, "laugh")}
                                        />
                                        <FaRegFaceSadCry
                                            size={24}
                                            style={{ color: "#ffe900", fontSize: "14px" }}
                                            onClick={() => handleReact(m, "sad")}
                                        />
                                        <FaFaceAngry
                                            size={24}
                                            style={{ color: "red", fontSize: "14px" }}
                                            onClick={() => handleReact(m, "angry")}
                                        /> */}

                                        <Image
                                            src="/like.png"
                                            width={8}
                                            height={8}
                                            alt="like"
                                            onClick={() => handleReact(m, "like")}
                                        />

                                        <Image
                                            src="/laugh.png"
                                            width={8}
                                            height={8}
                                            alt="like"
                                            onClick={() => handleReact(m, "laugh")}
                                        />

                                        <Image
                                            src="/sad.png"
                                            width={8}
                                            height={8}
                                            alt="like"
                                            onClick={() => handleReact(m, "sad")}
                                        />

                                        <Image
                                            src="/angry.png"
                                            width={8}
                                            height={8}
                                            alt="like"
                                            onClick={() => handleReact(m, "angry")}
                                        />
                                    </div>
                                </div>
                            </MenuItem>
                        </MenuList>
                    </Menu>

                    {/* after */}

                </div>

                {
                    reactions.length > 0 && (
                        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "end" }}>
                            {
                                reactions.map(r => {
                                    if (r?.react === "like") {
                                        console.log("like");
                                        return <Image
                                            src="/like.png"
                                            width={4}
                                            height={4}
                                            alt="like"
                                        />
                                    }

                                    if (r?.react === "sad") {
                                        console.log("sad");
                                        return <Image
                                            src="/sad.png"
                                            width={4}
                                            height={4}
                                            alt="sad"
                                        />
                                    }

                                    if (r?.react === "laugh") {
                                        console.log("laugh");
                                        return <Image
                                            src="/laugh.png"
                                            width={4}
                                            height={4}
                                            alt="laugh"
                                        />
                                    }

                                    if (r?.react === "angry") {
                                        console.log("angry");
                                        return <Image
                                            src="/angry.png"
                                            width={4}
                                            height={4}
                                            alt="angry"
                                        />
                                    }
                                })
                            }
                        </div>
                    )
                }
            </div>


        </div>
    )
}

export default MessageCard