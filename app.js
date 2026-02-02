const username = localStorage.getItem("username") || "User";

const bootScreen = document.getElementById('boot-screen');
const bootTextEl = document.getElementById('boot-text');

const boottext = `Student LifeOS v1.1.0

Initializing system...
Doing stuff...
Memory Test... OK
Made with ♡ by Nishka Kanchan

Loading modules...
Starting services...
SYSTEM.DAT........OK
COMMAND.COM.......OK

Initializing GUI...
Welcome back, ${username}!`;

let _typing = false;

function startBootSequence() {
    if (!bootScreen || !bootTextEl) {
        setTimeout(() => window.location.href = './dashboard.html', 700);
        return;
    }

    bootScreen.classList.add('visible');
    bootTextEl.textContent = '';
    _typing = true;
    let idx = 0;

    function typeNext() {
        if (idx >= boottext.length) {
            _typing = false;
            setTimeout(() => {
                bootScreen.classList.add('fade-out');
                setTimeout(() => {
                    bootScreen.classList.remove('visible', 'fade-out');
                    bootTextEl.textContent = '';
                    window.location.href = './dashboard.html';
                }, 900);
            }, 700);
            return;
        }

        const ch = boottext.charAt(idx);
        bootTextEl.textContent += ch;
        idx++;

        let delay = 22;
        if (ch === '\n') delay = 120;
        if (ch === '.' || ch === ',') delay = 60;
        if (ch === ' ') delay = 12;

        setTimeout(typeNext, delay);
    }

    typeNext();
}

/*window.addEventListener("load", () => {
    startEnteringSequence();
});*/

const enteringScreen = document.getElementById('entering');
const enteringTextEl = document.getElementById('entering-text');

function startEnteringSequence() {
    enteringScreen.style.display = 'block';
    if (!enteringScreen || !enteringTextEl) {
        return;
    }

    enteringScreen.classList.add('visible');
    enteringTextEl.textContent = 'Entering Student LifeOS...';

    setTimeout(() => {
        setTimeout(() => {
            enteringScreen.classList.remove('visible');
            enteringTextEl.textContent = '';
            //autoGoogleLogin();
            bootScreen.style.display = 'block';
            startBootSequence();
        }, 1500);
    }, 1900);
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Function to auto login - wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-button");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const provider = new GoogleAuthProvider();
      
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          const name = user.displayName || "User";
          
          // Save name for personalization
          localStorage.setItem("username", name);
          
          // starting the entering sequence
          startEnteringSequence();
          
        })
        .catch((err) => {
          console.error("Sign-in error:", err);
          console.error("Error code:", err.code);
          console.error("Error message:", err.message);
          alert("Login failed — " + err.message);
        });
    });
  }
});