
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from 'firebase/storage'



const firebaseConfig = {
  apiKey: "AIzaSyDw4gRCJ5tJ9EeTOSwRSdT_oTLfBFL0RBM",
  authDomain: "chat-3eb07.firebaseapp.com",
  projectId: "chat-3eb07",
  storageBucket: "chat-3eb07.appspot.com",
  messagingSenderId: "315359503239",
  appId: "1:315359503239:web:7f870231876348fce42922"
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth=getAuth();
export const storage=getStorage();