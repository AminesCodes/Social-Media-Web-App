const express = require('express');
const router = express.Router();

//pg-promise request
const {
    db
} = require('../../Database/database'); //connected db instance

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
const getAllComments = async (req, res) => {
    try {
        // const requestQuery = `SELECT 
        //     ARRAY_AGG(author_username) AS commenters,
        //     post_id,
        //     picture_id,
        //     ARRAY_AGG(comment) AS all_comments,
        //     body
        //     FROM comments FULL OUTER JOIN posts ON post_id = posts.id
        //     FULL OUTER JOIN pictures on picture_id = pictures.id
        //     WHERE comments.id IS NOT NULL
        //     GROUP BY post_id, picture_id, body
        //     ORDER BY comment_date DESC
        // `

        const requestQuery = `
            SELECT
                author_username AS who_commented,
                owner_username AS picture_owner,
                poster_username AS post_owner,
                post_id,
                picture_id,
                picture_link,
                ARRAY_AGG(comment) AS all_comments,
                ARRAY_AGG(comments.id) AS all_comments_ids,
                body
            FROM comments FULL OUTER JOIN posts ON post_id = posts.id
            FULL OUTER JOIN pictures ON picture_id = pictures.id
            FULL OUTER JOIN albums ON album_id = albums.id
            WHERE comments.id IS NOT NULL
            GROUP BY post_id, picture_id, body, author_username, owner_username, poster_username, picture_link
        `
        let allComments = await db.any(requestQuery)
        res.json({
            body: allComments,
            message: 'Successfully retrieved all comments'
        })
    } catch (error) {
        res.json({
            message: 'Something went wrong'
        })
    }
}
router.get('/', getAllComments)

const getAllCommentsByUsername = async (req, res) => {
    const username = req.params.username;
    try {
//         const requestQuery = `SELECT comments.id AS comment_id,
//  owner_username, 
//  album_id,
//   picture_link,
//    author_username,
//     picture_id,
//      comment,
//       body, 
//       poster_username,
//       post_id 
//       FROM albums JOIN pictures ON albums.id = album_id 
//       FULL OUTER JOIN comments ON pictures.id = picture_id 
//       FULL OUTER JOIN posts ON post_id = posts.id 
//       WHERE author_username = $1 AND comment IS NOT NULL 
//       ORDER BY comment_date DESC
// `
        const requestQuery = `
            SELECT
                author_username AS who_commented,
                owner_username AS picture_owner,
                poster_username AS post_owner,
                post_id,
                picture_id,
                picture_link,
                ARRAY_AGG(comment) AS all_comments,
                ARRAY_AGG(comments.id) AS all_comments_ids,
                body
            FROM comments FULL OUTER JOIN posts ON post_id = posts.id
            FULL OUTER JOIN pictures ON picture_id = pictures.id
            FULL OUTER JOIN albums ON album_id = albums.id
            WHERE author_username = $1 AND comments.id IS NOT NULL
            GROUP BY post_id, picture_id, body, author_username, owner_username, poster_username, picture_link
        `
        let allComments = await db.any(requestQuery, username)
        res.json({
            body: allComments,
            message: 'Successfully retrieved all comments'
        })
    } catch (error) {
        res.json({
            message: 'Something went wrong'
        })
    }
}
router.get('/:username', getAllCommentsByUsername)

// route to get comments from comments from a particular post

