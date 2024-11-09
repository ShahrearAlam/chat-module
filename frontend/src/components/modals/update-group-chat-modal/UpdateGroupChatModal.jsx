import { ViewIcon } from "@chakra-ui/icons";
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from "@chakra-ui/react"
import { ChatState } from "../../../context/ChatProvider"
import { useState } from "react";
import UserBadgeItem from "../../user/UserBadgeItem";
import axios from "axios";
import UserListItem from "../../user/UserListItem";
import { MdAdminPanelSettings } from "react-icons/md";


const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);

    const toast = useToast();

    const { user, selectedChat, setSelectedChat } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);

        if (!query) {
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setSearchResult(data);
        } catch (err) {
            console.log(err);
            toast({
                title: "Error Occured!",
                description: "Failed to fectch users",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })
        } finally {
            setLoading(false);
        }
    }

    const handleRemove = async (user1) => {

        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Only admins can remove someone",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });

            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put(`/api/chat/group-remove`, {
                chatId: selectedChat._id,
                userId: user1._id
            }, config);

            user1._id === user._id ? setSelectedChat(null) : setSelectedChat(data);
            fetchMessages();
            setFetchAgain(!fetchAgain);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }

    }

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put(`/api/chat/rename`, {
                chatId: selectedChat._id,
                chatName: groupChatName
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setGroupChatName("");
        } catch (err) {
            console.log(err);
        } finally {
            setRenameLoading(false);
        }
    }

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find(u => u._id === user1._id)) {
            toast({
                title: "User already exists",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });

            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });

            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put(`/api/chat/group-add`, {
                chatId: selectedChat._id,
                userId: user1._id
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
        } catch (err) {
            console.log(err);
            toast({
                title: "Could Not Add User",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />

                <ModalContent>
                    <ModalHeader>
                        {selectedChat.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box display="flex" alignItems="center" gap={2} shadow="sm" marginBottom={4}>
                            <MdAdminPanelSettings />
                            <p>Admin : </p>
                            <p style={{ width: "fit-content" }}>{selectedChat.groupAdmin.name}</p>
                        </Box>
                        <Box display="flex" flexWrap="wrap" width="100%" pb={3}>
                            {
                                selectedChat.users.map(u => (
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        handleFunction={() => handleRemove(u)}
                                    />
                                ))
                            }
                        </Box>

                        <FormControl display="flex">
                            <Input
                                placeholder="Group Name"
                                mb={3}
                                _hover={{
                                    border: "2px solid teal"
                                }}
                                _focus={{
                                    border: "1px solid teal"
                                }}
                                value={groupChatName}
                                onChange={e => setGroupChatName(e.target.value)} />
                            <Button variant="solid" colorScheme="purple" ml={1} isLoading={renameLoading} onClick={handleRename}>
                                Update
                            </Button>
                        </FormControl>

                        <FormControl>
                            <Input
                                placeholder="Add Users"
                                mb={1}
                                _hover={{
                                    border: "2px solid teal"
                                }}
                                _focus={{
                                    border: "1px solid teal"
                                }}
                                onChange={e => handleSearch(e.target.value)} />
                        </FormControl>

                        {
                            loading ? (<Spinner size="lg" />) : (
                                searchResult?.map((user) => (
                                    <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />
                                ))
                            )
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={() => handleRemove(user)}>Leave</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >
        </>
    )
}

export default UpdateGroupChatModal