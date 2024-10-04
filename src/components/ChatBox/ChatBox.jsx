import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upoad'
const ChatBox = () => {
    const { userData, messageId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        try {

            if (input && messageId) {
                await updateDoc(doc(db, 'messages', messageId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()

                    })
                })
                const userIds = [chatUser.rId, userData.id];
                userIds.forEach(async (id) => {

                    const userChatRef = doc(db, 'chats', id);
                    const userChatSnapshot = await getDoc(userChatRef);
                    if (userChatSnapshot.exists()) {
                        const userChatData = userChatSnapshot.data();
                        const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messageId);

                        userChatData.chatData[chatIndex].lastmsg = input.slice(0, 30);
                        userChatData.chatData[chatIndex].updatedAt = Date.now();
                        if (userChatData.chatData[chatIndex].rId === userData.id) {
                            userChatData.chatData[chatIndex].messageSeen = false;
                        }
                        await updateDoc(userChatRef, {
                            chatData: userChatData.chatData
                        })
                    }
                })
            }

        } catch (error) {
            toast.error(error.message);
        }
        setInput("");
    }

    const convertTimeStamp = (timestamp) => {
        let date = timestamp.toDate();
        const hour = date.getHours();
        const minutes = date.getMinutes();
        if (hour > 12) {
            return hour + ":" + minutes + "PM"
        }
        else {
            return hour + ":" + minutes + "AM";
        }

    }

    const sendImage = async (e) => {
        try {
            const fileURL = await upload(e.target.files[0]);
            if (fileURL && messageId) {
                await updateDoc(doc(db, 'messages', messageId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        image: fileURL,
                        createdAt: new Date()

                    })
                })

                const userIds = [chatUser.rId, userData.id];
                userIds.forEach(async (id) => {

                    const userChatRef = doc(db, 'chats', id);
                    const userChatSnapshot = await getDoc(userChatRef);
                    if (userChatSnapshot.exists()) {
                        const userChatData = userChatSnapshot.data();
                        const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messageId);

                        userChatData.chatData[chatIndex].lastmsg = "image";
                        userChatData.chatData[chatIndex].updatedAt = Date.now();
                        if (userChatData.chatData[chatIndex].rId === userData.id) {
                            userChatData.chatData[chatIndex].messageSeen = false;
                        }
                        await updateDoc(userChatRef, {
                            chatData: userChatData.chatData
                        })
                    }
                })
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (messageId) {
            const unSub = onSnapshot(doc(db, 'messages', messageId), (res) => {
                setMessages(res.data().messages.reverse());
            })

            return () => {
                unSub();
            }
        }
    })
    return chatUser ? (
        <div className={`chat-box ${chatVisible ? "": "hidden"}`}>
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="" />
                <p>{chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className='dot' /> : null} </p>
                <img src={assets.help_icon} alt="" className="help" />
                <img onClick={() =>setChatVisible(false)} src={assets.arrow_icon} className="arrow" />
            </div>


            <div className="chat-msg">
                {messages != null && messages.map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                        {msg["image"] ? <img className='msg-img' src={msg.image} alt="" />  : <p className='msg'>{msg.text}</p>}
                        
                        <div>
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                            <p>{convertTimeStamp(msg.createdAt)}</p>
                        </div>
                    </div>

                ))}


                {/* <div className="s-msg">
                    <img src={assets.pic1} className="msg-img" />
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>10:11</p>
                    </div>
                </div>

                <div className="r-msg">
                    <p className='msg'>i am Good...</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>10:11</p>
                    </div>
                </div> */}
            </div>

            <div className="chat-input">

                <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Send A Message' />
                <input onChange={sendImage} type="file" id="image" accept='./image/png, image/jpeg' hidden />

                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="" />
                </label>
                <img onClick={sendMessage} src={assets.send_button} alt="" />
            </div>
        </div>
    ) : <div className={`chat-welcome ${chatVisible ? "": "hidden"}`}>
        <img src={assets.logo_icon} alt="" />
        <p>Chat Anytime, Anywhere</p>
    </div>
}

export default ChatBox
