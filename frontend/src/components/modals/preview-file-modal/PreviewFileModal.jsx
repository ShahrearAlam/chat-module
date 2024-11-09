import { Box, Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react"
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";

const PreviewFileModal = ({ file, extension, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <div className="static">
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
                <IconButton display={{ base: "flex" }} onClick={onOpen} cursor={"pointer"}>
                    {children}
                </IconButton>
            )}

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
                <ModalOverlay />
                <ModalContent w="100%" h="410px" margin="10px">
                    <ModalCloseButton />

                    {
                        extension === "jpg" && (
                            <ModalBody display="flex" flexDir="column" alignItems="center" justifyContent="space-between">
                                <Image borderRadius="md" boxSize={{ base: "200px", md: "300px" }} width={{ base: "300px", md: "400px" }} height={{ base: "300px", md: "300px" }} src={file} alt={file} />

                                <Box display={"flex"} alignItems={"center"} flexWrap={"wrap"} gap="10px">
                                    <Link to={file} target="_blank" style={{
                                        backgroundColor: "teal",
                                        color: "white",
                                        borderRadius: "5px",
                                        padding: "10px 25px"
                                    }}>
                                        View Full Size
                                    </Link>
                                </Box>
                            </ModalBody>
                        )
                    }

                    {
                        extension === "doc" && (
                            <ModalBody w="100%" h="max-content" display="flex" flexDir="column" marginTop={10} rowGap={4}>
                                <div className="mt-10 w-[100%] flex flex-col !gap-y-2">
                                    <iframe width="100%" height="250px" src={file}></iframe>

                                    <Box display={"flex"} alignItems={"center"} flexWrap={"wrap"} gap="10px" marginTop={4}>
                                    <Link to={file} target="_blank" style={{
                                        backgroundColor: "teal",
                                        color: "white",
                                        borderRadius: "5px",
                                        padding: "10px 25px"
                                    }}>
                                        Download
                                    </Link>
                                </Box>
                                </div>

                               
                            </ModalBody>
                        )
                    }


                </ModalContent>
            </Modal>
        </div>
    )
}

export default PreviewFileModal