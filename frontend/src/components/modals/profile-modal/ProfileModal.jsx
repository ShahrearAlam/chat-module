import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react"
import { FaEye } from "react-icons/fa";

const ProfileModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    console.log("user pic : ", user)
    return (
        <>
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
                <IconButton display={{ base: "flex" }} icon={<FaEye />} onClick={onOpen} />
            )}

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
                <ModalOverlay />
                <ModalContent h="410px" marginX="40px" padding="20px">
                    <ModalHeader display="flex" justifyContent="center" fontFamily="Work sans" fontSize="40px">{user.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center" justifyContent="space-between" paddingX="80px">
                        <Image borderRadius="full" boxSize="150px" src={user.pic} alt={user.name} />
                        <Text fontFamily="Work sans" fontSize={{ base: "20px", md: "20px" }}>E-mail : {user.email}</Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ProfileModal