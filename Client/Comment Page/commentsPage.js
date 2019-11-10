let loggedUsername = sessionStorage.getItem('loggedUsername');
let loggedPassword = sessionStorage.getItem('loggedPassword');
let targetUser = sessionStorage.getItem('targetUser');

document.addEventListener('DOMContentLoaded', () => {

    //Divs for the comments page
   let  mainDiv = document.querySelector('.main-container')
   let postsDiv = document.querySelector('#postsContainer')
   let picturesDiv = document.querySelector('#picturesContainer')
   let tableOfContentDiv = document.querySelector('#tableOfcontent')
   
    // get all comments button eventlistener
   let getAllCommentsBtn = document.querySelector('#get-all-comments')
   getAllCommentsBtn.addEventListener('click', () => {
    
    })

})

const loadAllComments = async() => {
    let baseUrl = 'http://localhosts:3131/comments'
    try {
        await axios.get(baseUrl)
        .then(response)

    } catch {

    }

}


