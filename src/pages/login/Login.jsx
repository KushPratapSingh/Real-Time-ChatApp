import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'

import { signup , login, resetPass} from '../../config/firebase'

const Login = () => {
    const [curState, seturState] = useState("Sign Up");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const onSubmitHandler = (event) =>{
      // no reload on submit
      event.preventDefault();
      if(curState === 'Sign Up'){
        signup(userName, email, password);
      }
      else{
        login(email, password)
      }
    }
  return (
    <div className="login">
      <img src={assets.logo_big} className="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{curState}</h2>
        {curState === 'Sign Up' ?  <input onChange={(e) => setUserName(e.target.value)} value={userName} type="text" placeholder='username' className="form-input" required /> : null}
        
        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder='email address' className="form-input" required/>
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='password' className="form-input" required />

        <button  type='Submit'>{curState === 'Sign Up' ? "Create Account" : "Log In"}</button>


        <div className="login-term">
          <input type="checkbox" />
          <p>Agree To The Terms And Privacy Policy</p>
        </div>

        <div className="login-forgot">

          {curState === "Sign Up" ? <p className='login-toggle'> Already Have An Account ? <span onClick={() =>{seturState("Log In")}}>Click Here</span> </p>
          : <p className='login-toggle'> Doesn't Have An Account ? <span onClick={() =>{seturState("Sign Up")}}>Create One</span> </p>}
        {curState === 'Log In' ? <p className='login-toggle'> Forgot Password <span onClick={() => resetPass(email) }>Reset Password</span> </p> : null }
        </div>
      </form>
    </div>
  )
}

export default Login
