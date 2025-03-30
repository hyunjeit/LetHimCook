/* for login form*/ 
const usernameInput = document.querySelector("#usernameInput")
const passwordInput = document.querySelector("#passwordInput")
const rememberInput = document.querySelector("#remember_me")

const loginBtn = document.querySelector("#log_in_2");

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    let inputs = {
        username: usernameInput.value,
        password: passwordInput.value,
        remember_me: rememberInput.value
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputs)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'invalid'){
            alert('Invalid Credentials')
            location.reload();
        }
        if (data.redirect){
            window.location.href = data.redirect;
        }
    })
})