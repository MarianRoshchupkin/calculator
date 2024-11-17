import {getFirestore} from "firebase/firestore";
import {initializeApp} from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCx_juAea2JSzHojwaLYr07Wc5nyvww7o8",
  authDomain: "calculator-f1026.firebaseapp.com",
  projectId: "calculator-f1026",
  storageBucket: "calculator-f1026.firebasestorage.app",
  messagingSenderId: "621021867995",
  appId: "1:621021867995:web:b32fcc4b183af19bd4c1fe"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
