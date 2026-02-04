/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Import the functions you need from the SDKs you need
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


const blocks = [];

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// to save into blocks array
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function registerBlock(blockEl, type) {
  const blockData = {
    id: crypto.randomUUID(),
    type,
    el: blockEl,
    styles: {
      textColor: "",
      bgColor: ""
    }, 
    buttons: {}
  };

  blockEl.dataset.blockId = blockData.id;
  blocks.push(blockData);

  return blockData;
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
//  web app's Firebase configuration
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
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
const db = getFirestore(firebaseApp);

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    console.log(user);
    loadDashboard(user.uid);

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

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
/*the adding apps part*/
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
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
  btn.addEventListener("click", async () => {
    const type = btn.dataset.type;

    appSection.style.border = "none";
    
    if (type === "todo") {
        insertBlock(createTodoBlock());
        await saveDashboard(auth.currentUser.uid);
    }

    if (type === "pomodoro") {
        insertBlock(createPomodoroBlock());
        await saveDashboard(auth.currentUser.uid);
    }

    if (type === "divider") {
        insertBlock(createDividerBlock());
        await saveDashboard(auth.currentUser.uid);
    }

    modal.classList.add("hidden");
    activeBlock = null;
    addBtn.style.display = "none";
  });
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Todo list block
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function createTodoBlock() {
  const block = document.createElement("div");
  block.className = "block todo-block";
  block.dataset.type = "todo";
  block.innerHTML = `
    <div class="drag-handle">⠿</div>
    <input class="block-title" placeholder="Todo List Title" style="font-size: 30px;"/>
    
    <div class="todo-items"></div>

    <div class="todo-input">
      <input type="text" placeholder="New task..." />
      <button>Add</button>
    </div>
  `;

  const blockData = registerBlock(block, "todo");

  const itemsContainer = block.querySelector(".todo-items");
  const input = block.querySelector(".todo-input input");
  const addButton = block.querySelector(".todo-input button");

  blockData.buttons.add = addButton;

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

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Pomodoro timer block
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function createPomodoroBlock() {
  // Implementation for Pomodoro block can go here
  const block = document.createElement("div");
  block.className = "block pomodoro-block";
  block.dataset.type = "pomodoro";
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

  const blockData = registerBlock(block, "pomodoro");

    const startBtn = block.querySelector(".start-btn");
    const pauseBtn = block.querySelector(".pause-btn");
    const resetBtn = block.querySelector(".reset-btn");
    const minutesEl = block.querySelector(".minutes");
    const secondsEl = block.querySelector(".seconds");

    blockData.buttons = {
    start: startBtn,
    pause: pauseBtn,
    reset: resetBtn
  };

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

  registerBlock(block, "pomodoro");
  return block;
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Divider block
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function createDividerBlock() {
  const block = document.createElement("div");
  block.className = "block divider-block";
  block.dataset.type = "divider";
  block.innerHTML = `
    <div class="drag-handle">⠿</div>
    <hr class="divider-line"/>
  `;

  registerBlock(block, "divider");
  return block;
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
/*show add button if no apps*/
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
if (appSection.children.length === 0) {
  addBtn.style.display = "block";
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// handle block pop up
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
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

    if (activeBlock.classList.contains("divider-block")) {
      colorBTN.style.display = "none";
    } else {
      colorBTN.style.display = "block";
    }

    popup.classList.remove("hidden");
    return;
  }

  // Click outside → close popup
  popup.classList.add("hidden");
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// handle block pop up buttons
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
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


duplicateBTN.addEventListener("click", async (e) => {
  e.stopPropagation();

  if (!activeBlock) return;

  let newBlock;

  if (activeBlock.classList.contains("todo-block")) {
    // Create a new Todo block
    newBlock = createTodoBlock();

    // Copy the title
    const oldTitle = activeBlock.querySelector(".block-title").value;
    newBlock.querySelector(".block-title").value = oldTitle;

    // Copy all existing tasks
    const oldTasks = activeBlock.querySelectorAll(".todo-item");
    const newItemsContainer = newBlock.querySelector(".todo-items");
    oldTasks.forEach(task => {
      const text = task.querySelector("span").textContent;
      const completed = task.querySelector("input").checked;
      const item = document.createElement("div");
      item.className = "todo-item";
      item.innerHTML = `
        <input type="checkbox" ${completed ? "checked" : ""}/>
        <span>${text}</span>
        <button class="edit-btn">✎</button>
        <button class="delete-btn">🗑️</button>
      `;
      // Reattach event listeners
      const checkbox = item.querySelector("input");
      const editBtn = item.querySelector(".edit-btn");
      const deleteBtn = item.querySelector(".delete-btn");
      checkbox.addEventListener("click", () => item.classList.toggle("completed", checkbox.checked));
      editBtn.addEventListener("click", () => {
        const update = prompt("Edit task:", item.querySelector("span").textContent);
        if (update !== null) item.querySelector("span").textContent = update;
      });
      deleteBtn.addEventListener("click", () => newItemsContainer.removeChild(item));
      newItemsContainer.appendChild(item);
    });

  } else if (activeBlock.classList.contains("pomodoro-block")) {
    // Create a new Pomodoro block
    newBlock = createPomodoroBlock();

    // Copy the title only
    const oldTitle = activeBlock.querySelector(".block-title").value;
    newBlock.querySelector(".block-title").value = oldTitle;
  } else if (activeBlock.classList.contains("divider-block")) {
    newBlock = createDividerBlock();
  }

  // Copy color styles (text & background) from the active block
  newBlock.style.color = activeBlock.style.color;
  newBlock.style.backgroundColor = activeBlock.style.backgroundColor;

  // Also copy button colors for todo and pomodoro buttons
  const oldButtons = activeBlock.querySelectorAll("button");
  const newButtons = newBlock.querySelectorAll("button");
  oldButtons.forEach((btn, i) => {
    if (newButtons[i]) {
      newButtons[i].style.backgroundColor = btn.style.backgroundColor;
      newButtons[i].style.color = btn.style.color;
    }
  });

  // Insert the new block right after the active one
  insertBlock(newBlock);

  activeBlock = null;
  popup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// insert block at active position
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function insertBlock(block) {
  if (activeBlock) {
    activeBlock.after(block);
  } else {
    appSection.appendChild(block);
  }
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// handle color popup
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
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

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Add text color button listeners
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
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

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Add background color button listeners
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
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

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Settings modal logic
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
const settingsBtn = document.getElementById("settings");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsModal = document.getElementById("close-settings-modal");
const closeSettingsModalAlt = document.getElementById("close-s-modal");

settingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

closeSettingsModal.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

closeSettingsModalAlt.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Color theme button listeners
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
document.getElementById("default").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#f0f0f0" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#f0f0f0";
      block.styles.bgColor = "#f0f0f0";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#f0f0f0";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#f0f0f0";
  
});

document.getElementById("blue").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#3f75bca9" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#3f75bca9";
      block.styles.bgColor = "#3f75bca9";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#3f75bca9";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#3f75bca9";
  
});

document.getElementById("green").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#39674fa9" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#39674fa9";
      block.styles.bgColor = "#39674fa9";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#39674fa9";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#39674fa9";
  
});

document.getElementById("red").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#bc3f3fa9" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#bc3f3fa9";
      block.styles.bgColor = "#bc3f3fa9";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#bc3f3fa9";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#bc3f3fa9";
  
});

