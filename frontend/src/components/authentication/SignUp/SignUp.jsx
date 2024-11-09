import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from "@chakra-ui/react"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pic, setPic] = useState("");
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleShow = () => {
        setShow(!show);
    }

    const postDetails = (pic) => {
        setIsLoading(true);

        if (pic === undefined) {
            toast({
                title: "Please select an image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })

            return;
        }

        if (pic.type === "image/jpeg" || pic.type === "image/png") {
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
            data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

            fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "post",
                body: data
            }).then(res => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    console.log(data.url.toString());
                    setIsLoading(false);
                })
        } else {
            toast({
                title: "Please select an image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setIsLoading(false);
            return;
        }
    }

    const submitHandler = async () => {
        setIsLoading(true);

        try {
            if (name === "" || email === "" || password === "" || confirmPassword === "") {
                toast({
                    title: "Please fill all fields",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })

                return;
            }

            if (password !== confirmPassword) {
                toast({
                    title: "Password and Confirm Password Did Not Match",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })

                return;
            }

            const config = {
                headers: {
                    "Content-type": "application/json"
                }
            }
            const response = await axios.post("/api/user/signup", { name, email, password, pic }, config);

            if (response?.data) {
                toast({
                    title: "Signed Up Successfully",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })

                localStorage.setItem("userInfo", JSON.stringify(response?.data));
                navigate("/chat");
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <VStack spacing={"5px"}>
            <FormControl id="first-name" isRequired>
                <FormLabel>Name</FormLabel>
                <Input placeholder="Name" onChange={e => setName(e.target.value)} />
            </FormControl>

            <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            </FormControl>

            <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder="Password" onChange={e => setPassword(e.target.value)} />
                    <InputRightElement width={"4.5rem"}>
                        <Button h="1.75em" size="sm" onClick={handleShow}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id="confirm-password" isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder="Confirm Password" onChange={e => setConfirmPassword(e.target.value)} />
                    <InputRightElement width={"4.5rem"}>
                        <Button h="1.75em" size="sm" onClick={handleShow}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id="pic">
                <FormLabel>Upload your profile picture</FormLabel>
                <Input type="file" p="1.5px" accept="image/*" onChange={e => postDetails(e.target.files[0])} />
            </FormControl>

            <Button colorScheme="yellow" width={"100%"} style={{ marginTop: 15 }} onClick={submitHandler} isLoading={isLoading}>
                Sign Up
            </Button>
        </VStack>
    )
}

export default SignUp