const baseURL = 'http://localhost:3131';
let loggedUsername = false;
let loggedPassword = false;
let targetUser = false;


document.addEventListener('DOMContentLoaded', () => {

    // FORMS 
    const searchBarForm = document.querySelector('#searchBar');
    const loginForm = document.querySelector('#loginForm');

    //LABELS
    const firstNameLabel = document.querySelector('label[for="firstNameInput"]');
    const lastNameLabel = document.querySelector('label[for="lastNameInput"]');
    const dateOfBirthLabel = document.querySelector('label[for="dateOfBirthInput"]');


    //INPUTS
    const searchInput = document.querySelector('#searchInput');
    const usernameInput = document.querySelector('#usernameInput');
    const passwordInput = document.querySelector('#passwordInput');
    const firstNameInput = document.querySelector('#firstNameInput');
    const lastNameInput = document.querySelector('#lastNameInput');
    const dateOfBirthInput = document.querySelector('#dateOfBirthInput');

    //BUTTONS
    const loginBtn = document.querySelector('#login');
    const signInBtn = document.querySelector('#signInBtn');

    // DIV
    const searchResultDiv = document.querySelector('#searchResult');
    const feedbackDiv = document.querySelector('#feedbackDiv');
    // HIDING THE FEEDBACK DIV AT FIRST LOAD
    feedbackDiv.style.display = 'none';

    // FEEDBACK TEXT
    const feedbackText = document.querySelector('#feedbackText');

    // UL
    const ulTag = document.querySelector('ul');

    // FEEDBACK DIV CLOSE BUTTON
    const closeBtn = document.querySelector('#closeBtn');

    closeBtn.addEventListener('click', (event) => {
        feedbackDiv.style.display = 'none';
        feedbackText.innerText = '';
    })
    document.addEventListener('keydown', (event) => {
        if (event.code === "Escape") {
            feedbackDiv.style.display = 'none';
            feedbackText.innerText = '';
        }
    })


    // LOAD TRENDING POSTS/PICTURES
    getMostLikedPostsAndPictures(searchResultDiv);

    
    // MANAGE THE DISPLAY OF THE INPUTS
    const manageInputFieldsDisplay = () => {
        if (loginForm.className === 'login') {
            firstNameInput.style.display = 'none';
            lastNameInput.style.display = 'none';
            dateOfBirthInput.style.display = 'none';

            firstNameInput.nextElementSibling.style.display = 'none';
            lastNameInput.nextElementSibling.style.display = 'none';
            dateOfBirthInput.nextElementSibling.style.display = 'none';

            firstNameLabel.style.display = 'none';
            lastNameLabel.style.display = 'none';
            dateOfBirthLabel.style.display = 'none';

        } else if (loginForm.className === 'signIn') {
            firstNameInput.style.display = 'inline';
            lastNameInput.style.display = 'inline';
            dateOfBirthInput.style.display = 'inline';

            firstNameInput.nextElementSibling.style.display = 'inline';
            lastNameInput.nextElementSibling.style.display = 'inline';
            dateOfBirthInput.nextElementSibling.style.display = 'inline';

            firstNameLabel.style.display = 'inline';
            lastNameLabel.style.display = 'inline';
            dateOfBirthLabel.style.display = 'inline';
        }
    }
    manageInputFieldsDisplay();
    //LOGIN FORM
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = usernameInput.value;
        const password = passwordInput.value;
        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        const dob = dateOfBirthInput.value;

        if (loginForm.className === 'login') {
            if (!username || !password) {
                feedbackDiv.style.display = 'block';
                feedbackText.innerText = 'All fields are required';
            } else {
                requestLogin(username, password, feedbackDiv, feedbackText);
                usernameInput.value = '';
                passwordInput.value = '';
            }
        } else if (loginForm.className === 'signIn') {
            if (!username || !password || !firstName || !lastName || !dob) {
                feedbackDiv.style.display = 'block';
                feedbackText.innerText = 'All fields are required';
            } else {
                if (checkValidDOBFormat(dob)) {
                    requestSignIn(username, password, firstName, lastName, dob, feedbackDiv, feedbackText)
                    usernameInput.value = '';
                    passwordInput.value = '';
                    firstNameInput.value = '';
                    lastNameInput.value = '';
                    dateOfBirthInput.value = '';

                } else {
                    feedbackDiv.style.display = 'block';
                    feedbackText.innerText = 'Date of birth should be on the format YYYY-MM-DD';
                }
            }
        }

    })


    //SIGN IN BUTTON
    signInBtn.addEventListener('click', () => {
        if (signInBtn.innerText === 'Sign in') {
            loginForm.className = 'signIn';
            loginBtn.innerText = 'Sign in';
            signInBtn.innerText = 'Login';
        } else if (signInBtn.innerText === 'Login') {
            loginForm.className = 'login';
            loginBtn.innerText = 'signIn';
            signInBtn.innerText = 'Sign in';
        }
        manageInputFieldsDisplay();
    })

    searchBarForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchWord = searchInput.value;

        if (searchWord) {
            searchForUser(searchWord, feedbackDiv, feedbackText, ulTag)
        }
    })

    // EVENT LISTENER FOR CLICK ON SEARCH RESULT USERNAME
    ulTag.addEventListener('click', (event) => {
        if (event.target === ulTag.firstChild) {
            targetUser = ulTag.firstChild.innerText;
            sessionStorage.setItem('targetUser', `${targetUser}`);
            window.location.href = './Client/Main page/mainPage.html';
        }
    })


}) ///////////////////////////////////////////////////////////////////////////


