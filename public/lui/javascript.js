


/*
function liked(button) {
    let displayImage = button.querySelector("img");  // Select the image inside the button
    let currentSrc = displayImage.src.split('/').pop(); // Get only the filename

    if (currentSrc === 'upvote.png') {
        displayImage.src = '/media/orange_upvote.png'; // Use absolute path relative to public folder
    } else {
        displayImage.src = '/media/upvote.png';
    }
}

function disliked(button) {
    let displayImage = button.querySelector("img");  // Select the image inside the button
    let currentSrc = displayImage.src.split('/').pop(); // Get only the filename

    if (currentSrc === 'downvote.png') {
        displayImage.src = '/media/orange_downvote.png'; // Use absolute path relative to public folder
    } else {
        displayImage.src = '/media/downvote.png';
    }
}

function liked(button) {
    let commentBox = button.closest(".comment_box") || document.querySelector(".post_box") || document.querySelector(".posts");

    let likeImg = button.querySelector("img");
    let dislikeButton = commentBox.querySelector(".post_interactions button:nth-child(3) img"); // Find the dislike button image

    console.log("Like clicked!"); // Debugging log

    if (likeImg.src.includes("upvote.png")) {
        likeImg.src = "/media/orange_upvote.png"; // Activate like
        dislikeButton.src = "/media/downvote.png"; // Reset dislike
    } else {
        likeImg.src = "/media/upvote.png"; // Deactivate like
    }
}

function disliked(button) {
    let commentBox = button.closest(".comment_box") || document.querySelector(".post_box") || document.querySelector(".posts");

    let dislikeImg = button.querySelector("img");
    let likeButton = commentBox.querySelector(".post_interactions button:nth-child(2) img"); // Find the like button image

    console.log("Dislike clicked!"); // Debugging log

    if (dislikeImg.src.includes("downvote.png")) {
        dislikeImg.src = "/media/orange_downvote.png"; // Activate dislike
        likeButton.src = "/media/upvote.png"; // Reset like
    } else {
        dislikeImg.src = "/media/downvote.png"; // Deactivate dislike
    }
}
*/

function liked(button) {
    let postBox = button.closest(".comment_box") || button.closest(".post_box") || button.closest(".posts");

    let likeImg = button.querySelector("img");
    let dislikeButton = postBox.querySelector(".post_interactions button img[src*='downvote.png'], .post-actions .interactions button img[src*='downvote.png']"); // Find corresponding dislike

    console.log("Like clicked!"); // Debugging log

    if (likeImg.src.includes("upvote.png")) {
        likeImg.src = "/media/orange_upvote.png"; // Activate like
        if (dislikeButton) dislikeButton.src = "/media/downvote.png"; // Reset dislike
    } else {
        likeImg.src = "/media/upvote.png"; // Deactivate like
    }
}

function disliked(button) {
    let postBox = button.closest(".comment_box") || button.closest(".post_box") || button.closest(".posts");

    let dislikeImg = button.querySelector("img");
    let likeButton = postBox.querySelector(".post_interactions button img[src*='upvote.png'], .post-actions .interactions button img[src*='upvote.png']"); // Find corresponding like

    console.log("Dislike clicked!"); // Debugging log

    if (dislikeImg.src.includes("downvote.png")) {
        dislikeImg.src = "/media/orange_downvote.png"; // Activate dislike
        if (likeButton) likeButton.src = "/media/upvote.png"; // Reset like
    } else {
        dislikeImg.src = "/media/downvote.png"; // Deactivate dislike
    }
}

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