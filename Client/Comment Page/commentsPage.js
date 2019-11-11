let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');

document.addEventListener('DOMContentLoaded', () => {
    //getAllComments()
    //Divs for the comments page
    let mainDiv = document.querySelector('.main-container')
    
    let tableOfContentDiv = document.querySelector('#tableOfcontent')

    // get all comments button eventlistener
    let getAllCommentsBtn = document.querySelector('#get-all-comments')
    getAllCommentsBtn.addEventListener('click', () => {
        getAllComments('jenama')

    })

    //The form listening in for a submit event
    let form = document.querySelector('form')
    form.style.display = 'none'
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        
        
        if (form.className === 'updateComment') {
            // update comment function
        } else if (form.className === 'addComment') {
            // Add comment function
        } else if (form.className === 'deleteComment') {
            // Delete comment function
        }
        addComment()
    })
    let newComment = document.querySelector('textarea')
    
    const feedDiv = document.querySelector('#feed');
    feedDiv.addEventListener('click', event => {
        if (event.target.parentNode.className === 'comment') {
            form.className = 'deleteComment'
            form.style.display = 'block'
            // X was clicked => delete comment
        } 
        if (event.target.className === 'comment') {
            form.className = 'updateComment'
            form.style.display = 'block'

            newComment.value = event.target.innerText
            // Comment was clicked => update comment
        }

        if (event.target.className === 'post' || event.target.className === 'picture') {
            form.className = 'addComment'
            form.style.display = 'block'

            // ADD COMMENT
        }
    })

}) /////////////////////////////////////////////

// function to get all the comments from the database
const getAllComments = async (username) => {

    let baseUrl = 'http://localhost:3131'

    try {
        let response = await axios.get(`${baseUrl}/comments/${username}`)
        //console.log('username', username)
         
        displayAllComments(response.data.body)
    
        //    return response.data.body

    } catch (error) {
        return error
    }
}

// function to display all the comments
const displayAllComments = (comments) => {
    console.log('comments', comments)
   
    let feed = document.querySelector('#feed')
    
    let posts = document.querySelector('#postsContainer') // this divs holds comments on posts
    
    let pictures = document.querySelector('#picturesContainer') // holds comments on pictures
    

    for (let i = 0; i < comments.length; i++) {
        let postId = comments[i].post_id
        let pictureId = comments[i].picture_id
        console.log('picture id', pictureId)

        let comment = document.createElement('div')
        comment.className = 'comment'
        comment.id = comments[i].comment_id
        let authorUsername = document.createElement('div')
        
        if (comments[i].body) {

            let posterUsername = document.createElement('div')
            posterUsername.innerText = comments[i].poster_username

            let post = document.createElement('div')
            post.id = comments[i].post_id
            post.className = 'post'
            post.innerText = comments[i].body
            
            authorUsername.innerText = comments[i].author_username
            
            comment.innerText = comments[i].comment
            
            posts.append(posterUsername, post, authorUsername)
            
            
        } else if (comments[i].picture_link) {
            
            
            let ownerUsername = document.createElement('div')
            ownerUsername.innerText = comments[i].owner_username
            
            let picture = document.createElement('img')
            picture.id = comments[i].picture_id
            picture.className = 'picture'
            picture.style.width = '200px'
            picture.src = comments[i].picture_link
            
            authorUsername.innerText = comments[i].author_username
            
            comment.innerText = comments[i].comment
            console.log('picture comment', comment.innerText)
            
            pictures.append(ownerUsername, picture, authorUsername)
            
        }
        let deleteDiv = document.createElement('div')
        deleteDiv.innerText = 'X'
        comment.appendChild(deleteDiv)

        authorUsername.appendChild(comment)
         addCommentOnPosts(postId)
    }
    
}

const addCommentOnPosts = async() => {
    let baseUrl = 'http://localhost:3131'
     //let endpoint1 = 
     
    try {
        let response = await axios.post(`${baseUrl}`)

    } catch {

    }
    
}

const checkEndPoints = () => {
    
}