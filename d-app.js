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
function registerBlock(blockEl, type, id) {
  const blockData = {
    id: id || crypto.randomUUID(),
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

    if (type === "image") {
        imagePopup.classList.remove("hidden");
    }

    if (type === "notes") {
        insertBlock(createNotesBlock());
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
function createTodoBlock(blockId) {
  const block = document.createElement("div");
  block.className = "block todo-block";
  block.dataset.type = "todo";
  block.innerHTML = `
    <input class="block-title" placeholder="Todo List Title" style="font-size: 30px;"/>
    
    <div class="todo-items"></div>

    <div class="todo-input">
      <input type="text" placeholder="New task..." />
      <button>Add</button>
    </div>
  `;

  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.textContent = "⠿";

  block.appendChild(dragHandle);

  const blockData = registerBlock(block, "todo", blockId);

  const itemsContainer = block.querySelector(".todo-items");
  const input = block.querySelector(".todo-input input");
  const addButton = block.querySelector(".todo-input button");
  const titleInput = block.querySelector(".block-title");

  blockData.buttons.add = addButton;

  // Save when title changes
  titleInput.addEventListener("blur", async () => {
    await saveDashboard(auth.currentUser.uid);
  });

  addButton.addEventListener("click", async () => {
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

    checkbox.addEventListener("click", async function () {
    item.classList.toggle("completed", checkbox.checked);
    editBtn.disabled = checkbox.checked;
    await saveDashboard(auth.currentUser.uid);
    });

    editBtn.addEventListener("click", async function () {
    const update = prompt("Edit task:", taskSpan.textContent);
    if (update !== null) {
        taskSpan.textContent = update;
        item.classList.remove("completed");
        checkbox.checked = false;
        await saveDashboard(auth.currentUser.uid);
    }
    });

    deleteBtn.addEventListener("click", async () => {
      itemsContainer.removeChild(item);
      await saveDashboard(auth.currentUser.uid);
    });

    itemsContainer.appendChild(item);
    input.value = "";
    await saveDashboard(auth.currentUser.uid);
  });

  // Save on resize
  block.addEventListener("mouseup", async () => {
    await saveDashboard(auth.currentUser.uid);
  });

  return block;
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Pomodoro timer block
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function createPomodoroBlock(blockId) {
  const block = document.createElement("div");
  block.className = "block pomodoro-block";
  block.dataset.type = "pomodoro";
  block.innerHTML = `
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

  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.textContent = "⠿";

  block.appendChild(dragHandle);

  const blockData = registerBlock(block, "pomodoro", blockId);

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

    // Save on resize
  block.addEventListener("mouseup", async () => {
    await saveDashboard(auth.currentUser.uid);
  });

  return block;
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Divider block
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function createDividerBlock(blockId) {
  const block = document.createElement("div");
  block.className = "block divider-block";
  block.dataset.type = "divider";
  block.innerHTML = `
    <div class="drag-handle">⠿</div>
    <hr class="divider-line"/>
  `;

  registerBlock(block, "divider", blockId);
  return block;
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Image Block
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function createImageBlock(imageSrc, blockId) {
  const block = document.createElement("div");
  block.className = "block image-block";
  block.dataset.type = "image";
  block.style.width = "300px";
  block.style.height = "200px";

  const img = document.createElement("img");
  img.src = imageSrc;
  img.draggable = false;

  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.textContent = "⠿";

  block.appendChild(dragHandle);
  block.appendChild(img);

  const blockData = registerBlock(block, "image", blockId);
  
  // Save on resize
  block.addEventListener("mouseup", async () => {
    await saveDashboard(auth.currentUser.uid);
  });

  return block;
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Resize handler for blocks
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
document.addEventListener("mousedown", (e) => {
  if (e.target.tagName === "DIV" && e.target.classList.contains("block")) {
    // Don't allow resizing divider blocks
    if (e.target.classList.contains("divider-block")) return;
    
    const rect = e.target.getBoundingClientRect();
    const isNearBottomRight = 
      e.clientX > rect.right - 25 && 
      e.clientY > rect.bottom - 25;
    
    if (!isNearBottomRight) return;
    
    e.preventDefault();
    const block = e.target;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = block.offsetWidth;
    const startHeight = block.offsetHeight;

    const container = appSection; // or document.querySelector("main")

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // How far the block is from left/top inside container
      const maxWidth = container.clientWidth - block.offsetLeft;
      const maxHeight = container.clientHeight - block.offsetTop;

      // Different constraints for image blocks vs other blocks
      const isImageBlock = block.classList.contains("image-block");
      const minWidth = isImageBlock ? 50 : 150;
      const minHeight = isImageBlock ? 50 : 100;

      let newWidth = startWidth + deltaX;
      let newHeight = startHeight + deltaY;

      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      newHeight = Math.max(minHeight, newHeight);

      block.style.width = newWidth + "px";
      block.style.height = newHeight + "px";
    };
    
    const handleMouseUp = async () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      await saveDashboard(auth.currentUser.uid);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }
});


/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// handle image pop up
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
const imagePopup = document.getElementById("image-popup");
const imageUrlInput = document.getElementById("image-url-input");
const imageFileInput = document.getElementById("image-file-input");
const submitImageBtn = document.getElementById("submit-image-url");
const closeImageBtn = document.getElementById("close-image-popup");

imagePopup.addEventListener("click", (e) => {
  e.stopPropagation();
});

closeImageBtn.addEventListener("click", () => {
  imagePopup.classList.add("hidden");
  imageUrlInput.value = "";
  imageFileInput.value = "";
  modal.classList.add("hidden");
});

submitImageBtn.addEventListener("click", async () => {
  let imageSrc = null;
  // Check if file was selected
  if (imageFileInput.files && imageFileInput.files.length > 0) {
    const file = imageFileInput.files[0];
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      imageSrc = e.target.result;
      createAndInsertImageBlock(imageSrc);
    };
    reader.readAsDataURL(file);
  } else if (imageUrlInput.value.trim()) {
    imageSrc = imageUrlInput.value.trim();
    createAndInsertImageBlock(imageSrc);
  } else {
    alert("Please enter an image URL or select a file");
    return;
  }
  imagePopup.classList.add("hidden");
  imageUrlInput.value = "";
  imageFileInput.value = "";
  modal.classList.add("hidden");
});

async function createAndInsertImageBlock(imageSrc) {
  const newBlock = createImageBlock(imageSrc);
  insertBlock(newBlock);
  await saveDashboard(auth.currentUser.uid);
  
  imagePopup.classList.add("hidden");
  imageUrlInput.value = "";
  imageFileInput.value = "";
  modal.classList.add("hidden");
  activeBlock = null;
  addBtn.style.display = "none";
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

    if (activeBlock.classList.contains("divider-block") || activeBlock.classList.contains("image-block")) {
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

deleteBTN.addEventListener("click", async (e) => {
  e.stopPropagation();

  if (!activeBlock) return;

  // Remove from local state
  const blockId = activeBlock.dataset.blockId;
  if (blockId) {
    const index = blocks.findIndex(block => block.id === blockId);
    if (index !== -1) {
      blocks.splice(index, 1);
    }
  }

  activeBlock.remove();
  activeBlock = null;

  popup.classList.add("hidden");

  // If no blocks left, restore empty state
  const remainingBlocks = appSection.querySelectorAll(".block").length;

  if (remainingBlocks === 0) {
    addBtn.style.display = "block";
  }

  await saveDashboard(auth.currentUser.uid);
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
      editBtn.disabled = checkbox.checked;
      checkbox.addEventListener("click", () => {
        item.classList.toggle("completed", checkbox.checked);
        editBtn.disabled = checkbox.checked;
      });
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
  } else if (activeBlock.classList.contains("image-block")) {
    // Create a new Image block
    const oldImg = activeBlock.querySelector("img");
    if (oldImg) {
      const imageSrc = oldImg.src;
      newBlock = createImageBlock(imageSrc);
      // Copy the dimensions
      newBlock.style.width = activeBlock.style.width;
      newBlock.style.height = activeBlock.style.height;
    }
  }

  if (newBlock) {
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
  }

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
  e.stopPropagation();
});

document.addEventListener("click", () => {
  colorPopup.classList.add("hidden"); 
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Add text color button listeners
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
document.getElementById("default-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#000000ff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("gray-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#838383ff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("brown-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#7a5a5aff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("orange-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#f8a74bff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("yellow-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#fcd677ff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("green-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#6cb485ff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("blue-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#549dddff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("purple-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#8353c8ff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("pink-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#f289c6ff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("red-t")?.addEventListener("click", async () => {
  if (activeBlock) {
    activeBlock.style.color = "#e73838ff";
  }
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Add block background color button listeners
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
document.getElementById("default-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#a1a1a111";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("gray-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#8383834a";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("brown-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#7a5a5a4e";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("orange-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#f8a74b41";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("yellow-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#fcd6774a";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("green-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#6cb48546";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("blue-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#549ddd94";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("purple-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#8453c83b";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("pink-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#f289c646";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("red-b")?.addEventListener("click", async () => {
  if (activeBlock) activeBlock.style.backgroundColor = "#e738384e";
  colorPopup.classList.add("hidden");
  await saveDashboard(auth.currentUser.uid);
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
document.getElementById("default").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#d4d4d4" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#7aa6dd"
  );
  if (newBtn) newBtn.style.backgroundColor = "#f0f0f0";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#ffffff"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("blue").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#638dd5" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#549ddd"
  );
  if (newBtn) newBtn.style.backgroundColor = "#638dd5";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#7da0ddb4"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("green").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#416e57" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#6cb485"
  );
  if (newBtn) newBtn.style.backgroundColor = "#416e57";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#508268b4"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("red").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#970404" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#e73838"
  );
  if (newBtn) newBtn.style.backgroundColor = "#970404";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#970404b4"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("purple").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#7546a2" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#8353c8"
  );
  if (newBtn) newBtn.style.backgroundColor = "#7546a2";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#7546a2b4"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("orange").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#ea8118" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#f8a74b"
  );
  if (newBtn) newBtn.style.backgroundColor = "#ea8118";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#fbae62e8"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("pink").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#f155a0" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#f289c6"
  );
  if (newBtn) newBtn.style.backgroundColor = "#f155a0";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#f6a8ce"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("gray").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#6d6d6d" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#838383"
  );
  if (newBtn) newBtn.style.backgroundColor = "#6d6d6d";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#c2c2c2"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("brown").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#935c50" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#7a5a5a"
  );
  if (newBtn) newBtn.style.backgroundColor = "#935c50";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#935c50b4"
  );
  await saveDashboard(auth.currentUser.uid);
});

document.getElementById("yellow").addEventListener("click", async () => {
  document.documentElement.style.setProperty(
    "--panel-bg",
    "#ebcb48" // pick any color
  );
  document.documentElement.style.setProperty(
    "--button-color",
    "#fcd677"
  );
  if (newBtn) newBtn.style.backgroundColor = "#ebcb48";
  // also change html background to match the new theme
  document.documentElement.style.setProperty(
    "--bg-color",
    "#ede0a9"
  );
  await saveDashboard(auth.currentUser.uid);
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

  // Get blocks in DOM order, not in blocks array order
  const blockElements = appSection.querySelectorAll(".block");
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--panel-bg').trim();
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
  const data = {
    themeColor: themeColor || "",
    bgColor: bgColor || "",
    blocks: Array.from(blockElements).map(el => {
      // Find the block data in the blocks array by matching the element
      const blockData = blocks.find(b => b.el === el);
      if (!blockData) return null;

      const blockInfo = {
        id: blockData.id,
        type: blockData.type,
        title: el.querySelector(".block-title")?.value || "",
        styles: {
          textColor: el.style.color || "",
          bgColor: el.style.backgroundColor || ""
        },
        width: el.offsetWidth,
        height: el.offsetHeight
      };

      // Add type-specific data
      if (blockData.type === "todo") {
        blockInfo.todos = [...el.querySelectorAll(".todo-item")].map(item => ({
          text: item.querySelector("span").textContent,
          completed: item.querySelector("input").checked
        }));
      } else if (blockData.type === "image") {
        const img = el.querySelector("img");
        blockInfo.imageSrc = img?.src || "";
      } else if (blockData.type === "notes") {
        const textarea = el.querySelector(".notes-textarea");
        blockInfo.notesText = textarea?.value || "";
      } else if (blockData.type === "divider") {
        blockInfo.title = ""; 
      }

      return blockInfo;
    }).filter(block => block !== null)
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

  // Restore theme color
  if (data.themeColor) {
    document.documentElement.style.setProperty('--panel-bg', data.themeColor);
  }

  // Restore background color
  if (data.bgColor) {
    document.documentElement.style.setProperty('--bg-color', data.bgColor);
  }

  data.blocks.forEach(block => {
    let el;

    if (block.type === "todo") {
      el = createTodoBlock(block.id);
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
        
        // Attach event listeners
        const checkbox = item.querySelector("input");
        const editBtn = item.querySelector(".edit-btn");
        const taskSpan = item.querySelector("span");
        const deleteBtn = item.querySelector(".delete-btn");
        
        // Set initial disabled state
        editBtn.disabled = checkbox.checked;
        
        checkbox.addEventListener("click", async function () {
          item.classList.toggle("completed", checkbox.checked);
          editBtn.disabled = checkbox.checked;
          await saveDashboard(userId);
        });
        
        editBtn.addEventListener("click", async function () {
          const update = prompt("Edit task:", taskSpan.textContent);
          if (update !== null) {
            taskSpan.textContent = update;
            item.classList.remove("completed");
            checkbox.checked = false;
            await saveDashboard(userId);
          }
        });
        
        deleteBtn.addEventListener("click", async () => {
          container.removeChild(item);
          await saveDashboard(userId);
        });
        
        container.appendChild(item);
      });
    }

    if (block.type === "pomodoro") {
      el = createPomodoroBlock(block.id);
      el.querySelector(".block-title").value = block.title;
    }

    if (block.type === "divider") {
      el = createDividerBlock(block.id);
    }

    if (block.type === "notes") {
      el = createNotesBlock(block.id);
      el.querySelector(".block-title").value = block.title;
      const textarea = el.querySelector(".notes-textarea");
      if (textarea) {
        textarea.value = block.notesText || "";
      }
    }

    if (block.type === "image") {
      el = createImageBlock(block.imageSrc || "", block.id);
    }

    // Restore dimensions for all resizable blocks
    if (block.width && block.height) {
      // Cap width to prevent overflow - max should be container width minus gap
      const maxWidth = appSection.clientWidth;
      const constrainedWidth = Math.min(block.width, maxWidth - 20);
      el.style.width = constrainedWidth + "px";
      el.style.height = block.height + "px";
    }

    el.style.color = block.styles.textColor;
    el.style.backgroundColor = block.styles.bgColor;

    appSection.appendChild(el);
  });
}

/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Notes block
/*-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
function createNotesBlock(blockId) {
  const block = document.createElement("div");
  block.className = "block notes-block";
  block.dataset.type = "notes";
  block.innerHTML = `
    <input class="block-title" placeholder="Notes Title" style="font-size: 30px;"/>
    <div class="notes-content">
      <textarea class="notes-textarea" placeholder="Write your notes here..."></textarea>
    </div>
  `;

  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.textContent = "⠿";

  block.appendChild(dragHandle);

  const blockData = registerBlock(block, "notes", blockId);

  // Add auto-save listeners
  const titleInput = block.querySelector(".block-title");
  const textarea = block.querySelector(".notes-textarea");

  titleInput.addEventListener("blur", async () => {
    await saveDashboard(auth.currentUser.uid);
  });

  textarea.addEventListener("blur", async () => {
    await saveDashboard(auth.currentUser.uid);
  });

  return block;
}