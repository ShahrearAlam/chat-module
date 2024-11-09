import { Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast, Box } from "@chakra-ui/react"
import { useState } from "react";
import { ChatState } from "../../../context/ChatProvider";
import axios from "axios";
import UserListItem from "../../user/UserListItem";
import UserBadgeItem from "../../user/UserBadgeItem";

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const { user, chats, setChats } = ChatState();

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

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please Fill All Of The Fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            })

            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.post("/api/chat/group", {
                name: groupChatName,
                users: selectedUsers.map(u => u._id)
            }, config);

            setChats([data, ...chats]);
            setSelectedUsers([]);
            setSearchResult([]);
            setSearch("");
            onClose();
            toast({
                title: `${data.chatName} group created`,
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
        } catch (err) {
            console.log(err);
            toast({
                title: "Failed to create group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top"
            })

            return;
        }
    }

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User Already Added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    }

    const handleDelete = (userToRemove) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== userToRemove._id));
    }

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        display="flex"
                        justifyContent="center"
                        fontSize="35px"
                        fontFamily="Work sans"
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display="flex"
                        flexDir="column"
                        alignItems="center"
                    >
                        <FormControl>
                            <Input
                                placeholder="Group Name"
                                mb={3}
                                _hover={{
                                    border: "2px solid teal"
                                }}
                                _focus={{
                                    border: "1px solid teal"
                                }}
                                onChange={e => setGroupChatName(e.target.value)} />
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
                        {/* render selected users */}
                        <Box w="100%" display="flex" flexWrap="wrap">
                            {
                                selectedUsers.map(u => (
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        handleFunction={() => handleDelete(u)}
                                    />
                                ))
                            }
                        </Box>

                        {/* render search users */}
                        {
                            loading ? (
                                <div>Loading...</div>
                            ) : (
                                searchResult?.slice(0, 4)?.map((user) => (
                                    <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                                ))
                            )
                        }
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="teal" onClick={handleSubmit}>create</Button>
                    </ModalFooter>
                </ModalContent>

            </Modal>
        </>
    )
}

export default GroupChatModal