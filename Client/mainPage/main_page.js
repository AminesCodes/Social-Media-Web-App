let url;

document.addEventListener('DOMContentLoaded', () => {
    loadTimesLikedData()
})

// this function loads the trending(times a post is liked) likes from the database
const loadTimesLikedData = async () => {
    url = `http://localhost:3131/likes/posts/times_liked`
    const {
        data
    } = await axios.get(url);

    console.log(data);

    data.body.forEach(el => {
        creatingCard(el)
    });

    return data
}



// retrieving the container to display the feed
const getContainer = () => document.querySelector('#container')

//This function create the cards on the create that will hold the axios information
const creatingCard = async (el) => {
    container = getContainer()

    //creating the elements that will hold the information on the pokemon
    const subContainer = creatingElem('div')
    subContainer.className = 'likes'
    const pic = creatingElem('img')
    let posterUsername = document.createElement('p')
    const body = document.createElement('p')
    const times_liked = document.createElement('p')

    posterUsername = `The post by: ${el.poster_username}`
    body.innerText = `Text: ${el.body}`
    times_liked.innerText = `Was liked: ${el.times_liked} times`

    //Check if the data returned is a post or not (by checking of post id exits)
    //then appends the newly created elements to the subContainer  
    el.post_id ? subContainer.append(posterUsername, body, times_liked) : subContainer.append(times_liked)
    //appending thd subContainer that holds the created elements to the container
    container.appendChild(subContainer)
}
//this function creates elements
function creatingElem(elem) {
    return document.createElement(`${elem}`)
}