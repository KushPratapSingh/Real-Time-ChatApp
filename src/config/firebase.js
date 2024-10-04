// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { toast } from "react-toastify";
import { collection, doc, getDoc, getFirestore, query, setDoc, where } from "firebase/firestore";
// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDxBBcJ2J0QK3brs41BoSq39PvypJYZg04",
//   authDomain: "chat-app-gs-25969.firebaseapp.com",
//   projectId: "chat-app-gs-25969",
//   storageBucket: "chat-app-gs-25969.appspot.com",
//   messagingSenderId: "915449054594",
//   appId: "1:915449054594:web:58aa4019c174e0345fbb9b"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

//  Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3XiaZk5tLCVUF1kjKkZeqbB72NnZ_Oog",
  authDomain: "chat-app-ed34e.firebaseapp.com",
  projectId: "chat-app-ed34e",
  storageBucket: "chat-app-ed34e.appspot.com",
  messagingSenderId: "882740500269",
  appId: "1:882740500269:web:9c0012a648d7780da525a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//  initialize and retrieve the authentication instance associated with a particular Firebase app.
const auth = getAuth(app);
// intitalise db
const db = getFirestore(app);

// create new user
const  signup = async (username, email, password) =>{
    try{
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

//         doc(db, "collectionName", "documentId"): Specifies the document you want to write to. In this example, it's a document with the ID user.uid inside the users collection.
// setDoc(): Writes data to the document. If the document doesn't exist, it creates a new one; if it exists, it will overwrite the existing data. 
         

        // user data in users collection
        await setDoc(doc(db, "users", user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"I am Good",
            lastSeen:Date.now() 
        });

        // user chat store in chats collection
        await setDoc(doc(db, "chats",user.uid),{
            chatData:[]
        });
    }
    catch(error){
        console.error(error);

        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

// login 
const login = async (email, password) =>{

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

// logout
const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}


const resetPass = async (email) =>{

    if(!email){
        toast.error('Enter Email Address');
        return null;
    }
    try {
        
        const userRef = collection(db,'users');
        const q = query(userRef, where("email","==", email));
        const querySnap = await getDoc(q);
        if(!querySnap){
            await sendPasswordResetEmail(auth, email);
            toast.success('Reset Email Sent');
        }
        else{
            toast.error('Email Does Not Exist');
        }
    } catch (error) {
        toast.error(error.message);
    }
}
export {signup, login, logout, auth, db, resetPass}