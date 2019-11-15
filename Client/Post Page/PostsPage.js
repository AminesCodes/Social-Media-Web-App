let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');

const baseURL = 'http://localhost:3131';

// FUNCTION TO DO document.querySelector()
const grab = (tag) => document.querySelector(`#${tag}`);


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
    // const tableOfContents = document.querySelector('#tableOfContents');

    // tableOfContents.addEventListener('click', (event) => {
    //     if (event.target.nodeName === 'A') {
    //         sessionStorage.removeItem("targetUser");
    //     }
    // })

    // HEADERS
    const h1Header = grab('username');
    const h3Header = document.querySelector('h3');

    // FORMS
    const newPostForm = document.querySelector('form');

    // TEXTAREA INPUTS
    const newPostInput = grab('newPostInput');

    // DIV s
    const allPostsDiv = grab('allPostsDiv');
    const feedbackDiv = grab('feedbackDiv');

    // FEEDBACK PARAGRAPH
    const feedbackText = grab('feedbackText');


    // HIDING RESPONSIVE DIV s AND ADD POSTS FORM
    feedbackDiv.style.display = 'none';
    newPostForm.style.display = 'none';
    h3Header.style.display = 'none';


    const loggedUserTag = document.querySelector('#loggedUser');
    if (!loggedUsername) {
        logoutBtn.innerText = 'Home';
        loggedUserTag.innerText = targetUser;
    } else if (loggedUsername) {
        let userInfo = await getInfoAboutUser(loggedUsername, feedbackDiv, feedbackText);
        loggedUserTag.innerText = `${userInfo.body.firstname} ${userInfo.body.lastname}`;
    }


    // FEEDBACK DIV CLOSE BUTTON
    const closeBtn = document.querySelector('#closeBtn');

    closeBtn.addEventListener('click', (event) => {
        feedbackDiv.style.display = 'none';
        feedbackText.innerText = '';
    })
    document.addEventListener('keydown', (event) => {
        if (event.code === "Escape") {
            feedbackDiv.style.display = 'none';
            feedbackText.innerText = '';
        }
    })


    //DISPLAYING THE OWNER OF THE POSTS
    if (!targetUser && loggedUsername) {
        h1Header.innerText = loggedUsername + ' Posts';
    }
    if (targetUser) {
        h1Header.innerText = targetUser + ' Posts';
    }


    if (targetUser) {
        loadAllPostsOfUser(targetUser, allPostsDiv, feedbackDiv, feedbackText)
    } else if (loggedUsername) {
        loadAllPostsOfUser(loggedUsername, allPostsDiv, feedbackDiv, feedbackText)
        h3Header.style.display = 'block';
        newPostForm.style.display = 'block';
    }


    allPostsDiv.addEventListener('click', (event) => {
        // CLICK ON THE DELETE DIV
        if (event.target.className === 'deleteDiv') {
            // delete post, need post id 1, send div as well to remove it from the dom
            const postDiv = event.target.parentNode;
            const postID = postDiv.id.slice(5)
            deletePostRequest(postDiv, postID)
        }
        //CLICK ON THE POST IT SELF
        if (event.target.className === 'postBody') {
            newPostForm.className = event.target.id;
            newPostInput.value = event.target.innerText
        }
    })


    newPostForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        let postBody = newPostInput.value;

        if (postBody) {
            if (newPostForm.className) {
                const postID = newPostForm.className.slice(7);
                const postDiv = grab(newPostForm.className)
                const response = await updatePostRequest(postID, postBody);
                if (response.status === 'success') {
                    newPostForm.className = null;
                    postDiv.innerText = response.body.body
                }
            } else {
                addPostRequest(postBody, allPostsDiv, feedbackDiv, feedbackText)
            }
            newPostInput.value = '';
        }
    })

}) /////////////////////////////////////////////////////////


const loadAllPostsOfUser = async (user, containerDiv, feedbackDiv, feedbackText) => {
    try {
        const response = await axios.get(`${baseURL}/posts/${user}`)
        await fillOutPostsDiv(user, response.data, containerDiv);
    } catch (err) {
        console.log(err)
        feedbackDiv.style.display = 'block';
        if (err.response.data.message) {
            feedbackText.innerText = err.response.data.message;
        } else {
            feedbackText.innerText = err;
        }
    }
}

