const express = require('express');
const router = express.Router();

//pg-promise request
const {db} = require('../../Database/database'); //connected db instance

// This route is to find all the comments made on posts and pictures.
router.get('/', async(req, res) => {
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
})

// route to get comments from comments from a particular post
router.get('/posts/:post_id', async(req, res) => {
    let comments = req.param.comment
    try {
        let commentsOnPosts = await db.any('SELECT author_username, post_id, comment FROM comments ')
        console.log('comments on the posts', commentsOnPosts)
        res.json({
            payload: commentsOnPosts, 
            message: 'Successfully gathered all comments on posts'
        })
    } catch (error) {
        res.json({
            message: 'There was an error!'
        })
    }
})

// This is the route to get comments on particular pictures.
router.get('/pictures/:picture_id', async(req, res) => {
    try { 
        let commentsOnPics = await db.any('SELECT author_username, picture_id, comment FROM comments')
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
})

// route to add a comment to a post
router.post('/posts/:post_id', async(req, res) => {
    
    try{
        let insertQuery = `INSERT INTO comments
            (author_username, post_id, comment)
             VALUES($1, $2, $3)`
         await db.any(insertQuery, [req.body.author_username, req.body.post_id, req.body.comment])
        res.json({
            payload: req.body, 
            status: 'success',
            message: 'POST request successfully arrived at comments/posts'
        })  

    }catch (error) {
        res.json({
            status: 'failed',
            message: 'Something went wrong'
        })
    }
})


// route to add a comment to a picture
router.post('/pictures/:picture_id', async (req, res) => {

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
}) 



//route to update a comment in a post.
router.patch('/posts/:post_id:', async(req, res) => {
    try {
        let updateQuery = `UPDATE comments
                            SET comment = $3 post_id = $2
                            WHERE author_username = $1`
        await db.any(updateQuery, [req.body.author_username, req.body.post_id, req.body.comment])
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

}) 




module.exports = router;