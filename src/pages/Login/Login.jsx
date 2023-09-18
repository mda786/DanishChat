import {  useState } from 'react';
import '../Register/Register.scss'
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../Firebase';

const Login = () => {
  const [err, setErr] = useState(false)
  const navigate=useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    try {
      await signInWithEmailAndPassword(auth,email,password);
      navigate('/');

    } catch (error) {
      console.log(err);
      setErr(true)
    }

  }
  return (
    <div className="formcontainer">
        <div className="formwrapper">
            <span className="logo">Danish Chat</span>
            <div className="title">Login</div>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="email"/>
                <input type="password" placeholder="password"/>
                <button typeof='submit'>Sign In</button>
            </form>
          {err && <span>Something went wrong...</span>}

            <p>Do you not have an account?<Link to='/register'>Register</Link> </p>
        </div>
    </div>
  )
}

export default Login