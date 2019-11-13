let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');

document.addEventListener('DOMContentLoaded', () => {
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

    getAllComments('jenama')
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
                updateComment('posts', form.className, commentText)
                // update comment function
            } else if (form.id === 'addCommentOnPost') {
                addComment('posts', form.className, commentText)
                // Add comment function
            } else if (form.id === 'updateCommentOnPicture') {
                updateComment('pictures', form.className, commentText)
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
                let postID = event.target.parentNode.parentNode.firstChild.id
                // form.className = `{post_id: ${postID}, comment_id: ${event.target.className}}`
                    deleteComment('posts', `{"target_id": ${postID}, "comment_id": ${event.target.className}}`)
            } else if (event.target.parentNode.parentNode.className === 'picture' && event.target.innerText === 'X') {
                    form.id = `deleteCommentOnPicture`
                    let pictureID = event.target.parentNode.parentNode.firstChild.id // picture_id
                    // form.className = `{picture_id: ${pictureID}, comment_id: ${event.target.className}}`
                    deleteComment('pictures', `{"target_id": ${pictureID}, "comment_id": ${event.target.className}}`)
                }
                
                if (event.target.parentNode.parentNode.className === 'post' && event.target.innerText !== 'X') {
                    form.id = `updateCommentOnPost`
                    let postID = event.target.parentNode.parentNode.firstChild.id
                    form.className = `{post_id: ${postID}, comment_id: ${event.target.className}}`
                    //form.style.display = 'block'
                    addDiv.style.display = 'block'
                    newComment.value = event.target.innerText
                } else if (event.target.parentNode.parentNode.className === 'picture' && event.target.innerText !== 'X') {
                    form.id = `updateCommentOnPicture`
                    let pictureID = event.target.parentNode.parentNode.firstChild.id // picture_id
                    form.className = `{picture_id: ${pictureID}, comment_id: ${event.target.className}}`
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
    console.log('ALL comments', comments)
    
    let posts = document.querySelector('#postsContainer') // this divs holds comments on posts
    let pictures = document.querySelector('#picturesContainer') // holds comments on pictures
    posts.innerText = ''
    
    for (let i = 0; i < comments.length; i++) {
        let container = document.createElement('div')
        let ownerDiv = document.createElement('div')
        container.appendChild(ownerDiv)
        
        
        if (comments[i].picture_id) {
            pictures.appendChild(container)
            container.className = 'picture'
            ownerDiv.className = 'picture'
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
            ownerDiv.id = comments[i].post_id
            ownerDiv.innerText = comments[i].post_owner
            
            let postTextDiv = document.createElement('div');
            postTextDiv.className = comments[i].post_id
            postTextDiv.innerText = comments[i].body
            container.appendChild(postTextDiv)
            
        }
        
        for (let j = 0; j < (comments[i].all_comments).length; j++) {
            let commenterDiv = document.createElement('div');
            commenterDiv.innerText = comments[i].who_commented

            let commentDiv = document.createElement('div')
            let commentTextDiv = document.createElement('div')
            commentTextDiv.className = comments[i].all_comments_ids[j]
            commentTextDiv.innerText = comments[i].all_comments[j]
            
            let deleteDiv = document.createElement('div')
            deleteDiv.innerText = 'X'
            deleteDiv.className = comments[i].all_comments_ids[j]
            commentDiv.append(commenterDiv, commentTextDiv, deleteDiv)
            container.appendChild(commentDiv)
        } 
    } 
}
    

//////////////////////////////////////////////////////////

const addComment = async(route, targetId, text) => {
    console.log('post id', targetId)
    let baseUrl1 = `http://localhost:3131/comments/${route}/${targetId}`

     let loginInfo = {
         loggedUsername: 'jenama',
         loggedPassword: '234',
         comment: text
     };
     
    try {
        let data = await axios.post(baseUrl1, loginInfo)
        console.log('data', data.data)
        getAllComments('jenama')

    } catch (error) {
        console.log('Bad Request')
    }
}

const updateComments = async (route, targetId, text) => {
    let body = JSON.parse(targetId)
    
}

const deleteComment = async (route, targetId) => {
    let body = JSON.parse(targetId)
    body.loggedUsername = 'jenama'
    body.loggedPassword = '234'
    let baseUrl1 = `http://localhost:3131/comments/${route}/${body.target_id}/${body.comment_id}/delete`
    try {
        let data = await axios.put(baseUrl1, body)
        console.log('data', data.data)
        getAllComments('jenama')

    } catch (error) {
        console.log('Bad Request')
    }
}