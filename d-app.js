// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqBdzDj58yRkvpsQlseX8U8_aBHnP54FY",
    authDomain: "student-lifeos.firebaseapp.com",
    projectId: "student-lifeos",
    storageBucket: "student-lifeos.firebasestorage.app",
    messagingSenderId: "786061696395",
    appId: "1:786061696395:web:cfdbd43476260a30eca38e",
    measurementId: "G-6TWTLG5R0L"
};

// Initialize Firebase again
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    console.log(user);

    const name = user.displayName;
    const photo = user.photoURL;
    const email = user.email;

    const usernameEl = document.getElementById("username");
    const profilePicEl = document.getElementById("profile-pic");

    if (usernameEl) {
      usernameEl.textContent = name || email || "User";
    }

    if (profilePicEl && photo) {
      profilePicEl.src = photo;
      profilePicEl.alt = name || "Profile";
    }

  } else {
    // User is NOT logged in
    window.location.href = "index.html";
  }
});

// user log out logic
const settingsBtn = document.getElementById("settings");
if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });
}

/*the adding apps part*/
const addBtn = document.getElementById("add");
const modal = document.getElementById("add-modal");
const closeModal = document.getElementById("close-modal");
const newBtn = document.getElementById("new-button");
const appSection = document.getElementById("apps-section");

addBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

newBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

document.querySelectorAll(".block-option").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;

    appSection.style.border = "none";
    
    if (type === "todo") {
      const todoBlock = createTodoBlock();
      appSection.appendChild(todoBlock);
    }

    if (type === "pomodoro") {
      appSection.appendChild(createPomodoroBlock());
    }

    if (type === "divider") {
      appSection.appendChild(createDividerBlock());
    }

    modal.classList.add("hidden");
    addBtn.style.display = "none";
  });
});

// Todo list block
function createTodoBlock() {
  const block = document.createElement("div");
  block.className = "block todo-block";
  block.innerHTML = `
    <div class="drag-handle">⠿</div>
    <input class="block-title" placeholder="Todo List Title" style="font-size: 30px;"/>
    
    <div class="todo-items"></div>

    <div class="todo-input">
      <input type="text" placeholder="New task..." />
      <button>Add</button>
    </div>
  `;

  const itemsContainer = block.querySelector(".todo-items");
  const input = block.querySelector(".todo-input input");
  const addButton = block.querySelector(".todo-input button");
  const deleteBlockBtn = block.querySelector(".delete-block-btn");

  addButton.addEventListener("click", () => {
    if (!input.value.trim()) return;

    const item = document.createElement("div");
    item.className = "todo-item";
    item.innerHTML = `
      <input type="checkbox" />
      <span>${input.value}</span>
      <button class="edit-btn">✎</button>
      <button class="delete-btn">🗑️</button>
    `;
    const checkbox = item.querySelector("input");
    const editBtn = item.querySelector(".edit-btn");
    const taskSpan = item.querySelector("span");
    const deleteBtn = item.querySelector(".delete-btn");

    checkbox.addEventListener("click", function () {
    item.classList.toggle("completed", checkbox.checked);
    });

    editBtn.addEventListener("click", function () {
    const update = prompt("Edit task:", taskSpan.textContent);
    if (update !== null) {
        taskSpan.textContent = update;
        item.classList.remove("completed");
        checkbox.checked = false;
    }
    });

    deleteBtn.addEventListener("click", () => {
      itemsContainer.removeChild(item);
    });

    itemsContainer.appendChild(item);
    input.value = "";
  });

  /*deleteBlockBtn.addEventListener("click", () => {
    if (confirm(`Deleting ${block.querySelector(".block-title").value || "this list"} will delete its contents. Click OK to confirm.`)) {
      const widget = block.closest(".grid-stack-item");
        block.remove();
      
      const blockCount = appSection.querySelectorAll(".grid-stack-item").length;
      if (blockCount === 0) {
        addBtn.style.display = "block";
      }
    }
  });*/

  return block;
}

