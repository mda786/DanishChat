import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import './Register.scss'
import Add from '../../img/addAvatar.png'
import { auth, db, storage } from '../../Firebase'
import { useEffect, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL, getMetadata } from "firebase/storage";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";


export const validateEmail = (email) => {
  const emailPattern = /^[a-z0-9.]+@gmail\.com$/;
  return emailPattern.test(email);
}

export const strogPassword = (password) => {
  const spPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  return spPattern.test(password)
}

export const valName = (name) => {
  const un = name.replaceAll(" ", "");
  if (name === un && name.length >= 3) {
    return true;
  }
  return false;
}

export const valFile = (file) => {
  if (file === null) {
    return false;
  }
  return true;
}

export const usernameAlreadyExist = (name, userarr) => {
  return userarr && userarr.some(item => item.username === name);
}
export const accountAlreadyExist = (email, userarr) => {
  return userarr && userarr.some(item => item.email === email);
}


const Register = () => {
  const [err, setErr] = useState(false)
  const navigate = useNavigate();
  const [img, setImage] = useState(null);
  const [imgUrl, setImgUrl] = useState(null)
  const [userarr, setUserarr] = useState([])

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



  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];



    try {
      if (!accountAlreadyExist(email, userarr) && !usernameAlreadyExist(name, userarr) && valFile(file) && valName(name) && validateEmail(email) && strogPassword(password)) {

        const res = await createUserWithEmailAndPassword(auth, email, password)
        setImage(file)

        const storageRef = ref(storage, res.user.uid);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          (err) => {
            setErr(true)
          },
          async () => {

            const fileExists = await checkFileExistence(storageRef);
            console.log(fileExists);
            if (fileExists) {
              getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                await updateProfile(res.user, {
                  displayName: name,
                  photoURL: downloadURL
                });
                await setDoc(doc(db, "users", res.user.uid), {
                  uid: res.user.uid,
                  displayName: name,
                  email: email,
                  photoURL: downloadURL
                });

                await setDoc(doc(db, "userChats", res.user.uid), {});
                navigate('/')

              });
            }
          }
        );
      } else if (accountAlreadyExist(email)) {
        alert("you already have an account...");
        navigate('/login');
      }
      else if (usernameAlreadyExist(name)) {
        alert("Username already exist...")
      }
      else if (!strogPassword(password)) {
        alert("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one special character, and one digit.")
      } else if (!valName(name)) {
        alert("userName shoud be contain at least 3 character and no any white spaces...")
      } else if (!valFile(file)) {
        alert("plz choose an image file...")
      }
      else {
        alert("plz enter valid email address...")
      }


    } catch (error) {
      console.log(err);
      setErr(true)
    }

  }

  const checkFileExistence = async (storageRef) => {
    try {
      const metadata = await getMetadata(storageRef);
      return !!metadata;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <div className="formcontainer">
      <div className="formwrapper">
        <span className="logo">Danish Chat</span>
        <div className="title">Register</div>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" />
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <label htmlFor="file">
            {imgUrl ? (
              <img src={imgUrl} alt="Avatar" />
            ) : (
              <img src={Add} alt="Add an avatar" />
            )}
            <span>{img ? img.name : "Add an avatar"}</span>
          </label>
          <input type="file" id='file' style={{ display: 'none' }} onChange={(e) => {
            const file = e.target.files[0];
            setImage(file);
            setImgUrl(URL.createObjectURL(file))
          }} />
          <button type="submit">Sign Up</button>
          {err && <span style={{ color: "red", marginTop: "2px" }}>Something went wrong...</span>}
        </form>
        <p>Do you have an account? <Link to='/login'>Login</Link></p>
      </div>
    </div>
  )
}

export default Register