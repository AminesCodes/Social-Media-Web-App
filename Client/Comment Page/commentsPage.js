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

    let posts = document.querySelector('#postsContainer') // this divs holds comments on posts
    let pictures = document.querySelector('#picturesContainer') // holds comments on pictures

    posts.style.display = 'none'
    const toggleBtn = document.querySelector('#toggle')
    toggleBtn.addEventListener('click', () => {
        if (toggleBtn.innerText === 'Posts') {
            posts.style.display = 'block'
            pictures.style.display = 'none'
            toggleBtn.innerText = 'Pictures'
        } else if (toggleBtn.innerText === 'Pictures') {
            posts.style.display = 'none'
            pictures.style.display = 'block'
            toggleBtn.innerText = 'Posts'
        }
    })
    //getAllComments()
    //Divs for the comments page
    let addDiv = document.querySelector('#add-div')

    let tableOfContentDiv = document.querySelector('#tableOfcontent')
    
    if (targetUser) {
        getAllComments(targetUser)
    } else {
        getAllComments(loggedUsername)
    }
    // get all comments button eventlistener

    let newComment = document.querySelector('textarea')

    //The form listening in for a submit event
    let form = document.querySelector('form')
    // form.style.display = 'none'
    addDiv.style.display = 'none'
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const commentText = newComment.value

        if (commentText) {
            if (form.id === 'updateCommentOnPost') {
                updateComments('posts', form.className, commentText)
                // update comment function
            } else if (form.id === 'addCommentOnPost') {
                addComment('posts', form.className, commentText)
                // Add comment function
            } else if (form.id === 'updateCommentOnPicture') {
                updateComments('pictures', form.className, commentText)
                // update comment function
            } else if (form.id === 'addCommentOnPicture') {
                addComment('pictures', form.className, commentText)
                // Add comment function
            }
        }


    })

    const feedDiv = document.querySelector('#feed');
    feedDiv.addEventListener('click', event => {

        if (event.target.parentNode.parentNode.className === 'post' && event.target.innerText === 'X') {
            form.id = `deleteCommentOnPost`
            // to review
            let postID = event.target.parentNode.parentNode.firstChild.id
            // form.className = `{post_id: ${postID}, comment_id: ${event.target.className}}`
            deleteComment('posts', `{"target_id": ${postID}, "comment_id": ${event.target.className}}`)
        } else if (event.target.parentNode.parentNode.className === 'picture' && event.target.innerText === 'X') {
            // to review
            form.id = `deleteCommentOnPicture`
            let pictureID = event.target.parentNode.parentNode.firstChild.id // picture_id
           
            // form.className = `{picture_id: ${pictureID}, comment_id: ${event.target.className}}`
            deleteComment('pictures', `{"target_id": ${pictureID}, "comment_id": ${event.target.className}}`)
        }

        if (event.target.parentNode.parentNode.className === 'post' && event.target.innerText !== 'X') {
            form.id = `updateCommentOnPost`
            let postID = event.target.parentNode.parentNode.firstChild.id
            // let text = event.target
         
            form.className = `{"target_id": ${postID}, "comment_id": ${event.target.className}}`
            //form.style.display = 'block'
            addDiv.style.display = 'block'
            newComment.value = event.target.innerText
            //updateComments('post', `{"target_id": ${postId}, "comment_id": ${event.target.className}`)
           
        } else if (event.target.parentNode.parentNode.className === 'picture' && event.target.innerText !== 'X') {
            form.id = `updateCommentOnPicture`
            let pictureID = event.target.parentNode.parentNode.firstChild.id // picture_id
            // to review
            form.className = `{"target_id": ${pictureID},"comment_id": ${event.target.className}}`
            // form.style.display = 'block'
            addDiv.style.display = 'block'
            newComment.value = event.target.innerText
        }

        if (event.target.parentNode.className === 'post') {
            form.className = event.target.className
            form.id = `addCommentOnPost`
            addDiv.style.display = 'block'
            // ADD COMMENT ON POST
        } else if (event.target.parentNode.className === 'picture') {
            form.className = event.target.className
            form.id = `addCommentOnPicture`
            addDiv.style.display = 'block'
            // ADD COMMENT ON PICTURE
        }
    })

}) /////////////////////////////////////////////

