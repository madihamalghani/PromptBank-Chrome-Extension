const promptList = document.getElementById("prompt-list");
const searchInput = document.getElementById("search");
const addPromptModal = document.getElementById("add-prompt-modal");
const addPromptBtn = document.getElementById("add-prompt-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const savePromptBtn = document.getElementById("save-prompt-btn");
const customPromptInput = document.getElementById("custom-prompt");

// Load Prompts from JSON or LocalStorage
async function loadPrompts() {
    let prompts = JSON.parse(localStorage.getItem("prompts"));//getting prompts from localStorage
    if (!prompts) {
        // Fetch from JSON if not in localStorage
        const response = await fetch("prompts.json");
        prompts = await response.json();
        //set local storage with custom prompts + already present prompts,(for efficiency)
        localStorage.setItem("prompts", JSON.stringify(prompts));
    }

    renderPrompts(prompts);
}

// Save Prompts to LocalStorage
function savePrompts(prompts) {
    localStorage.setItem("prompts", JSON.stringify(prompts));
}

function renderPrompts(prompts) {
    promptList.innerHTML = ""; // Clear the container first.

    prompts.forEach((prompt) => {
        if (prompt.text) { // Ensure the prompt has a valid text field.
            const promptDiv = document.createElement("div"); // Create a container for each prompt.
            promptDiv.classList.add("prompt-item"); // Add a class for styling.

            // Add the prompt text.
            const text = document.createElement("span");
            text.textContent = prompt.text; // Set the text of the prompt.

            // Create the Copy button.
            const copyBtn = document.createElement("button");
            copyBtn.textContent = "📋"; // Button text.
            copyBtn.dataset.id = prompt.id; // Add a data attribute for the ID.
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(prompt.text); // Copy the prompt text.
            });

            // Create the Delete button.
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️"; // Button text.
            deleteBtn.dataset.id = prompt.id; // Add a data attribute for the ID.
            
            deleteBtn.addEventListener("click", () => {
                // Ask for confirmation before deleting
                const isConfirmed = window.confirm("Are you sure you want to delete this prompt?");
            
                if (isConfirmed) {
                    // If the user clicks "OK" (confirm), proceed with deletion
            
                    const prompts = JSON.parse(localStorage.getItem("prompts"));
            
                    // Filter out the prompt with the matching id
                    const updatedPrompts = prompts.filter((p) => p.id !== prompt.id);
                    
                    // Save the updated list back to localStorage
                    savePrompts(updatedPrompts);
            
                    // Re-render the updated list of prompts
                    renderPrompts(updatedPrompts);
                } else {
                    // If the user clicks "Cancel", do nothing
                    console.log("Prompt deletion canceled.");
                }
            });
            //favourite:
            const favouriteBtn = document.createElement("button");
            favouriteBtn.textContent = prompt.isFavourite ? "❤️" : "🤍";  // Filled or empty star depending on favourite status
            favouriteBtn.dataset.id = prompt.id;
            favouriteBtn.addEventListener("click", () => {
                toggleFavourite(prompt.id);  // Toggle favourite status on button click
            });
            // Append the elements to the prompt container.
            promptDiv.appendChild(text);
            promptDiv.appendChild(copyBtn);
            promptDiv.appendChild(favouriteBtn);
            promptDiv.appendChild(deleteBtn);

            // Append the prompt container to the main prompt list.
            promptList.appendChild(promptDiv);
        }
    });
}

function toggleFavourite(promptId) {
    const prompts = JSON.parse(localStorage.getItem("prompts"));

    const prompt = prompts.find((p) => p.id == promptId);
    if (prompt) {
        prompt.isFavourite = !prompt.isFavourite; // Toggle favourite status
        savePrompts(prompts); // Save the updated prompts list
        renderPrompts(prompts); // Re-render the list of prompts
    }
}


// Add Custom Prompt
function addCustomPrompt() {
    const text = customPromptInput.value.trim();
    if (!text) return;

    const prompts = JSON.parse(localStorage.getItem("prompts"));
    const newPrompt = { id: Date.now(), text }; //unique id

    prompts.push(newPrompt);
    savePrompts(prompts);
    renderPrompts(prompts);//display all prompts in local storage

    addPromptModal.classList.add("hidden");
    customPromptInput.value = "";
}

// Event Listeners
searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();//if we search Hello or hello (insensitive)
    const prompts = JSON.parse(localStorage.getItem("prompts"));
    const filteredPrompts = prompts.filter((p) =>
        p.text.toLowerCase().includes(searchTerm)
    );
    renderPrompts(filteredPrompts);
});


addPromptBtn.addEventListener("click", () => {
    addPromptModal.classList.remove("hidden");
    customPromptInput.value = "";

});

closeModalBtn.addEventListener("click", () => {
    addPromptModal.classList.add("hidden");
});

savePromptBtn.addEventListener("click", addCustomPrompt);

document.getElementById("show-favourites-btn").addEventListener("click", () => {
    const prompts = JSON.parse(localStorage.getItem("prompts"));
    // Filter prompts to only get the ones marked as favourite
    const favouritePrompts = prompts.filter((prompt) => prompt.isFavourite);
    
    // Render only favourite prompts
    renderPrompts(favouritePrompts);
    // Hide "Show Favourite Prompts" button and show "Back" button
    document.getElementById("show-favourites-btn").style.display = "none";
    document.getElementById("back-btn").style.display = "inline";
});
document.getElementById("back-btn").addEventListener("click", () => {
    const prompts = JSON.parse(localStorage.getItem("prompts"));
    
    renderPrompts(prompts); // Show all prompts
    
    // Show "Show Favourite Prompts" button and hide "Back" button
    document.getElementById("show-favourites-btn").style.display = "inline";
    document.getElementById("back-btn").style.display = "none";
});

// Load Prompts on Startup
loadPrompts();


document.getElementById("download-json").addEventListener("click", () => {
    const prompts = JSON.parse(localStorage.getItem("prompts"));//fetch
    const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: "application/json" });//create json file
    const url = URL.createObjectURL(blob);//making url
    const a = document.createElement("a");//link
    a.href = url;
    a.download = "prompts.json"; //when download file name becomes
    a.click();

    URL.revokeObjectURL(url);//del url
});