document.getElementById("purple").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#9564c29c" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#9564c29c";
      block.styles.bgColor = "#9564c29c";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#9564c29c";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#9564c29c";
  
});

document.getElementById("orange").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#bc793fa9" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#bc793fa9";
      block.styles.bgColor = "#bc793fa9";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#bc793fa9";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#bc793fa9";
  
});

document.getElementById("pink").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#b7649cbc" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#b7649cbc";
      block.styles.bgColor = "#b7649cbc";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#b7649cbc";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#b7649cbc";
  
});

document.getElementById("gray").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#626161a9" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#626161a9";
      block.styles.bgColor = "#626161a9";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#626161a9";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#626161a9";
  
});

document.getElementById("brown").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#935c5091" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#935c5091";
      block.styles.bgColor = "#935c5091";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#935c5091";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#935c5091";
  
});


document.getElementById("yellow").addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#ebcf61c2" // pick any color
  );
  blocks.forEach(block => {
    if( block.type != "divider") {
      block.el.style.backgroundColor = "#ebcf61c2";
      block.styles.bgColor = "#ebcf61c2";
      if (block.buttons) {
        Object.values(block.buttons).forEach(btn => {
          if (btn) btn.style.backgroundColor = "#ebcf61c2";
        });
      }
    }
  });
  if (newBtn) newBtn.style.backgroundColor = "#ebcf61c2";
  
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// font style button listeners
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
document.getElementById("default-f").addEventListener("click", () => {
  document.documentElement.style.setProperty("--global-font", "'Indie Flower', cursive");
});

