import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Icon, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react"
import { FaChevronDown, FaRegBell } from "react-icons/fa6";
import { ChatState } from "../../../context/ChatProvider";
import ProfileModal from "../../modals/profile-modal/ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../../loading/ChatLoding";
import UserListItem from "../../user/UserListItem";
import { getSender } from "../../../config/chatLogics";
import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';

const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const toast = useToast();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");

        // if ('serviceWorker' in navigator) {

        //     navigator.serviceWorker.getRegistrations().then(function (registrations) {
        //         for (let registration of registrations) {

        //             registration.unregister()

        //         }
        //     }).catch(function (err) {

        //         console.log('Service Worker registration failed: ', err);

        //     });

        // }

        // if ('serviceWorker' in navigator) {
        //     navigator.serviceWorker.register('firebase-messaging-sw.js')
        //         .then(function (registration) {
        //             console.log('Registration successful, scope is:', registration.scope);
        //         }).catch(function (err) {
        //             console.log('Service worker registration failed, error:', err);
        //         });
        // }


        navigate("/");
    }

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please enter a name or email to search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            console.log(data);
            setSearchResult(data);
            setSearch("");
        } catch (err) {
            console.log(err);
            toast({
                title: "Something went wrong!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
        } finally {
            setLoading(false);
        }
    }

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-type": "application/json",
                    authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.post(`/api/chat`, { userId }, config);

            if (!chats.find(c => c._id === data._id)) setChats([data, ...chats])
            setSelectedChat(data);
            onClose();
        } catch (err) {
            console.log(err);
            toast({
                title: "Error loading chat",
                description: err?.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })
        } finally {
            setLoadingChat(false);
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
            chatId: notif.chat._id,
        }, config);
    }

    return (
        <>
            <Box display="flex" alignItems="center" justifyContent="space-between" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
                <Tooltip label="search users to chat" hasArrow placement="bottom-end">
                    <Button colorScheme='teal' variant='outline' onClick={onOpen}>
                        <Text px="4">Search</Text>
                    </Button>
                </Tooltip>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge count={notification.length} effect={Effect.SCALE} />
                            <Icon as={FaRegBell} fontSize="2xl" />
                        </MenuButton>

                        <MenuList pl={2}>
                            {!notification.length && "No new messages"}
                            {notification.map((notif) => (
                                <MenuItem key={notif._id} onClick={() => {
                                    setSelectedChat(notif.chat);
                                    setNotification(notification.filter(n => n !== notif));
                                    removeNotification(notif);
                                }}>
                                    {
                                        notif.chat.isGroupChat ? `New message in ${notif.chat.chatName}` : (
                                            `New message from ${getSender(user, notif.chat.users)}`
                                        )
                                    }
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>

                    <Menu>
                        <MenuButton as={Button} rightIcon={<FaChevronDown />}>
                            <Avatar size="sm" cursor="pointer" name={user.name} />
                        </MenuButton>

                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Log Out</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>

                    <DrawerBody>
                        <Box display="flex" pb={2} gap={2}>
                            <Input border="1px solid green" _focus={{ border: "1px solid green" }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                            <Button colorScheme="green" onClick={handleSearch}>Go</Button>
                        </Box>

                        {
                            loading ? (<ChatLoading />) : (

                                searchResult?.map(user => (
                                    <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)} />
                                ))

                            )
                        }

                        {
                            loadingChat && <Spinner ml="auto" display="flex" />
                        }
                    </DrawerBody>
                </DrawerContent>


            </Drawer>
        </>
    )
}

export default SideDrawer