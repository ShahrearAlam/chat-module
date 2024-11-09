import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios"
import { messaging } from "../../../config/firebase/firebase";
import { getToken } from "firebase/messaging";

const SignIn = ({ fcmToken, setFcmToken }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleShow = () => {
        setShow(!show);
    }


    const submitHandler = async (e) => {
        setIsLoading(true);

        if (email === "" || password === "") {
            toast({
                title: "Please fill all fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })

            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json"
                }
            }
            const response = await axios.post("/api/user/signin", { email, password, fcmToken }, config);

            if (response?.data) {
                toast({
                    title: "Sign in Completed",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                });

                localStorage.setItem("userInfo", JSON.stringify(response?.data?.user));
                navigate("/chat");
            }
    
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    async function requestPermission() {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            if (typeof window !== undefined) {
                // Generate Token
                const token = await getToken(messaging, {
                    vapidKey: "BP-QVsqGtY7QxTcUcFdPKHPKVuzLsXFFiAzb13QTKxhZWNA1OijI-QyaKZIv8lO0syQtun3r_0g7mYjYn0QUaZw",
                });
                setFcmToken(token);
            }
        } else if (permission === "denied") {
            console.log("user blocked")
        }
    }

    // useEffect(() => {
    //     // if ('serviceWorker' in navigator) {
    //     //     navigator.serviceWorker.register('../firebase-messaging-sw.js')
    //     //         .then(function (registration) {
    //     //             console.log('Registration successful, scope is:', registration.scope);
    //     //             // requestPermission();
    //     //         }).catch(function (err) {
    //     //             console.log('Service worker registration failed, error:', err);
    //     //         });
    //     // }

    // }, []);

    return (
        <VStack spacing={"5px"}>
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

            <Button colorScheme="yellow" width={"100%"} style={{ marginTop: 15 }} onClick={submitHandler} isLoading={isLoading}>
                Sign In
            </Button>
        </VStack>
    )
}

export default SignIn