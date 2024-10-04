import React, { useContext, useEffect, useState } from 'react'
import './Chat.css'
import LeftSideBar from '../../components/LeffSideBar/LeftSideBar'
import ChatBox from '../../components/ChatBox/ChatBox'
import RightSideBar from '../../components/RightSideBar/RightSideBar'
import { useAsyncError } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const Chat = () => {

  const {chatData, userData} = useContext(AppContext);
  const [loading, setLoading] = useState(true);
 
  useEffect(() =>{
    if(userData && chatData){
      setLoading(false);
    }
  },[chatData, userData])
  return (
    <div className="chat">
      {loading ? <p className='loading'> Loading ... </p>
      :<div className="chat-container">
      <LeftSideBar/>
      <ChatBox/>
      <RightSideBar/>
      </div>
      }
    </div>
  )
}

export default Chat
