let url;

document.addEventListener('DOMContentLoaded', () => {
    loadPostsTimesLikedData();
    loadPictureTimesLikedData()

    let feedForm = document.querySelector('#feedForm');
    let postDiv = document.querySelector('#postsContainer')
    let picDiv = document.querySelector('#picturesContainer').style.display = 'none'

    feedForm.addEventListener('submit', (event) => {
        event.preventDefault()
        postDiv.style.display = 'none';
        picDiv.style.display = 'true'
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
    const postSubContainer = creatingElem('div');
    postSubContainer.className = 'likes';
    let posterUsername = creatingElem('p');
    let body = creatingElem('p');
    let times_liked = creatingElem('p');

    //assigning the innerText fore the posts
    posterUsername.innerText = `This post by: ${el.poster_username}`
    body.innerText = `Text: ${el.body}`
    times_liked.innerText = `Liked: ${el.times_liked} times`;

    //then appends the newly created elements to the subContainer  
    postSubContainer.append(posterUsername, body, times_liked);

    //appending thd subContainer that holds the created elements to the container
    postsContainer.append(postSubContainer);
}
//creating cards for pictures
const creatingCardPic = async (el) => {
    const picturesContainer = getPicturesContainer()

    const picSubContainer = creatingElem('div');
    picSubContainer.className = 'likes';
    
    let pic = creatingElem('img');
    
    //assigning the innerText for the pictures
    pic.src = el.picture_link;

    //then appends the newly created elements to the subContainer  
    picSubContainer.append(pic)
    //appending thd subContainer that holds the created elements to the container
    picturesContainer.append(picSubContainer)
}

//this function creates elements
function creatingElem(elem) {
    return document.createElement(`${elem}`)
}