import axios from "axios"
import { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import { Box } from "@chakra-ui/react";
import SideDrawer from "../../components/misc/SideDrawer/SideDrawer";
import MyChats from "../../components/MyChats/MyChats";
import ChatBox from "../../components/ChatBox/ChatBox";
import { getToken, isSupported } from "firebase/messaging";
import { messaging } from "../../config/firebase/firebase";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    const [fcmToken, setFcmToken] = useState(null);
    const navigate = useNavigate();

    async function requestPermission() {
        const serviceWorkerReady = await navigator.serviceWorker.ready;
        const supported = await isSupported();

        if (serviceWorkerReady.active.state === "activated") {
            if (supported) {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    if (typeof window !== undefined) {
                        // Generate Token
                        const token = await getToken(messaging, {
                            vapidKey: "BP-QVsqGtY7QxTcUcFdPKHPKVuzLsXFFiAzb13QTKxhZWNA1OijI-QyaKZIv8lO0syQtun3r_0g7mYjYn0QUaZw",
                        });
                        console.log("Token Gen in chat page", token);
                        setFcmToken(token);

                        if (token) {
                            try {
                                const config = {
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${user.token}`
                                    }
                                }

                                const { data } = await axios.post("/api/user/save-fcm-token", {
                                    fcmToken: token
                                }, config);


                            } catch (err) {
                                console.log(err);
                            }
                        }
                    }
                } else if (permission === "denied") {
                    console.log("user blocked")
                }
            }
        }
    }

    useEffect(() => {
        if (user) {
            requestPermission();
        }


    }, [user])


    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [])
    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}
            <Box display="flex" justifyContent="space-between" p="10px" w="100%" h={{
                base: "88vh",
                md: "89vh"
            }}>
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
            </Box>
        </div>
    )
}


export default ChatPage