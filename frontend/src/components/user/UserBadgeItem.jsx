import { CloseIcon } from "@chakra-ui/icons"
import { Box, Text } from "@chakra-ui/react"

const UserBadgeItem = ({ user, handleFunction }) => {
    return (
        <Box
            px={2}
            py={1}
            m={1}
            mb={2}
            borderRadius="lg"
            variant="solid"
            fontSize={12}
            backgroundColor="teal"
            color="white"
            cursor="pointer"
            onClick={handleFunction}
            display="flex"
            alignItems="center"
        >
            <Text fontSize="14px">{user.name}</Text>
            <CloseIcon fontSize="10px" ml={2} />
        </Box>
    )
}

export default UserBadgeItem