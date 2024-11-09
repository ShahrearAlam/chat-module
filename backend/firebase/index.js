import firebase from "firebase-admin"
import serviceAccount from "./firebase_config.json" assert { type: "json" }

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
})


export default firebase
