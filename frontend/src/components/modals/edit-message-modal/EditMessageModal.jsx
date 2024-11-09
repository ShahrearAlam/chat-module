import { Box, Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text, useDisclosure } from "@chakra-ui/react"
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ChatState } from "../../../context/ChatProvider";
import axios from "axios"

const EditMessageModal = ({ m, messages, setMessages, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [content, setContent] = useState(m.content || "");
    const [isLoading, setIsLoading] = useState(false);

    const { user } = ChatState();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.post("/api/message/edit", { messageId: m._id, content }, config);

            if (data) {
                let updatedArr = messages.map(message => {
                    if (message._id === m._id) {
                        return { ...message, content: data.content }
                    } else {
                        return message
                    }
                })

                setMessages(updatedArr);
                onClose();
            }

        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="static">
            {children ? (
                <span onClick={onOpen} style={{ width: "100%", height: "100%" }}>{children}</span>
            ) : (
                <IconButton display={{ base: "flex" }} onClick={onOpen} cursor={"pointer"}>
                    {children}
                </IconButton>
            )}

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
                <ModalOverlay />
                <ModalContent w="100%" h="410px" margin="10px">
                    <ModalCloseButton />

                    <ModalBody display="flex" justifyContent="center" alignItems="center" marginTop={10}>
                        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                            <input type="text" value={content} placeholder="message" onChange={e => setContent(e.target.value)} style={{ flex: "2", padding: "10px 20px", outline: "none", border: "1px solid gray", borderRadius: "5px" }} />

                            <button type="submit" style={{ background: "teal", color: "white", borderRadius: "5px", padding: "10px 20px" }}>
                                {isLoading ? <Spinner size="sm" /> : "Update"}
                            </button>
                        </form>
                    </ModalBody>

                </ModalContent>
            </Modal>
        </div>
    )
}

export default EditMessageModal