// Pomodoro timer block
function createPomodoroBlock() {
  // Implementation for Pomodoro block can go here
  const block = document.createElement("div");
  block.className = "block pomodoro-block";
  block.innerHTML = `
    <div class="drag-handle">⠿</div>
    <input class="block-title" placeholder="Pomodoro Timer" style="font-size: 30px;"/>
    <div class="pomodoro-timer">
      <p><span class="minutes">25</span>:<span class="seconds">00</span></p>
      <div class="controls">
        <button class="start-btn">Start</button>
        <button class="pause-btn">Pause</button>
        <button class="reset-btn">Reset</button>
      </div>
    </div>
  `;

    const deleteBlockBtn = block.querySelector(".delete-block-btn");
    const startBtn = block.querySelector(".start-btn");
    const pauseBtn = block.querySelector(".pause-btn");
    const resetBtn = block.querySelector(".reset-btn");
    const minutesEl = block.querySelector(".minutes");
    const secondsEl = block.querySelector(".seconds");

    let myInterval;
    let totalSeconds;
    let isRunning = false;

    const initTimer = () => {
        const sessionAmount = Number.parseInt(minutesEl.textContent);
        totalSeconds = sessionAmount * 60;
    };

    const updateTimerDisplay = () => {
        let minutesLeft = Math.floor(totalSeconds / 60);
        let secondsLeft = totalSeconds % 60;
        minutesEl.textContent = minutesLeft;
        secondsEl.textContent = secondsLeft < 10 ? '0' + secondsLeft : secondsLeft;
    };

    const appTimer = () => {
        if (isRunning) {
            alert('Session is already running!');
            return;
        }

        if (totalSeconds === undefined) {
            initTimer();
        }

        isRunning = true;

        myInterval = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(myInterval);
                isRunning = false;
                alert('Session complete!');
                return;
            }
            totalSeconds--;
            updateTimerDisplay();
        }, 1000);
    };

    startBtn.addEventListener("click", appTimer);

    pauseBtn.addEventListener("click", () => {
        if (!isRunning) return;

        clearInterval(myInterval);
        isRunning = false;
    });

    resetBtn.addEventListener("click", () => {
        if (confirm('Are you sure you want to reset the timer?')) {
            clearInterval(myInterval);
            isRunning = false;
            minutesEl.textContent = '25';
            secondsEl.textContent = '00';
            totalSeconds = undefined;
        }
    });

    /*deleteBlockBtn.addEventListener("click", () => {
      if (confirm(`Deleting ${block.querySelector(".block-title").value || "this timer"} will delete the timer. Click OK to confirm.`)) {
        const widget = block.closest(".grid-stack-item");
        if (widget && grid) {
          grid.removeWidget(widget);
        } else {
          block.remove();
        }
        const blockCount = appSection.querySelectorAll(".grid-stack-item").length;
        if (blockCount === 0) {
          addBtn.style.display = "block";
        }
      }
    });*/


  return block;
}

// Divider block
function createDividerBlock() {
  const block = document.createElement("div");
  block.innerHTML = `
    <div class="drag-handle">⠿</div>
    <hr class="divider-line"/>
  `;

  const deleteBlockBtn = block.querySelector(".delete-block-btn");

  /*deleteBlockBtn.addEventListener("click", () => {
    if (confirm(`Deleting this divider will remove it. Click OK to confirm.`)) {
      const widget = block.closest(".grid-stack-item");
        block.remove();

      const blockCount = appSection.querySelectorAll(".grid-stack-item").length;
      if (blockCount === 0) {
        addBtn.style.display = "block";
      }
    }
  });*/

  return block;
}

/*show add button if no apps*/
if (appSection.children.length === 0) {
  addBtn.style.display = "block";
}

const popup = document.getElementById("block-popup");
let activeBlock = null;

document.addEventListener("click", (e) => {
  // Clicked on drag handle?
  const handle = e.target.closest(".drag-handle");

  if (handle) {
    e.stopPropagation();

    activeBlock = handle.closest(".block");

    const rect = handle.getBoundingClientRect();

    popup.style.top = `${rect.top + window.scrollY}px`;
    popup.style.left = `${rect.right + 8 + window.scrollX}px`;

    popup.classList.remove("hidden");
    return;
  }

  // Click outside → close popup
  popup.classList.add("hidden");
  activeBlock = null;
});

