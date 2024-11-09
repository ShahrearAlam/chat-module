import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const ChatContext = createContext();

const ChatProvixer = ({ children }) => {
    const [user, setUser] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState(null);
    const [notification, setNotification] = useState([]);

    const toast = useToast();

    const navigate = useNavigate();
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;
    // axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;

    axios.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            let res = error.response;
            console.log(error);

            if (res.status === 401 && res.config && !res.config.__isRetryRequest) {
                setUser(null);
                setSelectedChat(null);
                setChats(null);
                window.localStorage.removeItem("userInfo");
                navigate("/");
            }

            if (res.status === 400) {
                toast({
                    title: error.response.data,
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })
            }

            if (res.status === 403) {
                toast({
                    title: error.response.data,
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })
            }

            if (res.status === 500) {
                toast({
                    title: error.response.data,
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })
            }
        }
    )

    useEffect(() => {
        // const userInfo = JSON.parse(window.localStorage.getItem("userInfo"));
        let userInfo = null;

        if(window.localStorage.getItem("userInfo")){
            userInfo = JSON.parse(window.localStorage.getItem("userInfo"));
            setUser(userInfo);
        }
        if (userInfo) {
            
            const fetchNotifications = async () => {

                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userInfo?.token}`
                    }
                }

                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/notifications`, config);

                console.log(data);

                if (data?.length > 0) {
                    setNotification(data);
                }
            }

            fetchNotifications();

        }



        // if (!userInfo) {
        //     navigate("/");
        // }

    }, [navigate]);

    return (
        <ChatContext.Provider value={{ user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification }}>{children}</ChatContext.Provider>
    )
}

export const ChatState = () => {
    return useContext(ChatContext);
}


export default ChatProvixer