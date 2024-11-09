import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyC03Fc69y0LDM8Lfpa3ODjKmihOaTzpDmU",
    authDomain: "chat-module-29222.firebaseapp.com",
    projectId: "chat-module-29222",
    storageBucket: "chat-module-29222.appspot.com",
    messagingSenderId: "913629813168",
    appId: "1:913629813168:web:46552b4fd703defa515e75"
};

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
