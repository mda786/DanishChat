import { signOut } from 'firebase/auth'
import React, { useContext } from 'react'
import { auth } from '../Firebase'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
  const {currentUser}=useContext(AuthContext);
  return (
    <div className='navbar'>
        <span className='logo'>Danish Chat</span>
        <div className="user">
            <img src={currentUser.photoURL} alt="" />
            <span style={{textTransform:'capitalize'}}>{currentUser.displayName?.slice(0,6)}</span>
            <button onClick={()=>signOut(auth)}>logout</button>
        </div>
    </div>
  )
}

export default Navbar