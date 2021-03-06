let url;
let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');

const baseURL = 'http://localhost:3131';

document.addEventListener('DOMContentLoaded', async () => {
    // BUTTON
    const logoutBtn = document.querySelector('#logoutBtn');

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem("loggedUsername");
        sessionStorage.removeItem("loggedPassword");
        sessionStorage.removeItem("targetUser");

        window.location.href = '../../index.html';
    })

    // TABLE OF CONTENT
    const tableOfContents = document.querySelector('#tableOfContents');

    tableOfContents.addEventListener('click', (event) => {
        if (event.target.nodeName === 'A') {
            sessionStorage.removeItem("targetUser");
        }
    })
    const loggedUserTag = document.querySelector('#loggedUser');
    if (!loggedUsername) {
      logoutBtn.innerText = 'Home';
      loggedUserTag.innerText = targetUser;
    } else if (loggedUsername) {
      let userInfo = await getInfoAboutUser(loggedUsername);
          loggedUserTag.innerText = `${userInfo.body.firstname} ${userInfo.body.lastname}`;
    }

    loadPostsTimesLikedData();
    // loadPictureTimesLikedData();

    let feedForm = document.querySelector('#toggle');
    let toggle = 'posts'
    feedForm.addEventListener('click', (event) => {
        event.preventDefault();
        if (toggle === 'posts') {
            // clearScreen()
            loadPictureTimesLikedData();
            toggle = 'pictures'
        } else if (toggle === 'pictures') {
            // clearScreen()
            loadPostsTimesLikedData();
            toggle = 'posts'
        }

    })

    //event listener on the comments and likes div
    let cardContainer = document.querySelector('#dataContainer');
    cardContainer.addEventListener('click', async (event) => {
        if (event.target.className === 'postTimesLiked') {
            let container = event.target.parentNode.parentNode;
            let response = await likeAPost(container.id)
            if (response.message === 'post already liked') {
                await deletePostLike(container.id);
            }
            loadPostsTimesLikedData()
        }
        if (event.target.className === 'picTimesLiked') {
            let container = event.target.parentNode.parentNode;
            let response = await likeAPicture(container.id)
            if (response.message === 'picture already liked') {
                await deletePicLike(container.id);
            }
            loadPictureTimesLikedData()
        }
        if (event.target.className === 'commentDiv') {
            let container = event.target.parentNode.parentNode;
            window.location.href = '../Comment Page/commentsPage.html';
            sessionStorage.setItem('post_id', `${container.id}`);

        }
    })
})

// this function loads the trending(times a post is liked) likes from the database
const loadPostsTimesLikedData = async () => {
    clearScreen()
    url = `http://localhost:3131/likes/posts/times_liked`
    const {
        data
    } = await axios.get(url);

    data.body.forEach(el => {
        creatingCardPost(el)
    });
}

// this function loads the trending(times a post is liked) likes from the database
const loadPictureTimesLikedData = async () => {
    clearScreen()
    url = `http://localhost:3131/likes/pictures/times_liked`
    const {
        data
    } = await axios.get(url);

    data.body.forEach(el => {
        creatingCardPost(el)
    });
}

//this function is to like a users post
const likeAPost = async (postId) => {
    url = `http://localhost:3131/likes/posts/${postId}`;

    //user login information object
    let loginInfo = {
        loggedUsername: loggedUsername,
        loggedPassword: loggedPassword
    };
    try {
        const {
            data
        } = await axios.post(url, loginInfo);
        return data;
    } catch (err) {
        console.log(err)
    }
}
//this function is to like a users post
const likeAPicture = async (postId) => {
    url = `http://localhost:3131/likes/pictures/${postId}`

    //user login information object
    let loginInfo = {
        loggedUsername: loggedUsername,
        loggedPassword: loggedPassword
    };
    try {
        const {
            data
        } = await axios.post(url, loginInfo);
        return data;
    } catch (err) {
        console.log(err)
    }
}

//this function deletes a like
const deletePostLike = async (postId) => {
    url = `http://localhost:3131/likes/posts/${postId}/delete`
    //user login information object
    let loginInfo = {
        loggedUsername: loggedUsername,
        loggedPassword: loggedPassword
    };
    const {
        data
    } = await axios.put(url, loginInfo)
}

//this function deletes a like
const deletePicLike = async (picId) => {
    url = `http://localhost:3131/likes/pictures/${picId}/delete`
    //user login information object
    let loginInfo = {
        loggedUsername: loggedUsername,
        loggedPassword: loggedPassword
    };
    const {
        data
    } = await axios.put(url, loginInfo)
}

//function to clear screen
const clearScreen = async () => {
    let container = getDataContainer()
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }
}


// retrieving the feed sub-containers
const getDataContainer = () => document.querySelector('#dataContainer')

//This function create the cards on the create that will hold the axios information
const creatingCardPost = async (el) => {
    const dataContainer = getDataContainer()

    //creating the elements that will hold the information on the pokemon
    const userContainer = creatingElem('div');
    const likeContainer = creatingElem('div');
    const finalContainer = creatingElem('div');

    userContainer.className = 'userName';
    likeContainer.className = 'likeContainer';
    finalContainer.className = 'finalContainer';
    // finalContainer.id = el.post_id

    // creating tags to hold the information
    let username = creatingElem('p');
    let commentDiv = creatingElem('div');
    let body = creatingElem('div');
    let times_liked = creatingElem('div');
    let pic = creatingElem('img');

    body.className = 'postBody';
    commentDiv.className = 'commentDiv';
    // times_liked.className = 'timesLiked';
    commentDiv.innerText = 'Comments'

    //assigning the innerText fore the posts
    if (el.body) {
        times_liked.className = 'postTimesLiked';
        finalContainer.id = el.post_id
        username.innerText = `This post by: ${el.poster_username}`
        body.innerText = `Text: ${el.body}`
        times_liked.innerText = `Liked: ${el.times_liked} times`;
        userContainer.append(username);
        likeContainer.append(commentDiv, times_liked);
        finalContainer.append(userContainer, body, likeContainer)
    } else {
        times_liked.className = 'picTimesLiked';
        finalContainer.id = el.picture_id
        username.innerText = `Owner: ${el.owner_username}`
        pic.src = el.picture_link
        times_liked.innerText = `Liked: ${el.times_liked} times`;
        userContainer.append(username);
        likeContainer.append(commentDiv, times_liked);
        finalContainer.append(userContainer, pic, likeContainer);
    }

    //appending thd UserContainer that holds the created elements to the container
    dataContainer.append(finalContainer);

    //this function creates elements
    function creatingElem(elem) {
        return document.createElement(`${elem}`)
    }
}

const getInfoAboutUser = async (loggedUsername) => {
    try {
        const url = `${baseURL}/users/${loggedUsername}`;
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        console.log(err)
    }
  }