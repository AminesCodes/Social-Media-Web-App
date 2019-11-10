const express = require('express');
const router = express.Router();

//pg-promise request
const {db} = require('../../Database/database'); //connected db instance

// CHECK AUTHENTICATION REQUEST BODY
const checkValidAuthenticationBody = (request, response, next) => {
    const username = request.body.loggedUsername;
    const password = request.body.loggedPassword;

    if (!username || !password) {
        response.status(400); // BAD REQUEST
        response.json({
            status: 'failed',
            message: 'Missing authentication information'
        });
    } else {
        // Implements the body data to the request:
        request.loggedUsername = username.toLowerCase();
        request.loggedPassword = password;
        next();
    }
}

// CHECK IF A USER IS IN DATABASE
const checkIfUsernameExists = async (request, response, next) => {
    try {
        const user = await db.one('SELECT * FROM users WHERE username = $1', [request.loggedUsername]);
        request.userExists = true; // Validates that the user exists
        request.targetUser = user; // Implement the target user to the request
        next();
    } catch (err) {
        if (err.received === 0) { // SQL QUERY was expecting one row but didn't receive any one
            request.userExists = false;
            next();
        } else {
            response.status(500) // Internal Server Error
            console.log(err)
            response.json({
                status: 'failed',
                message: 'Something went wrong!'
            });
        }
    }
}

// AUTHENTICATION
const authenticateUser = (request, response, next) => {
    if (request.userExists) {
        if (request.targetUser.username === request.loggedUsername &&
            request.targetUser.user_password === request.loggedPassword) {
            next()
        } else {
            response.status(401) // Unauthorized
            response.json({
                status: 'failed',
                message: 'Not authorized to accomplish the request'
            })
        }
    } else {
        response.status(404)
        response.json({
            status: 'failed',
            message: 'User Does not exist'
        })
    }
}

// This route is to find all the comments made on posts and pictures.
const getAllComments = async(req, res) => {
     try {
         let allComments = await db.any('SELECT * FROM comments')
         res.json({
             payload: allComments,
             message: 'Successfully retrieved all comments'
         })
     } catch (error) {
         res.json({
             message: 'Something went wrong'
         })
     }
}
router.get('/', getAllComments)

// route to get comments from comments from a particular post

const getCommentsById = async(req, res) => {
     let postID = req.params.post_id
       
    try {
       let commentsOnPosts = await db.any(`SELECT poster_username, body, author_username, comment FROM comments JOIN posts ON post_id = posts.id WHERE posts.id = $1`, [postID])
        res.json({
            payload: commentsOnPosts, 
            status: 'success',
            message: 'Successfully gathered all comments on posts'
        })
    } catch (error) {
        res.json({
            message: 'There was an error!'
        })
    }
}
 

router.get('/posts/:post_id', getCommentsById)


// This is the route to get comments on particular pictures.
const getPicsById = async(req, res) => {
    
    let pictureId = req.params.picture_id
    console.log(pictureId)
    try {
        let commentsOnPics = await db.any(`SELECT author_username, owner_username, picture_link, comment FROM comments JOIN pictures ON picture_id = pictures.id JOIN albums ON album_id = albums.id WHERE pictures.id = $1`, pictureId )
        res.json({
            payload: commentsOnPics,
            status: 'success',
            message: 'Successfully retrieved all comments from pictures'
        })
    } catch (error) {
        res.json({
            status: 'failed',
            message: 'There was an error!'
        })
    }

}
router.get('/pictures/:picture_id', getPicsById)
  

// route to add a comment to a post
const addCommentsOnPosts = async(req, res) => {
    try {
        let insertQuery = `INSERT INTO comments
            (author_username, post_id, comment)
             VALUES($1, $2, $3)`
        await db.any(insertQuery, [req.body.author_username, req.body.post_id, req.body.comment])
        res.json({
            payload: req.body,
            status: 'success',
            message: 'POST request successfully arrived at comments/posts'
        })

    } catch (error) {
        res.json({
            status: 'failed',
            message: 'Something went wrong'
        })
    }
}
router.post('/posts/:post_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, addCommentsOnPosts)
    
    



// route to add a comment to a picture
const addCommentsOnPics = async(req, res) => {
      try {
          let insertQuery = `INSERT INTO comments
            (author_username, picture_id, comment)
             VALUES($1, $2, $3)`
          await db.any(insertQuery, [req.body.author_username, req.body.picture_id, req.body.comment])
          res.json({
              payload: req.body,
              status: 'success',
              message: 'POST request successfully arrived at comments/pictures'
          })

      } catch (error) {
          res.json({
              status: 'failed',
              message: 'Something went wrong'
          })
      }

}
router.post('/pictures/:picture_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, addCommentsOnPics)

   //route to update a comment in a post.
const updateCommentsOnPosts = async(req, res) => {
    try {
        let updateQuery = `UPDATE comments
                            SET comment_id = $2 post_id = $3
                            WHERE author_username = $1`
        await db.any(updateQuery, [req.body.author_username, req.body.post_id, req.body.comment_id])
        res.json({
            payload: req.body,
            status: 'success',
            message: 'Successfully updated comment'
        })
    } catch (error) {
        res.json({
            status: 'failed',
            message: 'Something went wrong'
        })
    }
}
router.patch('/posts/:post_id/:comment_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, updateCommentsOnPosts)
  


// Route to update comment on a picture
const updateCommentsOnPics = async(req, res) => {
     try {
         let updateQuery = `UPDATE comments
                            SET comment = comment.id post_id = posts.id
                            WHERE author_username = $1`
         await db.any(updateQuery, [req.body.author_username, req.body.picture_id, req.body.comment])
         res.json({
             payload: req.body,
             status: 'success',
             message: 'Successfully updated comment'
         })
     } catch (error) {
         res.json({
             status: 'failed',
             message: 'Something went wrong'
         })
     }
}
router.patch('/pictures/:picture_id:', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, updateCommentsOnPics)
    

// route to delete a comment from a post
const deleteCommentOnPosts = async(req, res) => {
       let postId = req.params.post_id
       let commentId = req.params.comment_id

       let deleteQuery = `DELETE FROM comments WHERE post_id = $1 AND author_username = $2`
    try {
        await db.none(deleteQuery, [postId, commentId])
        res.json({
            status: 'success',
            message: 'The comment was successfully deleted from the post'
        })

    } catch (error) {
        res.json({
            status: 'failed',
            message: 'The comment failed to be deleted'
        })
    }
}
router.put('/posts/:post_id/:comment_id/delete', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, deleteCommentOnPosts)
 
   
//route to delete a comment from a picture
const deleteCommentOnPics = async(req, res) => {
    let pictureId = req.params.picture_id
    commentId = req.params.comment_id
    console.log('picture id', pictureId)
    console.log('comment id', commentId)
    let deleteQuery = `DELETE FROM comments WHERE picture_id = $1 AND author_username = $2`
    try {
        await db.none(deleteQuery, [pictureId])
        res.json({
            status: 'success',
            message: 'The comment was successfully deleted from the picture'
        })

    } catch (error) {
        res.json({
            status: 'failed',
            message: 'The comment failed to be deleted'
        })
    }
}
router.put('/pictures/:picture_id/:comment_id/delete', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, deleteCommentOnPics)
  


module.exports = router;