import { useContext, useEffect, useState } from 'react'
import './components.scss'
import { AuthContext } from '../context/AuthContext';
import { deleteField, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { ChatContext } from '../context/ChatContext';
import CryptoJS from 'crypto-js';


const Chats = () => {
  const [chats, setChats] = useState([]);
  const [isVisible, setIsVisible] = useState(null);
  const { currentUser } = useContext(AuthContext)
  const { dispatch } = useContext(ChatContext)

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data())
      })
      return () => {
        unsub();
      }
    }

    currentUser.uid && getChats();

  }, [currentUser.uid])

  const truncateMsg = (message) => {
    const words = message.split(' ');
    if (words.length <= 5) {
      return message;
    }
    const trText = words.slice(0, 5).join(' ');
    return `${trText}...`

  }

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u })
    setIsVisible(null)
  }

  const handleDelete = async (e, chatId) => {
    e.preventDefault();
    await updateDoc(doc(db, 'userChats', currentUser.uid), {
      [chatId]: deleteField()
    }).then(() => {
      setIsVisible(null);
      
    dispatch({ type: "CHANGE_USER", payload: {
      chatId:"null",
      user:{}
  } })
      window.location.reload();
    })
  }


  const handleContextMenu = (event, chatId) => {
    event.preventDefault();
    setIsVisible(chatId);
  };



  const contextMenuStyle = {
    display: isVisible ? 'block' : 'none',
    position: 'absolute',
    right: `10px`,
    bottom: `-5px`,
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

    <div className='chats' >
      {chats && Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map((chat) => (
        <div className="userchat " onContextMenu={(e) => handleContextMenu(e, chat[0])} key={chat[0]} onClick={() => handleSelect(chat[1].userInfo)}>
          <img src={chat[1].userInfo.photoURL} alt="" />
          <div className="userchatinfo">
            <span>{chat[1].userInfo.displayName}</span>
            <p>{chat[1].lastMessage && truncateMsg(CryptoJS.AES.decrypt(chat[1].lastMessage?.text, "codeDanish").toString(CryptoJS.enc.Utf8))}</p>
          </div>
          {isVisible === chat[0] && (
            <div style={contextMenuStyle} onClick={(e) => handleDelete(e, chat[0])}>
              Delete Chat
            </div>
          )}
        </div>
      ))}

    </div>


  )
}

export default Chats