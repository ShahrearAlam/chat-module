import { useNavigate } from "react-router-dom"
import SignIn from "../../components/authentication/SignIn/SignIn"
import SignUp from "../../components/authentication/SignUp/SignUp"
import styles from "./Home.styles.css"
import { Container, Box, Text, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { messaging } from "../../config/firebase/firebase"
import { getToken } from "firebase/messaging";

const HomePage = ({ fcmToken, setFcmToken }) => {
    const navigate = useNavigate();


    useEffect(() => {

        if (localStorage.getItem("userInfo")) {
            const user = JSON.parse(localStorage.getItem("userInfo"));

            if (user) {
                navigate("/chat");
            }
        }


    }, [navigate]);

    const registerServiceWorker = async () => {
        try {
            const serviceWorkerRegistration = await navigator.serviceWorker.register("firebase-messaging-sw.js");

            await navigator.serviceWorker.ready;

            // registering push 
            const subscription = await serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "BP-QVsqGtY7QxTcUcFdPKHPKVuzLsXFFiAzb13QTKxhZWNA1OijI-QyaKZIv8lO0syQtun3r_0g7mYjYn0QUaZw"
            })
        } catch (err) {
            const serviceWorkerRegistration = await navigator.serviceWorker.register("firebase-messaging-sw.js");

            await navigator.serviceWorker.ready;

            // registering push 
            const subscription = await serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "BP-QVsqGtY7QxTcUcFdPKHPKVuzLsXFFiAzb13QTKxhZWNA1OijI-QyaKZIv8lO0syQtun3r_0g7mYjYn0QUaZw"
            })
        }
    }

    useEffect(() => {
        console.log("navigator fires in home page")
        registerServiceWorker();
    }, [])



    return (
        <div className={styles.home__conatiner}>
            <Container maxW="xl" centerContent>
                <Box d="flex" alignItems="center" justifyContent="center" p={3} bg={"white"} w={"100%"} m="40px 0 15px 0" borderRadius="lg" borderWidth="1px">
                    <Text fontSize="2xl" fontFamily="Work sans" color="black">Chat App</Text>
                </Box>

                <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px" color="black">
                    <Tabs isFitted variant='enclosed' colorScheme='yellow'>
                        <TabList mb={"1em"}>
                            <Tab width={"50%"}>Sign In</Tab>
                            <Tab width={"50%"}>Sign Up</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <SignIn fcmToken={fcmToken} setFcmToken={setFcmToken} />
                            </TabPanel>
                            <TabPanel>
                                <SignUp fcmToken={fcmToken} setFcmToken={setFcmToken} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Container>
        </div>
    )
}

export default HomePage