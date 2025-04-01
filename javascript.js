async function liked(button, id, userId, type) {
    const response = await fetch("/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId, type }) // Sending type to know if it's a post or comment
    });

    if (response.ok) {
        const data = await response.json();
        updateUI(button, data.likedBy.includes(userId), data.dislikedBy.includes(userId), type, id);
    }
}

async function disliked(button, id, userId, type) {
    const response = await fetch("/dislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId, type }) // Sending type
    });

    if (response.ok) {
        const data = await response.json();
        updateUI(button, data.likedBy.includes(userId), data.dislikedBy.includes(userId), type, id);
    }
}

// Update UI based on updated database values
function updateUI(button, likedByUser, dislikedByUser, type, id) {
    let container = document.querySelector(`#${type}-${id}`); // Get either post or comment container
    if (!container) return;

    let likeButton = container.querySelector(".like img");
    let dislikeButton = container.querySelector(".dislike img");

    likeButton.src = likedByUser ? "/media/orange_upvote.png" : "/media/upvote.png";
    dislikeButton.src = dislikedByUser ? "/media/orange_downvote.png" : "/media/downvote.png";
}
//

function copyLinkToClipboard() {
    const url = window.location.href; // Get the current page URL
    navigator.clipboard.writeText(url)
        .then(() => {
            alert("Link copied to clipboard!");
        })
        .catch(err => {
            console.error("Failed to copy: ", err);
        });
}

function addPopUp(openButton, closeButtonId, popUpId) {
    const popUp = document.getElementById(popUpId);
    const closeButton = document.getElementById(closeButtonId);

    if (!popUp || !closeButton) {
        console.error("Modal elements not found.");
        return;
    }

    openButton.addEventListener("click", () => {
        popUp.classList.add("open");
    });

    closeButton.addEventListener("click", () => {
        popUp.classList.remove("open");
    });
}