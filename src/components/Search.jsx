import { useContext, useState } from 'react'
import './components.scss'
import {db} from '../Firebase'
import {AuthContext} from '../context/AuthContext'
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';

const Search = () => {
  const [username,setUsername]=useState("");
  const [user,setUser]=useState(null);
  const [err,setErr]=useState(false);
  const {currentUser}=useContext(AuthContext)
  const handleSearch=async()=>{
    const q=query(collection(db,'users'),where("displayName","==",username))
    try {
      const querySnapshot=await getDocs(q);
      querySnapshot.forEach(doc => {
        setUser(doc.data());
        console.log(doc.data());
      }); 
    } catch (error) {
      setErr(true);
    }
    
  }
  
  const handleKey=(e)=>{
    e.code==="Enter" && handleSearch();
  }


  const handleSelect=async()=>{
    const combinedId=currentUser.uid>user.uid?currentUser.uid+user.uid:user.uid+currentUser.uid;

    try {
      const res=await getDoc(doc(db,'chats',combinedId));
      const user1=await getDoc(doc(db,"userChats",currentUser.uid));
      const user2=await getDoc(doc(db,"userChats",user.uid));

    if(!res.exists()){
      await setDoc(doc(db,"chats",combinedId),{messages:[]});

      await updateDoc(doc(db,"userChats",currentUser.uid),{
        [combinedId+".userInfo"]:{
          uid:user.uid,
          displayName:user.displayName,
          photoURL:user.photoURL
        },
        [combinedId+".date"]:serverTimestamp()
      });

      await updateDoc(doc(db,"userChats",user.uid),{
        [combinedId+".userInfo"]:{
          uid:currentUser.uid,
          displayName:currentUser.displayName,
          photoURL:currentUser.photoURL
        },
        [combinedId+".date"]:serverTimestamp()
      })
 
    }else if(!user1.exists()){
      await setDoc(doc(db,"userChats",currentUser.uid),{}).then(()=>alert('created'));
      await updateDoc(doc(db,"userChats",currentUser.uid),{
        [combinedId+".userInfo"]:{
          uid:user.uid,
          displayName:user.displayName,
          photoURL:user.photoURL
        },
        [combinedId+".date"]:serverTimestamp()
      });
    }else if(!user2.exists()){
      await setDoc(doc(db,"userChats",user.uid),{}).then(()=>alert('created'));
      await updateDoc(doc(db,"userChats",user.uid),{
        [combinedId+".userInfo"]:{
          uid:currentUser.uid,
          displayName:currentUser.displayName,
          photoURL:currentUser.photoURL
        },
        [combinedId+".date"]:serverTimestamp()
      });
    }else if(!user1.exists()&&!user2.exists()){
      await setDoc(doc(db,"userChats",user.uid),{}).then(()=>alert('created'));
      await updateDoc(doc(db,"userChats",user.uid),{
        [combinedId+".userInfo"]:{
          uid:currentUser.uid,
          displayName:currentUser.displayName,
          photoURL:currentUser.photoURL
        },
        [combinedId+".date"]:serverTimestamp()
      });
      await setDoc(doc(db,"userChats",currentUser.uid),{});
      await updateDoc(doc(db,"userChats",currentUser.uid),{
        [combinedId+".userInfo"]:{
          uid:user.uid,
          displayName:user.displayName,
          photoURL:user.photoURL
        },
        [combinedId+".date"]:serverTimestamp()
      });
    }
    else{
      await updateDoc(doc(db,"userChats",currentUser.uid),{
        [combinedId+".userInfo"]:{
          uid:user.uid,
          displayName:user.displayName,
          photoURL:user.photoURL
        },
        [combinedId+".date"]:serverTimestamp()
      });

      await updateDoc(doc(db,"userChats",user.uid),{
        [combinedId+".userInfo"]:{
          uid:currentUser.uid,
          displayName:currentUser.displayName,
          photoURL:currentUser.photoURL
        },
        [combinedId+".date"]:serverTimestamp()
      })
    }
    } catch (error) {
      
    }
    setUser(null)
    setUsername("")
  }


  return (
    <div className='search'>
      <div className="searchform">
          <input type="text" value={username} placeholder='search user..' onKeyDown={handleKey} onChange={e=>setUsername(e.target.value)}/>
      </div>
      {err && <span>User not found!</span>}
      {user && <div className="userChats" onClick={handleSelect}>
        <img src={user.photoURL} alt="" />
        <div className="userchatinfo">
          <span>{user.displayName}</span>
        </div>
      </div>}
    </div>
  )
}

export default Search