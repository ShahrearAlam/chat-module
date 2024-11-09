import ScrollableFeed from "react-scrollable-feed"
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../../config/chatLogics"
import { ChatState } from "../../context/ChatProvider"
import { Avatar, Button, Image, Menu, MenuButton, MenuItem, MenuList, Spinner, Tooltip, useToast } from "@chakra-ui/react";
import PreviewFileModal from "../modals/preview-file-modal/PreviewFileModal";
import { IoDocuments } from "react-icons/io5";
import { FaAngleDown, FaRegFaceLaughSquint } from "react-icons/fa6";
import axios from "axios";
import { useEffect, useState } from "react";
import EditMessageModal from "../modals/edit-message-modal/EditMessageModal";
import { GoSmiley } from "react-icons/go";
import { AiOutlineLike } from "react-icons/ai";
import { FaRegFaceSadCry } from "react-icons/fa6";
import { FaFaceAngry } from "react-icons/fa6";
import { FaLaughSquint } from "react-icons/fa";
import MessageCard from "../message-card/MessageCard";

const ScrollableChat = ({ messages, setMessages, reply, setReply }) => {

    return (
        <ScrollableFeed>
            {
                messages && messages.map((m, i) => (
                    <MessageCard m={m} key={m._id} i={i} messages={messages} setMessages={setMessages} reply={reply} setReply={setReply} />
                ))
            }
        </ScrollableFeed >
    )
}

export default ScrollableChat