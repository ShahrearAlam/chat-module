import './App.css';
import { Routes, Route } from "react-router-dom";
import HomePage from './pages/home/HomePage';
import ChatPage from './pages/chat/ChatPage';
import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from './config/firebase/firebase';
import LogInWithIqSocial from './pages/LogInWithIqSocial/LogInWithIqSocial';
// import LoginWithIqSocial from './components/LoginWithIqSocial/LoginWithIqSocial';


function App() {
  const [fcmToken, setFcmToken] = useState(null);

  // useEffect(() => {
  //   console.log("navigator fires in App.js")
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker.register('firebase-messaging-sw.js')
  //       .then(function (registration) {
  //         console.log('Registration successful, scope is:', registration.scope);
  //       }).catch(function (err) {
  //         console.log('Service worker registration failed, error:', err);
  //       });
  //   }

  // }, [])
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<HomePage fcmToken={fcmToken} setFcmToken={setFcmToken} />} />
        <Route path='/chat' element={<ChatPage fcmToken={fcmToken} setFcmToken={setFcmToken} />} />
        {/* <Route path="/login-with-iqsocial" element={<LoginWithIqSocial fcmToken={fcmToken} setFcmToken={setFcmToken} />} /> */}
        <Route path="/login-with-iqsocial" element={<LogInWithIqSocial fcmToken={fcmToken} setFcmToken={setFcmToken} />} />
      </Routes>
    </div>
  );
}

export default App;
