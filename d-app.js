// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

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
        insertBlock(createTodoBlock());
    }

    if (type === "pomodoro") {
        insertBlock(createPomodoroBlock());
    }

    if (type === "divider") {
        insertBlock(createDividerBlock());
    }

    modal.classList.add("hidden");
    activeBlock = null;
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

  return block;
}

// Divider block
function createDividerBlock() {
  const block = document.createElement("div");
  block.className = "block divider-block";
  block.innerHTML = `
    <div class="drag-handle">⠿</div>
    <hr class="divider-line"/>
  `;

  return block;
}

/*show add button if no apps*/
if (appSection.children.length === 0) {
  addBtn.style.display = "block";
}

const popup = document.getElementById("block-popup");
let activeBlock = null;

popup.addEventListener("click", (e) => {
  e.stopPropagation();
});

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
});

// handle block pop up buttons
const addBTN = document.getElementById("addBTN");
const deleteBTN = document.getElementById("deleteBTN");
const colorBTN = document.getElementById("colorBTN");
const duplicateBTN = document.getElementById("duplicateBTN");

addBTN.addEventListener("click", (e) => {
    e.stopPropagation(); // don't close popup early
    modal.classList.remove("hidden");
});

deleteBTN.addEventListener("click", (e) => {
  e.stopPropagation();

  if (!activeBlock) return;

  activeBlock.remove();
  activeBlock = null;

  popup.classList.add("hidden");

  // If no blocks left, restore empty state
  const remainingBlocks = appSection.querySelectorAll(".block").length;

  if (remainingBlocks === 0) {
    addBtn.style.display = "block";
  }
});

colorBTN.addEventListener("click", (e) => {
  e.stopPropagation();
  
  if (!activeBlock) return;
  
  // Show the color popup with preset colors
  const rect = colorBTN.getBoundingClientRect();
  colorPopup.style.top = `${rect.top + window.scrollY}px`;
  colorPopup.style.left = `${rect.right + 8 + window.scrollX}px`;
  colorPopup.classList.remove("hidden");
});


/*duplicateBTN.addEventListener("click", (e) => {

});*/

function insertBlock(block) {
  if (activeBlock) {
    activeBlock.after(block);
  } else {
    appSection.appendChild(block);
  }
}


const colorPopup = document.getElementById("color-popup");

colorPopup.addEventListener("click", (e) => {
  e.stopPropagation();  // Keep popup open when clicking inside
});

document.addEventListener("click", (e) => {
  // Close colorPopup only if clicking outside of it
  if (!colorPopup.contains(e.target) && e.target !== colorBTN) {
    colorPopup.classList.add("hidden");
  }
});

// Add text color button listeners
document.getElementById("default-t")?.addEventListener("click", () => {
  if (activeBlock) {
        activeBlock.style.color = "#000000ff";
        const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#000000ff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("gray-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#838383ff";
    const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#838383ff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("brown-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#7a5a5aff";
  const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#7a5a5aff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("orange-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#f8a74bff";
    const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#f8a74bff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("yellow-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#fcd677ff";
    const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#fcd677ff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("green-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#6cb485ff";
    const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#6cb485ff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("blue-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#549dddff";
    const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#549dddff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("purple-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#8353c8ff";
    const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#8353c8ff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("pink-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#f289c6ff";
    const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#f289c6ff";
  });}
  colorPopup.classList.add("hidden");
});

document.getElementById("red-t")?.addEventListener("click", () => {
  if (activeBlock) {
    activeBlock.style.color = "#e73838ff";
    const buttons = activeBlock.querySelectorAll("button");
        buttons.forEach(btn => {
        btn.style.backgroundColor = "#e73838ff";
  });}
  colorPopup.classList.add("hidden");
});

// Add background color button listeners
document.getElementById("default-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#a1a1a111";
  colorPopup.classList.add("hidden");
});

document.getElementById("gray-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#8383834a";
  colorPopup.classList.add("hidden");
});

document.getElementById("brown-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#7a5a5a4e";
  colorPopup.classList.add("hidden");
});

document.getElementById("orange-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#f8a74b41";
  colorPopup.classList.add("hidden");
});

document.getElementById("yellow-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#fcd6774a";
  colorPopup.classList.add("hidden");
});

document.getElementById("green-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#6cb48546";
  colorPopup.classList.add("hidden");
});

document.getElementById("blue-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#549ddd94";
  colorPopup.classList.add("hidden");
});

document.getElementById("purple-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#8453c83b";
  colorPopup.classList.add("hidden");
});

document.getElementById("pink-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#f289c646";
  colorPopup.classList.add("hidden");
});

document.getElementById("red-b")?.addEventListener("click", () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#e738384e";
  colorPopup.classList.add("hidden");
});