import { doc, serverTimestamp, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase"; 

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [messageId, setMessageId] = useState(null);
    const [chatData, setChatData] = useState(null); 
    const [messages, setMessages] = useState(null);
    const [chatUser, setChatUser] = useState(null)
    const [chatVisible, setChatVisible] = useState(false);
    const loaduserData = async (uid) => {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setUserData(userData);

                if (userData.avatar && userData.name) {
                    navigate('/chat');
                } else {
                    navigate('/profile');
                }

                // Update last seen time with serverTimestamp() (Firebase Server Time)
                await updateDoc(userRef, {
                    lastSeen: Date.now()
                });

                // Start interval to continuously update lastSeen
                setInterval(async () => {
                    if (auth.currentUser) { // Check for current authenticated user
                        await updateDoc(userRef, {
                            lastSeen: Date.now()
                        });
                    }
                }, 60000); // Update every 60 seconds

            } else {
                console.error("No such user found!");
            }
            
        } catch (error) {
            console.error("Error loading user data or updating last seen:", error);
        }
    };



    useEffect(() =>{
        if(userData){
            const chatRef = doc(db,'chats',userData.id);
            // onSnapShot is a event list
            const unSub = onSnapshot(chatRef, async(res) =>{
                const chatItems = res.data().chatData;
                const tempData = [];
                for(const item of chatItems){
                    const userRef = doc(db, 'users', item.rId);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    tempData.push({...item,userData})
                }
                setChatData(tempData.sort((a, b)=>b.updatedAt - a.updatedAt))

            })
            
            return () =>{
                unSub();
            }
        }
    },[userData])

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loaduserData,
        messages, setMessages,
        messageId, setMessageId,
        chatUser, setChatUser,
        chatVisible, setChatVisible
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
