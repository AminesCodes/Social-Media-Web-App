let url;
let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');
let dataArr = [];
let num = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadTargetUserLikedPostData();
    let feedForm = document.querySelector('#toggle');
    let toggle = 'posts'
    feedForm.addEventListener('click', (event) => {
        event.preventDefault();
        if (toggle === 'posts') {
            clearScreen()
            loadTargetUserLikedPicsData();
            toggle = 'pictures'
        } else if (toggle === 'pictures') {
            // num = 0;
            clearScreen()
            loadTargetUserLikedPostData();
            toggle = 'posts'
        }

    })

    // BUTTON
    const logoutBtn = document.querySelector('#logoutBtn');
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem("loggedUsername");
        sessionStorage.removeItem("loggedPassword");
        sessionStorage.removeItem("targetUser");
        // console.log(sessionStorage)
        window.location.href = '../../index.html';
        console.log(sessionStorage)
    })

    if (!loggedUsername) {
        logoutBtn.innerText = 'Home'
        document.querySelector('#album').style.display = 'none'
    }

    //event listener on the comments and likes div to post or delete like
    let cardContainer = document.querySelector('#dataContainer');
    cardContainer.addEventListener('click', async (event) => {
        event.preventDefault()
        if (event.target.className === 'postTimesLiked') {
            let container = event.target.parentNode.parentNode;
            let response = await likeAPost(container.id)
            console.log(response.message);
            if (response.message === 'post already liked') {
                deletePostLike(container.id);
            }
        }
        if (event.target.className === 'picTimesLiked') {
            let container = event.target.parentNode.parentNode;
            console.log(container);
            let response = await likeAPicture(container.id)
            if (response.message === 'picture already liked') {
                await deletePicLike(container.id);
            }
        }
        if (event.target.className === 'commentDiv') {
            let container = event.target.parentNode.parentNode;
            console.log('hello');
            window.location.href = '../Comment Page/commentsPage.html';
            sessionStorage.setItem('post_id', `${container.id}`);
            console.log(sessionStorage.getItem('post_id'));

        }
    })

    //event listener on the previous and next button
    let backAndForth = document.querySelector('#backAndForth');
    backAndForth.addEventListener('click', async (event) => {
        console.log('fired');
        event.preventDefault();
        if (event.target.id === 'previous') {
            if (num <= 0) {
                num = dataArr.length;
            }
            num--;
            displayData()
        }
        if (event.target.id === 'next') {
            num++;
            console.log(num);
            if (num >= dataArr.length) {
                num = 0;
            }
            displayData()
        }
    })
})


// this function loads the trending(times a post is liked) likes from the database
const loadTargetUserLikedPostData = async () => {
    targetUser = 'jenama'
    url = `http://localhost:3131/likes/posts/interest/${targetUser}`
    const {
        data
    } = await axios.get(url);
    console.log(data);

    dataArr = data.body;
    console.log('help', dataArr);
    creatingCard(dataArr[num])
}
const displayData = () => {
    clearScreen()

    creatingCard(dataArr[num])
}

// this function loads the trending(times a post is liked) likes from the database
const loadTargetUserLikedPicsData = async () => {
    console.log(num);

    targetUser = 'vonbar'
    url = `http://localhost:3131/likes/pictures/interest/${targetUser}`
    const {
        data
    } = await axios.get(url);
    console.log(data);

    dataArr = data.body;
    creatingCard(dataArr[num])
}

// const displayPicsData = () => {
//     clearScreen()
//     creatingCard(data.body[num])
// }

//this function is to like a users post
const likeAPost = async (postId) => {
    url = `http://localhost:3131/likes/posts/${postId}`;

    //user login information object
    let loginInfo = {
        loggedUsername: 'vonbar',
        loggedPassword: '123'
    };
    try {
        const {
            data
        } = await axios.post(url, loginInfo);
        console.log('this is data', data)
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
        loggedUsername: 'vonbar',
        loggedPassword: '123'
    };
    try {
        const {
            data
        } = await axios.post(url, loginInfo);
        // console.log('this is data', data)
        return data;
    } catch (err) {
        console.log(err)
    }
}

//this function deletes a like
const deletePostLike = async (postId) => {
    url = `http://localhost:3131/likes/posts/${postId}/delete`
    console.log('called')
    //user login information object
    let loginInfo = {
        loggedUsername: 'vonbar',
        loggedPassword: '123'
    };
    const {
        data
    } = await axios.put(url, loginInfo)
    console.log(data);

}

//this function deletes a like
const deletePicLike = async (picId) => {
    url = `http://localhost:3131/likes/pictures/${picId}/delete`
    console.log('called')
    //user login information object
    let loginInfo = {
        loggedUsername: 'vonbar',
        loggedPassword: '123'
    };
    const {
        data
    } = await axios.put(url, loginInfo)
    console.log(data);

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
const creatingCard = (el) => {
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
        console.log('hello', el.post_id);

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