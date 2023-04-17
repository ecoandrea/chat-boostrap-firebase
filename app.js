const btnIngresar = document.querySelector("#btnIngresar");
const btnSalir = document.querySelector("#btnSalir");
const chat = document.querySelector("#chat");
const formulario = document.querySelector("#formulario");
const btnEnviar = document.querySelector("#btnEnviar");
const msgInicio = document.querySelector("#msgInicio");
const msgTemplate = document.querySelector("#msgTemplate");

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATIuV9N0I-vjEWTtHbDZSezxuilW2O2Oc",
  authDomain: "firechat-bootstrap-b5c9d.firebaseapp.com",
  projectId: "firechat-bootstrap-b5c9d",
  storageBucket: "firechat-bootstrap-b5c9d.appspot.com",
  messagingSenderId: "136996821403",
  appId: "1:136996821403:web:88feca12b91dd09e82a93e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const eliminarElemento = (elemento) => {
  elemento.classList.add("d-none");
};

const visualizarElemento = (elemento) => {    elemento.classList.remove("d-none");
};

let unsubscribe;


onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("existe el user", );
    visualizarElemento(btnSalir);
    visualizarElemento(formulario);
    visualizarElemento(chat);
    eliminarElemento(btnIngresar);
    eliminarElemento(msgInicio);

    const q = query(collection(db, "chats"), orderBy("fecha"));
    chat.innerHTML = " ";
    unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New mesg: ", change.doc.data());

          //Manipulando el template

          const clone = msgTemplate.content.cloneNode(true);
          clone.querySelector("span").textContent = change.doc.data().msg;
          if (user.uid === change.doc.data().uid) {
            clone.querySelector("div").classList.add("text-end");
            clone.querySelector("span").classList.add("bg-success");
          } else {
            clone.querySelector("div").classList.add("text-start");
            clone.querySelector("span").classList.add("bg-secondary");
          }
          chat.append(clone);
        }

        chat.scrollTop = chat.scrollHeight

      });
    });
  } else {
    console.log("No existe");
    visualizarElemento(btnIngresar);
    visualizarElemento(msgInicio);
    eliminarElemento(btnSalir);
    eliminarElemento(formulario);
    eliminarElemento(chat);
 

if (unsubscribe) {
    unsubscribe()
}

  }
});

btnIngresar.addEventListener("click", async () => {
  
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log(result);
    } catch (error) {
      console.log(error);

    }
})

btnSalir.addEventListener("click", async () => {
  await signOut(auth);
});

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  //console.log(formulario.msg.value);
  if (!formulario.msg.value.trim()) {
    formulario.msg.value = "";
    formulario.msg.focus();
    return console.log("Tienes que escribir algo");
  }

  try {
    btnEnviar.disabled = true;
    await addDoc(collection(db, "chats"), {
      msg: formulario.msg.value.trim(),
      uid: auth.currentUser.uid,
      fecha: new Date(),
    });
    formulario.msg.value = "";
  } catch (error) {
    console.log(error);
  } finally {
    btnEnviar.disabled = false;
  }
});
