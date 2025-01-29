// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import {getDownloadURL, getStorage} from 'firebase/storage';
// import { ref, uploadBytesResumable } from 'firebase/storage';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCS0HFAIWrcUm52CaIfyMcNVdwzNfr6gK8",
//   authDomain: "aigithub-saas.firebaseapp.com",
//   projectId: "aigithub-saas",
//   storageBucket: "aigithub-saas.firebasestorage.app",
//   messagingSenderId: "833521598834",
//   appId: "1:833521598834:web:df2c32803f19aa2e499deb"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const storage=getStorage(app)


// export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
//     return new Promise((resolve, reject) => {
//         try {
//             const storageRef = ref(storage, file.name);
//             const uploadTask = uploadBytesResumable(storageRef, file);

//             uploadTask.on('state_changed', snapshot => {
//                 const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
//                 if (setProgress) setProgress(progress);

//                 switch (snapshot.state) {
//                     case 'paused':
//                         console.log('upload is paused');
//                         break;
//                     case 'running':
//                         console.log('upload is running');
//                         break;
//                 }
//             }, error => {
//                 reject(error);
//             }, () => {
//                 console.log('File uploaded successfully');
//                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl=>
//                 resolve(downloadUrl)
//                )
//             });
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             reject(error);
//         }
//     });
// }