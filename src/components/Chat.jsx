import './components.scss'
import Cam from '../img/cam.png'
import Add from '../img/add.png'
import More from '../img/more.png'
import Messages from './Messages'
import Input from './Input'
import { useContext, useEffect, useState } from 'react'
import { ChatContext } from '../context/ChatContext'
import { AuthContext } from '../context/AuthContext'
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential, updateEmail, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db, storage } from '../Firebase'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { accountAlreadyExist, usernameAlreadyExist, valFile, valName, validateEmail } from '../pages/Register/Register'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'




const Chat = () => {
  const { currentUser } = useContext(AuthContext)
  const { data } = useContext(ChatContext);
  const [userarr, setUserarr] = useState([])
  const [imgUrl, setImgUrl] = useState(null)
  const [file, setFile] = useState(currentUser.photoURL)
  const [text, setText] = useState(currentUser.displayName)
  const [email, setEmail] = useState(currentUser.email)
  const [isDisable, setIsDisable] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    const data = async () => {

      try {
        const docs = await getDocs(collection(db, "users"))
        const docsArr = [];
        docs.forEach((doc) => {
          docsArr.push({
            id: doc.id,
            username: doc.data().displayName,
            email: doc.data().email
          })
        })
        setUserarr(docsArr)

      } catch (err) {
        console.log(err);
      }
    }
    return () => {
      data();
    }

  }, [])

  const handleUpdate = async () => {


    const password = prompt("Enter your password for verification...")
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
      if (!accountAlreadyExist(email, userarr) && !usernameAlreadyExist(text, userarr) && valFile(file) && valName(text) && validateEmail(email)) {

        const storageRef = ref(storage, currentUser.uid);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          (err) => {

          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
              await updateProfile(currentUser, {
                displayName: text,
                photoURL: downloadURL
              })

              reauthenticateWithCredential(currentUser, credential).then(async () => {
                await updateEmail(currentUser, email).then(() => { alert("Successfuly updated...")
                window.location.reload(); })
              })

            });
          }
        );
      } else if (accountAlreadyExist(email)) {
        alert("you already have an account...");
        navigate('/login');
      }
      else if (usernameAlreadyExist(text)) {
        alert("Username already exist...")
      }
      else if (!valName(text)) {
        alert("userName shoud be contain at least 3 character and no any white spaces...")
      } else if (!valFile(file)) {
        alert("plz choose an image file...")
      }
      else {
        alert("plz enter valid email address...")
      }


    } catch (error) {
      console.log(error);

    }


  }

  const handleDelete = () => {
    const password = prompt("Enter your password")
    const credential = EmailAuthProvider.credential(currentUser.email, password);

    reauthenticateWithCredential(currentUser, credential).then(async () => {

      alert("authenticated successfully")
      await deleteDoc(doc(db, "users", currentUser.uid));
      await deleteDoc(doc(db, "userChats", currentUser.uid));
      deleteUser(currentUser).then(() => {
        alert("user has been deleted successfully")
        navigate('/login')
      }).catch((error) => {
        alert("user has not been deleted successfully")
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <div className='chat'>
      {data.chatId !== 'null' ? <><div className="chatinfo">
        <span>{data.user.displayName}</span>
        <div className="chaticons">
          <img src={Cam} alt="" />
          <img src={Add} alt="" />
          <img src={More} alt="" />
        </div>
      </div>
        <Messages />
        <Input /></> : <>
        <div className="chatinfo" style={{ backgroundColor: '#2F2D52' }}>
          <span></span>
          <div className="chaticons">
            <span style={{ cursor: 'pointer' }} onClick={handleDelete}>Delete Account</span>
          </div>
        </div>
        <div className="messages" style={{ backgroundColor: '#4d4b76' }}>
          <div className="messageswrapper">
            <div className="messagecontent">
              <label className='userLabel' htmlFor="file">
                <img src={imgUrl ? imgUrl : currentUser.photoURL} alt="" />
                {!isDisable && <i className="fa-regular fa-pen-to-square edit"></i>}
              </label>
              <input type="file" id='file' style={{ display: 'none' }} disabled={isDisable} onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFile(file)
                  setImgUrl(URL.createObjectURL(file))
                }
              }} />
              <div className="content">
                <span>Username: </span>
                <input type="text" value={text} disabled={isDisable} onChange={(e) => {
                  setText(e.target.value)
                }} />

              </div>
              <div className="content">
                <span>Email: </span>
                <input type="email" value={email} disabled={isDisable} onChange={(e) => {
                  setEmail(e.target.value)
                }} />
              </div>
            </div>
            {!isDisable ? <button onClick={handleUpdate} className='button'>Update profile</button> :
              <span onClick={() => { setIsDisable(false) }} className='span'>Edit your profile <i className="fa-regular fa-pen-to-square"></i></span>
            }
          </div>
        </div>
        <div className="input footer" style={{ backgroundColor: '#4d4b76' }} >
          <i className="fa-solid fa-lock"></i>
          <span >End-to-end encrypted</span>
        </div>
      </>}
    </div>
  )
}

export default Chat