// firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase, ref, set, get, push } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyABQPA2bFT4PWaJbhvhypBMDSBVKGtPY7M",
  authDomain: "sort-test-a4fad.firebaseapp.com",
  projectId: "sort-test-a4fad",
  storageBucket: "sort-test-a4fad.appspot.com",
  messagingSenderId: "935981312475",
  appId: "1:935981312475:web:c06df680c2d53b1c675ffe",
  databaseURL: "https://sort-test-a4fad-default-rtdb.firebaseio.com",
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { db, storage , database };