const getCommentsById = async (req, res) => {
    let postID = req.params.post_id

    try {
        let commentsOnPosts = await db.any(`SELECT poster_username, body, author_username, comment FROM comments JOIN posts ON post_id = posts.id WHERE posts.id = $1`, [postID])
        res.json({
            body: commentsOnPosts,
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
const getPicsById = async (req, res) => {

    let pictureId = req.params.picture_id
    try {
        let commentsOnPics = await db.any(`SELECT author_username, owner_username, picture_link, comment FROM comments JOIN pictures ON picture_id = pictures.id JOIN albums ON album_id = albums.id WHERE pictures.id = $1`, pictureId)
        res.json({
            body: commentsOnPics,
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
const addCommentsOnPosts = async (req, res) => {
    let postId = req.params.post_id
    try {
        let insertQuery = `INSERT INTO comments
            (author_username, post_id, comment)
             VALUES($1, $2, $3)`
        await db.none(insertQuery, [req.loggedUsername, postId, req.body.comment])
        const data = {
            poster_username: req.loggedUsername,
            comment: request.body.comment
        }
        res.json({
            body: data,
            status: 'success',
            message: 'POST request successfully arrived at comments/posts'
        })

    } catch (error) {
        console.log(err)
        res.json({
            status: 'failed',
            message: 'Something went wrong'
        })
    }
}
router.post('/posts/:post_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, addCommentsOnPosts)





// route to add a comment to a picture
const addCommentsOnPics = async (req, res) => {
    let pictureId = req.params.picture_id
    try {
        let insertQuery = `INSERT INTO comments
            (author_username, picture_id, comment)
             VALUES($1, $2, $3)`
        await db.none(insertQuery, [req.loggedUsername, pictureId, req.body.comment])
        const data = {
            poster_username: req.loggedUsername,
            comment: req.body.comment
        }
        res.json({
            body: data,
            status: 'success',
            message: 'POST request successfully arrived at comments/pictures'
        })

    } catch (error) {
        console.log(error)
        res.json({
            status: 'failed',
            message: 'Something went wrong!!!'
        })
    }

}
router.post('/pictures/:picture_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, addCommentsOnPics)

//middleware to check for deleted comment on post
const postChangePermission = async (req, res, next) => {
    try {
        let postId = req.params.post_id
        let commentId = req.params.comment_id
        const requestQuery = `SELECT * FROM comments WHERE post_id = $1 AND id = $2 AND author_username = $3`
        const targetComment = await db.one(requestQuery, [postId, commentId, req.loggedUsername])
        req.targetComment = targetComment;
        next()
    } catch (err) {
        res.json({
            status: 'failed',
            message: 'Something went wrong OR comment does not belonge to logged user'
        })
    }
}

//route to update a comment in a post.
const updateCommentsOnPosts = async (req, res) => {
    try {
        let updateQuery = `UPDATE comments
                            SET comment = $1
                            WHERE id = $2`
        await db.any(updateQuery, [req.body.comment, req.targetComment.id])
        req.targetComment.comment = req.body.comment
        res.json({
            body: req.targetComment,
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
router.patch('/posts/:post_id/:comment_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, postChangePermission, updateCommentsOnPosts)

//middleware to check if comment was deleted from picture
const pictureChangePermission = async (req, res, next) => {
    try {
        let pictureId = req.params.picture_id
        let commentId = req.params.comment_id
        const requestQuery = `SELECT * FROM comments WHERE picture_id = $1 AND id = $2 AND author_username = $3`
        const targetComment = await db.one(requestQuery, [pictureId, commentId, req.loggedUsername])
        req.targetComment = targetComment;
        next()
    } catch (err) {
        res.json({
            status: 'failed',
            message: 'Something went wrong OR comment does not belonge to logged user'
        })
    }
}

// Route to update comment on a picture
const updateCommentsOnPics = async (req, res) => {
    try {
        let updateQuery = `UPDATE comments
                            SET comment = $1
                            WHERE id = $2`

        await db.any(updateQuery, [req.body.comment, req.targetComment.id])
        delete req.targetComment.comment;
        req.targetComment.comment = req.body.comment
        res.json({
            body: req.targetComment,
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
router.patch('/pictures/:picture_id/:comment_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, pictureChangePermission, updateCommentsOnPics)


// route to delete a comment from a post
const deleteCommentOnPosts = async (req, res) => {
    let commentID = req.targetComment.id
    let deleteQuery = `DELETE FROM comments WHERE id = $1`
    try {
        await db.none(deleteQuery, commentID)
        res.json({
            status: 'success',
            body: req.targetComment,
            message: 'The comment was successfully deleted from the post'
        })

    } catch (error) {
        res.json({
            status: 'failed',
            message: 'The comment failed to be deleted'
        })
    }
}
router.put('/posts/:post_id/:comment_id/delete', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, postChangePermission, deleteCommentOnPosts)


//route to delete a comment from a picture
const deleteCommentOnPics = async (req, res) => {
    let commentID = req.targetComment.id
    let deleteQuery = `DELETE FROM comments WHERE id = $1`
    try {
        await db.none(deleteQuery, commentID)
        res.json({
            status: 'success',
            body: req.targetComment,
            message: 'The comment was successfully deleted from the picture'
        })

    } catch (error) {
        res.json({
            status: 'failed',
            message: 'The comment failed to be deleted'
        })
    }
}
router.put('/pictures/:picture_id/:comment_id/delete', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, pictureChangePermission, deleteCommentOnPics)

module.exports = router;
