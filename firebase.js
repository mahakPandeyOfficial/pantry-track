// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjisktprg_zOhB78daPhwdzEqWLMivonI",
  authDomain: "pantry-track-bca44.firebaseapp.com",
  projectId: "pantry-track-bca44",
  storageBucket: "pantry-track-bca44.appspot.com",
  messagingSenderId: "129702047190",
  appId: "1:129702047190:web:408149c8c34d1456bec877"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };