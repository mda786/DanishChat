import React, { useContext, useEffect, useState } from 'react'
import Message from './Message'
import { ChatContext } from '../context/ChatContext'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../Firebase'

const Messages = () => {
  const [messages,setMessages]=useState([])
  const {data}=useContext(ChatContext);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"chats",data.chatId),(doc)=>{
      doc.exists() && setMessages(doc.data().messages);
    })

    return ()=>{
      unsub();
    }
  },[data.chatId])
  return (
    <div className='messages'>
      {messages.map((m,index)=>(
        <Message message={m} key={m.id} index={index}/>
      ))}
     
    </div>
  )
}

export default Messages