// FILL OUT THE POSTS CONTAINER WITH ALL POSTS BELONGING TO THE USER
const fillOutPostsDiv = async (user, data, containerDiv) => {
    containerDiv.innerText = '';

    const postsData = data.body;

    if (postsData) {
        for (let post of postsData) {
            const postContainerDiv = document.createElement('div');
            postContainerDiv.className = 'PostDiv';
            postContainerDiv.id = `post_${post.post_id}`;
            containerDiv.appendChild(postContainerDiv);

            const postOwnerDiv = document.createElement('div');
            postOwnerDiv.className = 'username';
            postOwnerDiv.innerText = post.poster_username;

            const postingDateDiv = document.createElement('div');
            postingDateDiv.className = 'date';
            postingDateDiv.innerText = post.posting_date;

            const postTextDiv = document.createElement('div');
            postTextDiv.className = 'postBody';
            postTextDiv.id = `postID_${post.post_id}`
            postTextDiv.innerText = post.body;

            const likesDiv = document.createElement('div');
            likesDiv.className = 'like'
            likesDiv.innerText = `👍${post.total_likes}`;

            postContainerDiv.append(postOwnerDiv, postingDateDiv, postTextDiv, likesDiv)

            if (user === loggedUsername) {
                const deleteDiv = document.createElement('div');
                deleteDiv.className = 'deleteDiv'
                deleteDiv.innerText = `X`;
                postContainerDiv.appendChild(deleteDiv)
            }

            const allCommentsByPost = await axios.get(`${baseURL}/comments/posts/${post.post_id}`)
            const allComments = allCommentsByPost.data.body;

            if (allComments.length) {
                for (let comment of allComments) {
                    const commentDiv = document.createElement('div');
                    commentDiv.classList = 'commentDiv';
                    postContainerDiv.appendChild(commentDiv);

                    const commenterDiv = document.createElement('div');
                    commenterDiv.className = 'username';
                    commenterDiv.innerText = comment.author_username;

                    const commentTextDiv = document.createElement('div');
                    commentTextDiv.className = 'comment';
                    commentTextDiv.innerText = comment.comment;

                    postContainerDiv.append(commenterDiv, commentTextDiv)
                }
            }
        }
    } else {
        containerDiv.innerText = `No posts for ${user}`;
    }
}


// DELETE POST REQUEST
const deletePostRequest = async (postDiv, postID) => {
    if (loggedUsername) {
        try {
            const loggedUser = {
                loggedUsername: loggedUsername,
                loggedPassword: loggedPassword
            }
            const response = await axios.put(`${baseURL}/posts/${postID}/delete`, loggedUser)
            if (response.data.status === 'success') {
                postDiv.parentNode.removeChild(postDiv);
            }
        } catch (err) {
            console.log(err)
            feedbackDiv.style.display = 'block';
            if (err.response.data.message) {
                feedbackText.innerText = err.response.data.message;
            } else {
                feedbackText.innerText = err;
            }
        }
    }
}

// UPDATE POST REQUEST
const updatePostRequest = async (postID, postText) => {
    if (loggedUsername) {
        try {
            const data = {
                loggedUsername: loggedUsername,
                loggedPassword: loggedPassword,
                body: postText
            }
            const response = await axios.patch(`${baseURL}/posts/${postID}`, data)
            return response.data
        } catch (err) {
            console.log(err)
            feedbackDiv.style.display = 'block';
            if (err.response.data.message) {
                feedbackText.innerText = err.response.data.message;
            } else {
                feedbackText.innerText = err;
            }
        }
    }
    return null;
}

// POST A NEW POST 
const addPostRequest = async (text, container) => {
    try {
        const data = {
            loggedUsername: loggedUsername,
            loggedPassword: loggedPassword,
            body: text
        }
        await axios.post(`${baseURL}/posts`, data)
        await loadAllPostsOfUser(loggedUsername, container, feedbackDiv, feedbackText)
    } catch (err) {
        console.log(err)
        feedbackDiv.style.display = 'block';
        if (err.response.data.message) {
            feedbackText.innerText = err.response.data.message;
        } else {
            feedbackText.innerText = err;
        }
    }
}

const getInfoAboutUser = async (loggedUsername, feedbackDiv, feedbackText) => {
    try {
        const url = `${baseURL}/users/${loggedUsername}`;
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        feedbackDiv.style.display = 'block';
        if (err.response.data.message) {
            feedbackText.innerText = err.response.data.message;
        } else {
            feedbackText.innerText = err;
        }
    }
}