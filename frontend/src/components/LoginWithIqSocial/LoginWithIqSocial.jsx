import { useEffect, useState } from "react";
import "./LoginWithIqSocial.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const LoginWithIqSocial = ({ fcmToken, setFcmToken }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const handleReceiveMessage = async (event) => {

            if (event.origin !== process.env.REACT_APP_IQSOCIAL_CLIENT) {
                return;
            }

            const { type, userData } = event.data;


            if (type === 'getLocalStorageData') {
                const localStorageData = { userInfo: window.localStorage.getItem("userInfo") ? JSON.parse(window.localStorage.getItem("userInfo")) : null };

                window.parent.postMessage({ type: 'getLocalStorageData', data: localStorageData }, process.env.REACT_APP_IQSOCIAL_CLIENT);
            }

            if (type === 'authenticate') {
                //  get the iqMates authenticated data from iq social , here userData is all we need store in localStorage
                //  under the key called "userInfo"

                if (userData) {

                    toast({
                        title: "Sign in Completed",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom"
                    });


                    window.localStorage.setItem("userInfo", JSON.stringify(userData));

                    window.parent.postMessage({
                        type: 'authenticated', data: {
                            success: true,
                        }
                    }, process.env.REACT_APP_IQSOCIAL_CLIENT);
                    navigate("/chat");
                }
            }

            if (window.localStorage.getItem("userInfo")) {
                navigate("/chat")
            }
        };

        window.addEventListener('message', handleReceiveMessage);

        return () => {
            window.removeEventListener('message', handleReceiveMessage);
        };
    }, []);


    return (
        <div className="container">
            <h2>Log In Wth Iq Social</h2>
        </div>
    )
}


export default LoginWithIqSocial