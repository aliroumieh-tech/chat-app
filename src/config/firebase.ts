// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVRjIP9OwxQdRfNyMV1PfmND1xmSVXvMk",
  authDomain: "chat-app-b7845.firebaseapp.com",
  projectId: "chat-app-b7845",
  storageBucket: "chat-app-b7845.appspot.com",
  messagingSenderId: "729971484392",
  appId: "1:729971484392:web:a6a078cd85e117c6cd0b5d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
