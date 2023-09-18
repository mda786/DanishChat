import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import CryptoJS from 'crypto-js';
import { doc, getDoc,updateDoc } from 'firebase/firestore';
import { db } from '../Firebase';

const Message = ({message,index}) => {
  const {currentUser}=useContext(AuthContext)
  const {data}=useContext(ChatContext)
  const ref=useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [deleteIndex,setDeleteIndex]=useState(null);

  useEffect(()=>{
    ref.current?.scrollIntoView({behavior:"smooth"})
  },[message])

  const handleContextMenu = (event) => {
    event.preventDefault();
    setIsVisible(true);
    setDeleteIndex(index);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setIsVisible(false);
    const docSnapshot = await getDoc(doc(db,'chats',data.chatId));
    if (docSnapshot.exists()) {
      const data1 = docSnapshot.data();
      let messages1 = data1['messages']|| []; 
      if (deleteIndex >= 0 && deleteIndex < messages1.length) {
        messages1.splice(deleteIndex, 1);
        try {
          await updateDoc(doc(db, 'chats', data.chatId), {
            messages: messages1
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        console.error('Invalid index to delete.');
      }
    } else {
      console.error('Document does not exist.');
    }
        
  }

  const contextMenuStyle1 = {
    display: isVisible ? 'block' : 'none',
    position: 'absolute',
    left: `-10px`,
    top: `-20px`,
    background: 'white',
    border: 'none',
    padding: '5px',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'white',
    backgroundColor: 'gray',
    fontSize: '12px'
  };



  return (
    <div ref={ref} className={`message ${message.senderId===currentUser.uid && 'owner'}`} onContextMenu={handleContextMenu} >
        <div className="messageinfo">
            <img src={message.senderId===currentUser.uid?currentUser.photoURL:data.user.photoURL} alt="" />
            <span>just now</span>
        </div>
        <div className="messagecontent">
            <p onClick={()=>setIsVisible(false)}>{CryptoJS.AES.decrypt(message.text,"codeDanish").toString(CryptoJS.enc.Utf8)}</p>
            {message.img && <img src={message.img} alt="" />}
            {isVisible && message.senderId===currentUser.uid &&(
            <div style={contextMenuStyle1} onClick={(e)=>handleDelete(e)}>
              Delete Chat
            </div>
          )}
        </div>
        
    </div>
  )
}

export default Message