// function to get all the comments from the database
const getAllComments = async (username) => {

    let baseUrl = 'http://localhost:3131'

    try {
        let response = await axios.get(`${baseUrl}/comments/${username}`)

        displayAllComments(response.data.body)

    } catch (error) {
        return error
    }
}
////////////////////////////////////////////
// function to display all the comments
const displayAllComments = (comments) => {
    let posts = document.querySelector('#postsContainer') // this divs holds comments on posts
    let pictures = document.querySelector('#picturesContainer') // holds comments on pictures
    posts.innerText = ''
    pictures.innerText = ''

    for (let i = 0; i < comments.length; i++) {
        let container = document.createElement('div')
        let ownerDiv = document.createElement('div')
        container.appendChild(ownerDiv)


        if (comments[i].picture_id) {
            pictures.appendChild(container)
            container.className = 'picture'
            ownerDiv.className = 'picture'
            // to review
            ownerDiv.id = comments[i].picture_id
            ownerDiv.innerText = comments[i].picture_owner

            let image = document.createElement('img');
            image.src = comments[i].picture_link
            image.style.width = '200px'
            image.className = comments[i].picture_id
            container.appendChild(image)

        } else if (comments[i].post_id) {
            posts.appendChild(container)
            container.className = 'post'
            ownerDiv.className = 'post'
            // to review
            ownerDiv.id = comments[i].post_id
            ownerDiv.innerText = comments[i].post_owner

            let postTextDiv = document.createElement('div');
            // to review
            postTextDiv.className = comments[i].post_id
            postTextDiv.innerText = comments[i].body
            container.appendChild(postTextDiv)

        }

        for (let j = 0; j < (comments[i].all_comments).length; j++) {
            let commenterDiv = document.createElement('div');
            commenterDiv.innerText = comments[i].who_commented

            let commentDiv = document.createElement('div')
            let commentTextDiv = document.createElement('div')
            // to review
            commentTextDiv.className = comments[i].all_comments_ids[j]
            commentTextDiv.innerText = comments[i].all_comments[j]

            let deleteDiv = document.createElement('div')
            deleteDiv.innerText = 'X'
            // to review
            deleteDiv.className = comments[i].all_comments_ids[j]
            commentDiv.append(commenterDiv, commentTextDiv, deleteDiv)
            container.appendChild(commentDiv)
        }
    }
}


//////////////////////////////////////////////////////////

const addComment = async (route, targetId, text) => {
    let baseUrl1 = `http://localhost:3131/comments/${route}/${targetId}`

    let loginInfo = {
        loggedUsername: loggedUsername,
        loggedPassword: loggedPassword,
        comment: text
    };

    try {
        let data = await axios.post(baseUrl1, loginInfo)
        getAllComments(loggedUsername)

    } catch (error) {
        console.log('Bad Request')
    }
}

const updateComments = async (route, targetId, text) => {
    let body = JSON.parse(targetId)


    body.loggedUsername = loggedUsername
    body.loggedPassword = loggedPassword
    body.comment = text
    let baseUrl1 = `http://localhost:3131/comments/${route}/${body.target_id}/${body.comment_id}`
    try {
        let data = await axios.patch(baseUrl1, body)
        getAllComments(loggedUsername)

    } catch (error) {
        console.log('Bad Request')
    }

}

const deleteComment = async (route, targetId) => {
    let body = JSON.parse(targetId)
    body.loggedUsername = loggedUsername
    body.loggedPassword = loggedPassword
    let baseUrl1 = `http://localhost:3131/comments/${route}/${body.target_id}/${body.comment_id}/delete`
    try {
        let data = await axios.put(baseUrl1, body)
        getAllComments(loggedUsername)

    } catch (error) {
        console.log('Bad Request')
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