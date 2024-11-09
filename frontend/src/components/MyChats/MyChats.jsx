import { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider"
import { Box, Button, Menu, MenuButton, MenuItem, MenuList, Spinner, Stack, useToast } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "../loading/ChatLoding";
import { getSender } from "../../config/chatLogics";
import GroupChatModal from "../modals/group-chat-modal/GroupChatModal";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";

const MyChats = ({ fetchAgain }) => {
    const [loggedInUser, setLoggedInUser] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user, chats, setChats, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const toast = useToast();

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get("/api/chat", config);
            setChats(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the chats",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const deleteChat = async (chat) => {
        try {
            setIsDeleting(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post("/api/chat/delete-chat", { chatId: chat._id }, config);
            console.log(data);

            if (data.success) {
                const filteredArr = chats.filter(c => c._id !== chat._id);

                setChats(filteredArr);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsDeleting(false);
        }
    }

    const removeNotification = async (notif) => {
        const config = {
            headers: {
                "Content-type": "application/json",
                authorization: `Bearer ${user.token}`
            }
        }

        const { data } = await axios.post("/api/user/remove-notification", {
            chatId: notif._id,
        }, config);
    }

    useEffect(() => {
        setLoggedInUser(JSON.parse(window.localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain])

    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            p={3}
            w={{ base: "100%", md: "31%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <Box
                display="flex"
                flexWrap="wrap"
                alignItems="center"
                justifyContent="space-between"
                w="100%"
                fontFamily="Work sans"
                pb={3}
                px={3}
                fontSize={{ base: "28px", md: "30px" }}
            >
                All
                <GroupChatModal>
                    <Button
                        display="flex"
                        fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                        rightIcon={<AddIcon />}>
                        New Group Chat
                    </Button>
                </GroupChatModal>
            </Box>

            <Box
                display="flex"
                flexDir="column"
                p={3}
                bg="#F8F8F8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
            >
                {
                    chats ? (
                        <Stack overflowY="scroll">
                            {
                                chats.map((chat) => (
                                    <Box
                                        key={chat?._id}
                                        cursor="pointer"
                                        borderRadius="lg"
                                        px={3}
                                        bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <p
                                            style={{ display: "flex", alignItems: "center", gap: "5px", flex: "2", color: selectedChat === chat ? "white" : "black", padding: "5px 0" }}
                                            onClick={() => {
                                                setNotification(notification.filter(n => n?.chat?._id !== chat?._id));
                                                removeNotification(chat);
                                                setSelectedChat(chat);
                                            }}>
                                            {isDeleting && <Spinner colorScheme="red.500" />}
                                            {
                                                !chat.isGroupChat ? (
                                                    getSender(loggedInUser, chat?.users)
                                                ) : (
                                                    chat?.chatName
                                                )
                                            }
                                        </p>



                                        {/* <Menu>
                                            <MenuButton as={Button} bg="transparent" color="black" _hover={{ bg: "transparent" }} _active={{ bg: "transparent" }}>
                                                <BiDotsHorizontalRounded size={16} />
                                            </MenuButton>
                                            <MenuList>
                                                <MenuItem display="flex" alignItems="center" gap={2} onClick={() => deleteChat(chat)}>
                                                    <MdOutlineDeleteOutline size={16} />
                                                    Delete
                                                </MenuItem>
                                            </MenuList>
                                        </Menu> */}
                                    </Box>
                                ))
                            }
                        </Stack>
                    ) : (
                        <ChatLoading />
                    )
                }
            </Box>
        </Box>
    )
}

export default MyChats