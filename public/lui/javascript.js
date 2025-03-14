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


/**function addPopUp(openButtonId, closeButtonId, popUpId){
    const openBtn=document.getElementById(openButtonId);
    const closeBtn=document.getElementById(closeButtonId);
    const modal=document.getElementById(popUpId);

    //this adds and removes the "open" class from the model
    //the open class makes the z-index (like, the layer indicator) into 999 (making it appear on top of everything)
    openBtn.addEventListener("click", ()=>{
        modal.classList.add("open");
    });
    closeBtn.addEventListener("click", ()=>{
        modal.classList.remove("open");
});
}**/

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