//
const getMostLikedPostsAndPictures = (container) => {

}

// CHECK FOR A VALID FORMAT OF DATE OF BIRTH (YYYY-MM-DD)
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


// DO THE LOGIN REQUEST
const requestLogin = async (username, password, feedbackDiv, feedbackText) => {
    try {
        const response = await axios.put(`${baseURL}/users/logging`, {loggedUsername: username, loggedPassword: password});
        loggedUsername = response.data.body.username;
        loggedPassword = password;
        sessionStorage.setItem('loggedUsername', `${loggedUsername}`);
        sessionStorage.setItem('loggedPassword', `${loggedPassword}`);
        window.location.href = './Client/Main page/mainPage.html'
    }  catch (err) {
        feedbackDiv.style.display = 'block';
        if (err.response.data.message) {
            feedbackText.innerText = err.response.data.message;
        } else {
            feedbackText.innerText = err;
        }
    }
}

const requestSignIn = async (username, password, firstName, lastName, dob, feedbackDiv, feedbackText) => {
    try {
        const requestBody = {
            username: username,
            password: password,
            firstname: firstName,
            lastname: lastName,
            dob: dob
        }
        const response = await axios.post(`${baseURL}/users`, requestBody);
        loggedUsername = response.data.body.username;
        loggedPassword = password;
        sessionStorage.setItem('loggedUsername', `${loggedUsername}`);
        sessionStorage.setItem('loggedPassword', `${loggedPassword}`);
        window.location.href = './Client/Main page/mainPage.html'
    }  catch (err) {
        feedbackDiv.style.display = 'block';
        if (err.response.data.message) {
            feedbackText.innerText = err.response.data.message;
        } else {
            feedbackText.innerText = err;
        }
    }
}


// GET SEARCH RESULT
const searchForUser = async (searchWord, feedbackDiv, feedbackText, ulTag) => {
    try {
        const response = await axios.get(`${baseURL}/users/${searchWord}`);
        displaySearchResult(ulTag, response.data.body)
    }  catch (err) {
        feedbackDiv.style.display = 'block';
        if (err.response.data.message) {
            feedbackText.innerText = err.response.data.message;
        } else {
            feedbackText.innerText = err;
        }
    }
}

// AD SEARCH RESULT TO DOM
const displaySearchResult = (ulTag, userInfo) => {
    const usernameLi = document.createElement('li');
    usernameLi.innerText = userInfo.username,
    usernameLi.className = 'usernameLi';

    const firstNameLi = document.createElement('li');
    const boldFirstName = document.createElement('strong');
    boldFirstName.innerText = 'First name: ';
    const firstNameTag = document.createElement('span');
    firstNameTag.innerText = userInfo.firstname;
    firstNameLi.append(boldFirstName, firstNameTag);

    const lastNameLi = document.createElement('li');
    const boldLastName = document.createElement('strong');
    boldLastName.innerText = 'Last name: ';
    const lastNameTag = document.createElement('span');
    lastNameTag.innerText = userInfo.lastname;
    lastNameLi.append(boldLastName, lastNameTag);

    const signingDate = document.createElement('li');
    signingDate.className = 'signingDate'
    signingDate.innerText = `User since: ${userInfo.signing_date}`;
    
    ulTag.append(usernameLi, firstNameLi, lastNameLi, signingDate)
}