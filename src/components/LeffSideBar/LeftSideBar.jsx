import React, { useContext, useEffect, useState } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSideBar = () => {
  const navigate = useNavigate();
  const { userData, chatData = [], chatUser, setChatUser, setMessageId, messageId, chatVisible, setChatVisible } = useContext(AppContext)
  const [user, setUser] = useState(null)

  const [showSearch, setShowSearch] = useState(false)

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where("username", "==", input.toLowerCase()))
        const querySnap = await getDocs(q);
        // console.log(querySnap)
        if (!querySnap.empty) {
          setUser(querySnap.docs[0].data())
        }
        else {
          setUser(null)
        }
      }
      else {
        setShowSearch(false)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }


  // const addChat = async ()=>{
  //   const messageRef = collection(db, "messages");
  //   const chatRef = collection(db, "chats");
  //   try {
  //     const newMessageRef = doc(messageRef);
  //     await setDoc(newMessageRef,{
  //       createAt : serverTimestamp(),
  //       messages : []
  //     })


  //     await updateDoc(doc(chatRef, user.id),{
  //       chatData : arrayUnion({
  //         messageId : newMessageRef.id,
  //         lastmsg:'',
  //         rId:userData.id,
  //         updatedAt: Date.now(),
  //         messageSeen:true
  //       }) 
  //     })

  //     await updateDoc(doc(chatRef, userData.id),{
  //       chatData : arrayUnion({
  //         messageId : newMessageRef.id,
  //         lastmsg:'',
  //         rId:user.id,
  //         updatedAt: Date.now(),
  //         messageSeen:true
  //       }) 
  //     })
  //   } catch (error) {
  //     toast.error(error)
  //   }
  // }

  // const addChat = async () => {
  //   try {
  //     console.log("Adding chat between", user.id, "and", userData.id);

  //     const messageRef = collection(db, "messages");
  //     const chatRef = collection(db, "chats");
  //     const newMessageRef = doc(messageRef);

  //     await setDoc(newMessageRef, {
  //       createAt: serverTimestamp(),
  //       messages: []
  //     });

  //     const chatDocUser = await getDoc(doc(chatRef, user.id));
  //     const chatDocUserData = await getDoc(doc(chatRef, userData.id));

  //     if (!chatDocUser.exists()) {
  //       await setDoc(doc(chatRef, user.id), { chatData: [] });
  //     }
  //     if (!chatDocUserData.exists()) {
  //       await setDoc(doc(chatRef, userData.id), { chatData: [] });
  //     }

  //     await updateDoc(doc(chatRef, user.id), {
  //       chatData: arrayUnion({
  //         messageId: newMessageRef.id,
  //         lastmsg: '',
  //         rId: userData.id,
  //         updatedAt: Date.now(),
  //         messageSeen: true
  //       })
  //     });

  //     await updateDoc(doc(chatRef, userData.id), {
  //       chatData: arrayUnion({
  //         messageId: newMessageRef.id,
  //         lastmsg: '',
  //         rId: user.id,
  //         updatedAt: Date.now(),
  //         messageSeen: true
  //       })
  //     });

  //     const uSnap = await getDoc(doc(db,'users',user.id));

  //     const uData = uSnap.data();
  //     setChat({
  //       messageId : newMessageRef.id,
  //       lastmsg:"",
  //       rId:user.id,
  //       updatedAt:Date.now(),
  //       messageSeen:true,
  //       userData:uData
  //     })
  //     setShowSearch(true)
  //     setChatVisible(true);
  //     toast.success("Chat added successfully!");

  //   } catch (error) {
  //     console.error("Error adding chat:", error);  // Error log
  //     toast.error("Failed to add chat");
  //   }
  // };

  const addChat = async () => {
    try {
      console.log("Adding chat between", user.id, "and", userData.id);
  
      const messageRef = collection(db, "messages");
      const chatRef = collection(db, "chats");
      
      // Check if chat already exists between these two users
      const existingChatSnapshot = await getDoc(doc(chatRef, userData.id));
      const existingChatData = existingChatSnapshot.data();
      
      const chatExists = existingChatData?.chatData?.some(chat => chat.rId === user.id);
  
      if (chatExists) {
        toast.info("Chat already exists.");
        return;
      }
  
      const newMessageRef = doc(messageRef);
  
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: []
      });
  
      const chatDocUser = await getDoc(doc(chatRef, user.id));
      const chatDocUserData = await getDoc(doc(chatRef, userData.id));
  
      if (!chatDocUser.exists()) {
        await setDoc(doc(chatRef, user.id), { chatData: [] });
      }
      if (!chatDocUserData.exists()) {
        await setDoc(doc(chatRef, userData.id), { chatData: [] });
      }
  
      await updateDoc(doc(chatRef, user.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastmsg: '',
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true
        })
      });
  
      await updateDoc(doc(chatRef, userData.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastmsg: '',
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true
        })
      });
  
      const uSnap = await getDoc(doc(db, 'users', user.id));
  
      const uData = uSnap.data();
      setChat({
        messageId: newMessageRef.id,
        lastmsg: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData
      });
  
      setShowSearch(true);
      setChatVisible(true);
      toast.success("Chat added successfully!");
  
    } catch (error) {
      console.error("Error adding chat:", error);
      toast.error("Failed to add chat");
    }
  };
  

  const setChat = async (item) => {

    try {
      setMessageId(item.messageId);
      setChatUser(item);
      const userChatRef = doc(db, 'chats', userData.id)
      const userChatSnapshot = await getDoc(userChatRef);
      const userChatData = userChatSnapshot.data();
      const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === item.messageId);
      userChatData.chatData[chatIndex].messageSeen = true;
      await updateDoc(userChatRef, {
        chatData: userChatData.chatData
      })


      setChatVisible(true)
    } catch (error) {
      toast.error(error.message);
    }

  }



  useEffect( ()=> {
    const updateChatUserData = async () =>{
      if(chatUser){
        const userRef = doc(db,'users',chatUser.chatData.id)
        const userSnap = await getDoc(userRef);
        const userData = userRef.data();
        setChatUser(prev => ({...prev, userData:userData}))
      }
    }
  } , [chatData])
  return (
    <div>
      <div className={`ls ${chatVisible ? "hidden" : ""}`} >
        <div className="ls-top">
          <div className="ls-nav">
            <img src={assets.logo} className="logo" />

            <div className="menu">
              <img src={assets.menu_icon} />
              <div className="sub-menu">

                <p onClick={() => navigate('/profile')}>Edit Profile</p>
                <hr />
                <p>Log Out</p>
              </div>
            </div>

          </div>

          <div className="ls-search">
            <img src={assets.search_icon} alt="" />

            <input onChange={inputHandler} type="text" placeholder='Search Here' />
          </div>

          <div className="ls-list">
            {showSearch && user ?
              <div onClick={addChat} className='friends add-user'>
                <img src={user.avatar} alt="" />
                <p>{user.name}</p>
              </div>
              :
              chatData != null && chatData.map((item, index) => (
                <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messageId ? "" : "border"}`}>
                  <img src={item.userData.avatar} alt="" />
                  <div>
                    <p>{item.userData.name} </p>
                    <span>{item.lastmsg} </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeftSideBar
