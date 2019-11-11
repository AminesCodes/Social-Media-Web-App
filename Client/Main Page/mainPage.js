let url;
let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');

document.addEventListener('DOMContentLoaded', () => {
    loadPostsTimesLikedData();
    // loadPictureTimesLikedData();

    let feedForm = document.querySelector('#feedForm');
    let toggle = 'posts'
    feedForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (toggle === 'posts') {
            clearScreen()
            loadPictureTimesLikedData();

            toggle = 'pictures'
        } else if (toggle === 'pictures') {
            clearScreen()
            loadPostsTimesLikedData();
            toggle = 'posts'
        }

    })

    if (!loggedUsername) {
        document.querySelector('button').style.display = 'none'
        document.querySelector('#album').style.display = 'none'
    }

})

// this function loads the trending(times a post is liked) likes from the database
const loadPostsTimesLikedData = async () => {
    if (!targetUser) {
        url = `http://localhost:3131/likes/posts/times_liked`
    } else {
        url = `http://localhost:3131/likes/posts/interest/${targetUser}`
    }
    // url = `http://localhost:3131/likes/posts/times_liked`
    const {
        data
    } = await axios.get(url);

    console.log(data);

    data.body.forEach(el => {
        creatingCardPost(el)
    });
    evenListenerOnContainer()
}

// this function loads the trending(times a post is liked) likes from the database
const loadPictureTimesLikedData = async () => {
    url = `http://localhost:3131/likes/pictures/times_liked`
    const {
        data
    } = await axios.get(url);

    console.log(data);

    data.body.forEach(el => {
        creatingCardPost(el)
    });
    evenListenerOnContainer()
}

//event listener
const evenListenerOnContainer = () => {
    let cardContainer = document.querySelector('#dataContainer');
    cardContainer.addEventListener('click', async (event) => {
        if (event.target.className === 'postTimesLiked') {
            let container = event.target.parentNode.parentNode;
            let response = await likeAPost(container.id)
            console.log(response.message);
            if (response.message === 'post already liked') {
                deleteLike(container.id);
            }
        } else if (event.target.className === 'picTimesLiked') {
            let container = event.target.parentNode.parentNode;
            let response = await likeAPicture(container.id)
            if (response.message === 'picture already liked') {
                deletePicLike(container.id);
            }
        }
        if (event.target.className === 'commentDiv') {
            console.log('hello');
            window.location.href = '../Comment Page/commentsPage.html';
        }
    })
}

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
    url = `http://localhost:3131/likes/pictures/${postId}`;

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

//this function deletes a like
const deleteLike = async (postId) => {
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
const deletePicLike = async (postId) => {
    url = `http://localhost:3131/likes/pictures/${postId}/delete`
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
    container = getDataContainer()
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }
}


// retrieving the feed sub-containers
const getDataContainer = () => document.querySelector('#dataContainer')

//This function create the cards on the create that will hold the axios information
const creatingCardPost = async (el) => {
    const postsContainer = getDataContainer()

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
    postsContainer.append(finalContainer);

    //this function creates elements
    function creatingElem(elem) {
        return document.createElement(`${elem}`)
    }
}