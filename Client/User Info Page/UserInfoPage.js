let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');
console.log(loggedUsername, loggedPassword, targetUser)

const baseURL = 'http://localhost:3131';
let initialDOB = false;

document.addEventListener('DOMContentLoaded', async () => {
    const loggedUserTag = document.querySelector('#loggedUser');

    // BUTTON
    const logoutBtn = document.querySelector('#logoutBtn');

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem("loggedUsername");
        sessionStorage.removeItem("loggedPassword");
        sessionStorage.removeItem("targetUser");

        window.location.href = '../../index.html';
    })
    
    
    // INPUTS
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');
    const firstNameInput = document.querySelector('#firstName');
    const lastNameInput = document.querySelector('#lastName');
    const dobInput = document.querySelector('#dateOfBirth');

    // FORM
    const updateForm = document.querySelector('#updateForm');

    //DIV
    const feedbackDiv = document.querySelector('#feedbackDiv');
    // HIDING THE FEEDBACK DIV AT FIRST LOAD
    feedbackDiv.style.display = 'none';

    // FEEDBACK TEXT
    const feedbackText = document.querySelector('#feedbackText');

    feedbackDiv.addEventListener('click', (event) => {

        if (event.target.parentNode === feedbackDiv && event.target.innerText === 'X') {
            feedbackDiv.style.display = 'none';
        }
    })
    document.addEventListener('keydown', (event) => {
        if (event.code === "Escape") {
            feedbackDiv.style.display = 'none';
        }
    })


    if (loggedUsername) {
        let userInfo = await getInfoAboutUser(loggedUsername, feedbackDiv, feedbackText);
        loggedUserTag.innerText = `${userInfo.body.firstname} ${userInfo.body.lastname}`;
        
        fillOutForm(usernameInput, firstNameInput, lastNameInput, dobInput, userInfo)
    }

    updateForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;
        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        const dob = dobInput.value;

        const date = dob.split("/").reverse().join("-");
        if (checkValidDOBFormat(date)) {
            const updateInfo = {
                loggedUsername: loggedUsername,
                loggedPassword: loggedPassword,
                username: username,
                password: password,
                firstname: firstName,
                lastname: lastName,
                dob: date
            }
            updateUserRequest(usernameInput, firstNameInput, lastNameInput, dobInput, updateInfo, feedbackDiv, feedbackText, loggedUserTag);
        }
    })

    
}) ///////////////////////////////////////////////


const getInfoAboutUser = async (loggedUsername) => {
    try {
        const url = `${baseURL}/users/${loggedUsername}`;
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        feedbackDiv.style.display = 'block';
        if (err.response.data.message) {
            feedbackText.innerText = err.response.data.message;
        } else {
            feedbackText.innerText = err;
        }
    }
}


const fillOutForm = (usernameInput, firstNameInput, lastNameInput, dobInput, userInfo) => {
    
    usernameInput.value = userInfo.body.username;
    firstNameInput.value = userInfo.body.firstname;
    lastNameInput.value = userInfo.body.lastname;
    dobInput.value = userInfo.body.dob;

    initialDOB = userInfo.body.dob
}

const checkValidDOBFormat = (dob) => {
    
    if (dob.length !== 10 || dob[4] !== '-' || dob[7] !== '-') {
        return false;
    } else {
        const year = dob.slice(0, 4);
        const month = dob.slice(5, 7);
        const day = dob.slice(8, 10);
        if (isNaN(parseInt(year)) || String(parseInt(year)).length !== year.length
            || isNaN(parseInt(month)) || isNaN(parseInt(day))) {
                return false;
            }
    }
    return true;
}

const updateUserRequest = async (usernameInput, firstNameInput, lastNameInput, dobInput, updateInfo, feedbackDiv, feedbackText, loggedUserTag) => {
    
    try {
        const response = await axios.patch(`${baseURL}/users/${loggedUsername}`, updateInfo)
        fillOutForm(usernameInput, firstNameInput, lastNameInput, dobInput, response.data);
        loggedUserTag.innerText = `${response.data.body.firstname} ${response.data.body.lastname}`;

        sessionStorage.setItem('loggedUsername', `${response.data.body.username}`);
        if (updateInfo.password) {
            sessionStorage.setItem('loggedPassword', `${updateInfo.password}`);
        }
    } catch (err) {
        feedbackDiv.style.display = 'block';
        if (err.response.data.message) {
            feedbackText.innerText = err.response.data.message;
        } else {
            feedbackText.innerText = err;
        }
    }
}
