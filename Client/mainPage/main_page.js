let url;
let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');

document.addEventListener('DOMContentLoaded', () => {
    loadPostsTimesLikedData();
    loadPictureTimesLikedData();

    let feedForm = document.querySelector('#feedForm');
    let postDiv = document.querySelector('#postsContainer')
    let picDiv = document.querySelector('#picturesContainer');
    picDiv.style.display = 'none'


    let toggle = 'posts'
    feedForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (toggle === 'posts') {
            picDiv.style.display = 'initial'
            postDiv.style.display = 'none';
            toggle = 'pictures'
        } else if (toggle === 'pictures') {
            picDiv.style.display = 'none'
            postDiv.style.display = 'initial';
            toggle = 'posts'
        }

    })

    // let likingPost = document.querySelector('.finalContainer');
    // console.log(likingPost)


})

// this function loads the trending(times a post is liked) likes from the database
const loadPostsTimesLikedData = async () => {
    url = `http://localhost:3131/likes/posts/times_liked`
    const {
        data
    } = await axios.get(url);

    console.log(data);

    data.body.forEach(el => {
        creatingCardPost(el)
    });

    // let likingPost = document.querySelector('.finalContainer');
    // console.log(likingPost)
    evenListenerOnPost()
    return data
}

// this function loads the trending(times a post is liked) likes from the database
const loadPictureTimesLikedData = async () => {
    url = `http://localhost:3131/likes/pictures/times_liked`
    const {
        data
    } = await axios.get(url);

    console.log(data);

    data.body.forEach(el => {
        creatingCardPic(el)
    });

    return data
}

const evenListenerOnPost = () => {
    let likingPost = document.querySelector('.finalContainer');
    // console.log(likingPost);
    likingPost.addEventListener('click', (event) => {
        if (event.target.className = 'timesLiked') {
            likeAPost()
        }
        if (event.target.className = 'commentDiv') {
            console.log('hello');
            
        }
            
    })
}

const likeAPost = async () => {
    // postID = document.querySelector('postID')
    // postID.style.visibility = 'initial';
    url = `http://localhost:3131/likes/posts/${4}?loggedUsername=${loggedUserName}?loggedPassword=${loggedPassword}`;

    let liking = {
        loggedUsername: loggedUsername,
        loggedPassword: loggedPassword
    }

    const {
        data
    } = await axios.post(url, liking);

    console.log('This is liking post', data);
}

//function to clear screen
const clearScreen = async () => {
    container = getContainer()
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }
}


// retrieving the feed sub-containers
const getPostsContainer = () => document.querySelector('#postsContainer')
const getPicturesContainer = () => document.querySelector('#picturesContainer')

//This function create the cards on the create that will hold the axios information
const creatingCardPost = async (el) => {
    const postsContainer = getPostsContainer()

    //creating the elements that will hold the information on the pokemon
    const userContainer = creatingElem('div');
    const likeContainer = creatingElem('div');
    const finalContainer = creatingElem('div');

    userContainer.className = 'userName';
    likeContainer.className = 'likeContainer';
    finalContainer.className = 'finalContainer';

// creating tags to hold the information
    let posterUsername = creatingElem('p');
    let commentDiv = creatingElem('div');
    let body = creatingElem('div');
    let times_liked = creatingElem('div');

    body.className = el.post_id;
    commentDiv.className = 'commentDiv';
    commentDiv.innerText = 'Comments'

    //assigning the innerText fore the posts
    posterUsername.innerText = `This post by: ${el.poster_username}`
    body.innerText = `Text: ${el.body}`
    times_liked.innerText = `Liked: ${el.times_liked} times`;
    times_liked.className = 'timesLiked';

    //then appends the newly created elements to the UserContainer  
    userContainer.append(posterUsername);
    likeContainer.append(commentDiv, times_liked);

    finalContainer.append(userContainer, body, likeContainer)
    //appending thd UserContainer that holds the created elements to the container
    postsContainer.append(finalContainer);
}
//creating cards for pictures
const creatingCardPic = async (el) => {
    const picturesContainer = getPicturesContainer()

    const userContainer = creatingElem('div');
    const likeContainer = creatingElem('div');
    const finalContainer = creatingElem('div');
    

    let ownerUsername = creatingElem('p');
    let commentDiv = creatingElem('div');
    let pic = creatingElem('img');
    pic.className = el.post_id;

    let times_liked = creatingElem('div');
     times_liked.innerText = `Liked: ${el.times_liked} times`;
    times_liked.className = 'timesLiked';
    ownerUsername.innerText = el.owner_username

    userContainer.className = 'userName';
    likeContainer.className = 'likeContainer';
    finalContainer.className = 'finalContainer';
    commentDiv.className = 'commentDiv';
    commentDiv.innerText = 'Comments';

    //assigning the innerText for the pictures
    pic.src = el.picture_link;

    userContainer.append(ownerUsername);
    likeContainer.append(commentDiv,times_liked)

    finalContainer.append(ownerUsername,pic,likeContainer)

    //appending thd subContainer that holds the created elements to the container
    picturesContainer.append(finalContainer)
}

//this function creates elements
function creatingElem(elem) {
    return document.createElement(`${elem}`)
}