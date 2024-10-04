import React, { useCallback, useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upoad';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
  
  const [image, setImage] = useState(false);
  const [name, setName]  = useState('');
  const [bio, setBio] = useState('');
  const [uid, setUid] = useState('')
  const [prevImage, setPrevImage] = useState('');


  const {setUserData} = useContext(AppContext)
  const navigate = useNavigate();  

  

  const profileUpdate = async (event) => {

    event.preventDefault();
    try {

      if( !prevImage && !image){
        toast.error('Upload Profile Pic');
      }
      const docRef = doc(db, 'users',uid);
      if(image){
        // console.log('Image to Hai')
        const imageURL = await upload(image);
        setPrevImage(imageURL);
        // console.log( "image url")
        await updateDoc(docRef, {
          avatar:imageURL,
          bio:bio,
          name:name
        })
      }
      else{
        await updateDoc(docRef, {
          bio:bio,
          name:name
        }) 
      }
      const snap =await getDoc(docRef);

      setUserData(snap.data());
      navigate('/chat');
    } catch (error) {
      console.log(error)
      toast.error(error.message);
    }
  }


  useEffect(() =>{
    onAuthStateChanged(auth, async(user) =>{
      if(user){
        if (!user.uid) {
          toast.error("User is not authenticated. Please log in.");
          return;
        }
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if(docSnap.data().name){
          setName(docSnap.data().name);
        }
        if(docSnap.data().bio){
          setBio(docSnap.data().bio);
        }if(docSnap.data().avatar){
          setPrevImage(docSnap.data().avatar);
        }
      }
      else{
        navigate('/');
      }
    })
  },[]);
  return (
    <div className="profile">
      <div className="profile-container">
        <form  onSubmit={profileUpdate} >
      
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            
            <input onChange={(e) => setImage(e.target.files[0])} type="file"  id='avatar' accept='.png, .jpg' hidden />
            <img src={image ? URL.createObjectURL(image) :assets.avatar_icon} alt="" />
            Upload Profile Image
          </label>
      
          <input onChange={(e) => setName(e.target.value)} value={name} type="text"  placeholder='Your Name' required />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder="Write Your Bio" required></textarea>

           <button type='submit'>Save Details</button>
          
        </form>
      
        <img src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon}  className='profile-pic' />
      </div>
    </div>
  )
}

export default ProfileUpdate
