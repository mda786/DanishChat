import Img from '../img/img.png'
import { useContext, useState } from 'react'
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { Timestamp, arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid'
import CryptoJS from 'crypto-js';
import { db, storage } from '../Firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  const handleSend = async () => {
    if (img) {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, img);
      uploadTask.on(
        (err) => {
          // setErr(true)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text: CryptoJS.AES.encrypt(text, "codeDanish").toString(),
                senderId: currentUser.uid,
                data: Timestamp.now(),
                img: downloadURL
              })
            })

          })
            .catch((error) => {
              // Handle getDownloadURL errors
              console.error("getDownloadURL error:", error);
            });
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text: CryptoJS.AES.encrypt(text, "codeDanish").toString(),
          senderId: currentUser.uid,
          data: Timestamp.now()
        })
      })
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text: CryptoJS.AES.encrypt(text, "codeDanish").toString(),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    })

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text: CryptoJS.AES.encrypt(text, "codeDanish").toString(),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    })

    setImg(null);
    setText("")
  }

  const handleKeyPress=(e)=>{
    e.code==="Enter" && handleSend();
  }

  return (
    <div className='input'>
      <input 
          onKeyDown={handleKeyPress}  type="text" placeholder='Type something...' onChange={e => setText(e.target.value)} value={text} />
      <div className="send">
        <input type="file" id='file' style={{ display: 'none' }} onChange={e => setImg(e.target.files[0])}  />
        <label htmlFor="file">
          <img src={Img} alt="" />
        </label>
        <button onClick={handleSend} disabled={text === ""}>Send</button>
      </div>
    </div>
  )
}

export default Input