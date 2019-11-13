let url;
let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');
let dataArr = [];
let postNum = 0;
let picNum = 0;
let numOfLikesArray = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTargetUserLikedPostData();
    let feedForm = document.querySelector('#toggle');
    feedForm.addEventListener('click', (event) => {
        if (event.target.id === 'toggle' && feedForm.className === 'postsLoad') {
            // clearScreen()
            loadTargetUserLikedPicsData();
            clearComments()
            feedForm.className = 'picturesLoad'
        } else if (event.target.id === 'toggle' && feedForm.className === 'picturesLoad') {
            // clearScreen()
            loadTargetUserLikedPostData();
            feedForm.className = 'postsLoad'
            clearComments()
        }

    })

    // BUTTON
    const logoutBtn = document.querySelector('#logoutBtn');
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem("loggedUsername");
        sessionStorage.removeItem("loggedPassword");
        sessionStorage.removeItem("targetUser");
        window.location.href = '../../index.html';
    })

    if (!loggedUsername) {
        logoutBtn.innerText = 'Home'
        // document.querySelector('#album').style.display = 'none'
    }
    document.querySelector('#comments').style.visibility = 'hidden';

    //event listener on the comments and likes div to post or delete like
    let cardContainer = document.querySelector('#dataContainer');
    cardContainer.addEventListener('click', async (event) => {

        if (event.target.className === 'postTimesLiked') {
            let container = event.target.parentNode.parentNode;
            let response = await likeAPost(container.id)
            creatingCard('posts', dataArr[num])
            if (response.message === 'post already liked') {
                await deletePostLike(container.id);
                creatingCard('posts', dataArr[num])
            }
        }
        if (event.target.className === 'picTimesLiked') {
            let container = event.target.parentNode.parentNode;
            let response = await likeAPicture(container.id)
            creatingCard('pictures', dataArr[num])
            if (response.message === 'picture already liked') {
                await deletePicLike(container.id);
                creatingCard('pictures', dataArr[num])
            }
        }
        if (event.target.className === 'commentDiv') {
            document.querySelector('#comments').style.visibility = 'initial';
            let container = event.target.parentNode.parentNode;

            loadCommentsData(container.id);
        }
    })

    //event listener on the previous and next button
    let backAndForth = document.querySelector('#backAndForthButtons');
    backAndForth.addEventListener('click', async (event) => {
        const toggleBTN = event.target.parentNode.parentNode.firstChild.nextSibling;
        let route;
        if (toggleBTN.className === 'postsLoad') {
            route = 'posts'
        }
        if (toggleBTN.className === 'picturesLoad') {
            route = 'pictures'
        }

        event.preventDefault();
        if (event.target.id === 'previous') {
            if (route === 'posts') {
                postNum--;
                if (postNum < 0) {
                    postNum = dataArr.length - 1;
                }
                displayData(route, postNum)
            } else if (route === 'pictures') {
                picNum--;
                if (picNum < 0) {
                    picNum = dataArr.length - 1;
                }
                displayData(route, picNum)
            }
            clearComments()
            document.querySelector('#comments').style.visibility = 'hidden';

        }
        if (event.target.id === 'next') {
            if (route === 'posts') {
                postNum++;
                if (postNum > dataArr.length - 1) {
                    postNum = 0;
                }
                displayData(route, postNum)
            } else if (route === 'pictures') {
                picNum++;
                if (picNum > dataArr.length - 1) {
                    picNum = 0;
                }
                displayData(route, picNum)
            }
            clearComments()
            document.querySelector('#comments').style.visibility = 'hidden';

        }
    })
})


// this function loads the trending(times a post is liked) likes from the database
const loadTargetUserLikedPostData = async () => {
    url = `http://localhost:3131/likes/posts/interest/${targetUser}`
    const {
        data
    } = await axios.get(url);

    dataArr = data.body;
    creatingCard('posts', dataArr[postNum])
}
const displayData = (route, num) => {
    clearScreen()
    creatingCard(route, dataArr[num]) // TO REVIEW
}

// this function loads the trending(times a post is liked) likes from the database
const loadTargetUserLikedPicsData = async () => {
    
    targetUser = targetUser
    url = `http://localhost:3131/likes/pictures/interest/${targetUser}`
    const {
        data
    } = await axios.get(url);

    dataArr = data.body;
    creatingCard('pictures', dataArr[picNum])
}

//function to load the comments data
const loadCommentsData = async (postId) => {
    clearComments()
    url = `http://localhost:3131/comments/posts/${postId}`

    try {
        const {
            data
        } = await axios.get(url)
        data.body.forEach(elem => {
            creatingCommentCard(elem)
        });
    } catch (error) {
        console.log(error);

    }
}

//function to load the number of likes
const loadNumOfLikes = async (endpoint, id) => {
    url = `http://localhost:3131/likes/${endpoint}/${id}`

    try {
    const {
        data
    } = await axios.get(url)

    } catch (error) {
        console.log(error);

    }
    numOfLikesArray = data.body;
    return numOfLikesArray
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
    console.log(data);

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
const clearScreen = () => {
    let container = getDataContainer()
    container.textContent = ''
}

const clearComments = () => {
    let container = document.querySelector('#comments')
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }
}


// retrieving the feed sub-containers
const getDataContainer = () => document.querySelector('#dataContainer')

//This function create the cards on the create that will hold the axios information
const creatingCard = async (route, el) => {
    clearScreen();
    const dataContainer = getDataContainer()
    let likesCount;

    if (el.post_id) {
        likesCount = await loadNumOfLikes(route, el.post_id)
    } else if (el.picture_id) {
        likesCount = await loadNumOfLikes(route, el.picture_id)
    }


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
        times_liked.innerText = `Liked: ${likesCount.length} times`;
        userContainer.append(username);
        likeContainer.append(commentDiv, times_liked);
        finalContainer.append(userContainer, body, likeContainer)
    } else {
        times_liked.className = 'picTimesLiked';
        finalContainer.id = el.picture_id
        username.innerText = `Owner: ${el.owner_username}`
        pic.src = el.picture_link
        times_liked.innerText = `Liked: ${likesCount.length} times`;
        userContainer.append(username);
        likeContainer.append(commentDiv, times_liked);
        finalContainer.append(userContainer, pic, likeContainer);
    }

    //appending thd UserContainer that holds the created elements to the container
    dataContainer.prepend(finalContainer);
}

const creatingCommentCard = (comEl) => {
    let backAndForthDiv = document.querySelector('#dataContainer');
    let commentsContainer = document.querySelector('#comments')

    //creating nescessary tage to hold data
    let authorContainer = creatingElem('div');
    let commentForm = creatingElem('div');
    let username = creatingElem('p');
    let commentDiv = creatingElem('div');
    let comment = creatingElem('p');

    commentForm.className = 'commentForm';
    authorContainer.className = 'userName';
    commentDiv.className = 'postBody'
    //setting the innerText of tags
    username.innerText = comEl.author_username;
    comment.innerText = comEl.comment;

    //appending information to create cards
    commentDiv.append(comment)
    authorContainer.append(username);
    commentForm.append(authorContainer, commentDiv)

    commentsContainer.append(commentForm);
    // backAndForthDiv.append(commentsContainer);
}

//this function creates elements
const creatingElem = (elem) => document.createElement(`${elem}`);