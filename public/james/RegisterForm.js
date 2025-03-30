/*for sign up form*/
const createAccountEmail = document.querySelector('#createAccountEmail');
const createAccountUsername = document.querySelector('#createAccountUsername');
const createAccountPassword = document.querySelector('#createAccountPassword');

const createBtn = document.querySelector('#sign_up');

createBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    let inputs = {
        email: createAccountEmail.value,
        username: createAccountUsername.value,
        password: createAccountPassword.value
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputs)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'invalid username'){
            alert('Username has been taken.')
            location.reload();
        }
        else if (data.message === 'invalid email'){
            alert('Email is already signed up.')
            location.reload();
        }
        else if (data.message === 'incomplete'){
            alert('Missing credentials.')
            location.reload();
        }
        if (data.redirect){
            window.location.href = data.redirect;
        }
    })
})