document.getElementById("share-tech-mono-f").addEventListener("click", () => {
  document.documentElement.style.setProperty("--global-font", "'Share Tech Mono', monospace");
});

document.getElementById("arial-f").addEventListener("click", () => {
  document.documentElement.style.setProperty("--global-font", "Arial, sans-serif");
});

document.getElementById("verdana-f").addEventListener("click", () => {
  document.documentElement.style.setProperty("--global-font", "Verdana, sans-serif");
});

document.getElementById("times-new-roman-f").addEventListener("click", () => {
  document.documentElement.style.setProperty("--global-font", "'Times New Roman', serif");
});

document.getElementById("playpen-sans-f").addEventListener("click", () => {
  document.documentElement.style.setProperty("--global-font", "'Playpen Sans', sans-serif");
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Profile modal logic
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
const profileBtn = document.getElementById("profile");
const profileModal = document.getElementById("profile-modal");
const closeProfileModal = document.getElementById("close-profile-modal");
const closeProfileModalAlt = document.getElementById("close-p-modal");

profileBtn.addEventListener("click", () => {
  profileModal.classList.remove("hidden");
});

closeProfileModal.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

closeProfileModalAlt.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    console.log(user);

    const name = user.displayName;
    const photo = user.photoURL;
    const email = user.email;

    const usernameEl = document.getElementById("profile-username");
    const profilePicEl = document.getElementById("profile-pic-large");
    const emailEl = document.getElementById("profile-email");

    if (emailEl) {
      emailEl.textContent = email || "No email provided";
    }

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

  // user log out logic
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if(confirm('Are you sure you want to log out?')) {
      signOut(auth).then(() => {
        window.location.href = "index.html";
      });
    }
    });
  }
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// save to dashboard function
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
async function saveDashboard(userId) {
  const dashboardRef = doc(db, "users", userId, "dashboard", "main");

  const data = {
    blocks: blocks.map(block => ({
      id: block.id,
      type: block.type,
      title: block.el.querySelector(".block-title")?.value || "",
      styles: block.styles,
      todos: block.type === "todo"
        ? [...block.el.querySelectorAll(".todo-item")].map(item => ({
            text: item.querySelector("span").textContent,
            completed: item.querySelector("input").checked
          }))
        : []
    }))
  };

  await setDoc(dashboardRef, data);
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// loading dashboard
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
async function loadDashboard(userId) {
  const dashboardRef = doc(db, "users", userId, "dashboard", "main");
  const snap = await getDoc(dashboardRef);

  if (!snap.exists()) return;

  const data = snap.data();

  data.blocks.forEach(block => {
    let el;

    if (block.type === "todo") {
      el = createTodoBlock();
      el.querySelector(".block-title").value = block.title;

      const container = el.querySelector(".todo-items");
      block.todos.forEach(todo => {
        const item = document.createElement("div");
        item.className = "todo-item";
        item.innerHTML = `
          <input type="checkbox" ${todo.completed ? "checked" : ""} />
          <span>${todo.text}</span>
          <button class="edit-btn">✎</button>
          <button class="delete-btn">🗑️</button>
        `;
        if (todo.completed) item.classList.add("completed");
        container.appendChild(item);
      });
    }

    if (block.type === "pomodoro") {
      el = createPomodoroBlock();
      el.querySelector(".block-title").value = block.title;
    }

    if (block.type === "divider") {
      el = createDividerBlock();
    }

    el.style.color = block.styles.textColor;
    el.style.backgroundColor = block.styles.bgColor;

    appSection.appendChild(el);
  });
}
