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
}

const evenListenerOnPost = () => {
    let finalContainer = document.querySelector('#postsContainer');
    let likingPost = document.querySelector('.finalContainer')
    // console.log(likingPost);
    finalContainer.addEventListener('click', async (event) => {
        if (event.target.className === 'timesLiked') {
            console.log(likingPost.id);

            let response = await likeAPost(likingPost.id)
            console.log(response.message);
            if (response.message === 'post already liked') {
                deleteLike(likingPost.id);
            }
        }
        if (event.target.className === 'commentDiv') {
            console.log('hello');

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
    finalContainer.id = el.post_id

    // creating tags to hold the information
    let posterUsername = creatingElem('p');
    let commentDiv = creatingElem('div');
    let body = creatingElem('div');
    let times_liked = creatingElem('div');

    body.className = 'postBody';
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
    ownerUsername.innerText = el.owner_username

    //assigning class names to 
    userContainer.className = 'userName';
    likeContainer.className = 'likeContainer';
    finalContainer.className = 'finalContainer';
    commentDiv.className = 'commentDiv';
    times_liked.className = 'timesLiked';
    commentDiv.innerText = 'Comments';

    //assigning the innerText for the pictures
    pic.src = el.picture_link;

    userContainer.append(ownerUsername);
    likeContainer.append(commentDiv, times_liked)

    finalContainer.append(ownerUsername, pic, likeContainer)

    //appending thd subContainer that holds the created elements to the container
    picturesContainer.append(finalContainer)
}

//this function creates elements
function creatingElem(elem) {
    return document.createElement(`${elem}`)
}