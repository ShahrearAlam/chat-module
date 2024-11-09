import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const LogInWithIqSocial = () => {
    // window.addEventListener('message', event => {
    //     if (event.origin === 'http://localhost:4000') {
    //         const receivedData = event.data;
    //         localStorage.setItem("userInfo", JSON.stringify(receivedData?.user));
    //         console.log('Received data from Origin 1:', receivedData);
    //         // Store receivedData in localStorage or perform other actions
    //     }
    // });
    const toast = useToast();
    const navigate = useNavigate();

    const handleReceiveMessage = async (event) => {

        if (event.origin !== process.env.REACT_APP_IQSOCIAL_CLIENT) {
            return;
        }

        const { type, userData } = event.data;

        console.log('type : ', type)
        if (type === 'getLocalStorageData') {
            const localStorageData = { userInfo: window.localStorage.getItem("userInfo") ? JSON.parse(window.localStorage.getItem("userInfo")) : null };

            window.parent.postMessage({ type: 'getLocalStorageData', data: localStorageData }, process.env.REACT_APP_IQSOCIAL_CLIENT);
        }

        if (type === 'authenticate') {
            if (userData) {
                const currentUser = JSON.parse(localStorage.getItem("userInfo"));
                window.localStorage.setItem("userInfo", JSON.stringify(userData));
                window.parent.postMessage({
                    type: 'authenticated', data: {
                        success: true,
                    }
                }, process.env.REACT_APP_IQSOCIAL_CLIENT);


                if (currentUser?.email !== userData?.email) {
                    window.location.href = '/chat';
                } else {
                    navigate("/chat");
                }


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

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100vh" }}>
            <img src="/iq_logo.png" alt="IQ Mates" style={{ width: "120px", height: "120px" }} />
        </div>
    )
}

export default LogInWithIqSocial
