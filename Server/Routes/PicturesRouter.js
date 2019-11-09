const express = require('express');
const router = express.Router();

//pg-promise request
const {db} = require('../../Database/database'); //connected db instance

//functions
const getPicturesByAlbum = async (req, res) => {
  try {
    const requestQuery = `
      SELECT picture_link, picture_date
      FROM pictures
      WHERE album_id = $1`
    const picsFromAlbum = await db.any(requestQuery, [req.params.albumid])
    res.json({
      status: 'success',
      message: `retrieved pictures from album with ID ${req.params.albumid}`,
      body: picsFromAlbum
    })
  } catch(err) {
    console.log(err)
    res.status(500)
    res.send({
        status: 'failed',
        message: 'Something went wrong'
    })
  }
}

const postPicture = async (req, res) => {
  try {
    const insertQuery = `
      INSERT INTO pictures (album_id, picture_link)
      VALUES $1, $2
    `
    await db.none(insertQuery, [req.params.albumid, req.body.pictureLink])
  } catch (err) {
    console.log(err)
    res.status(500)
    res.send({
      status:'failed',
      message: 'Something went wrong'
    })
  }
}

const deletePicture = async (req, res) => {
  try {
    const deleteQuery = `
      DELETE from pictures WHERE id = $1
    `
    await db.none(deleteQuery, [req.params.pictureid])
  } catch (err) {
    res.status(500)
    res.send({
      status: 'failed',
      message: 'Something went wrong'
    })
  }
}

//routes
router.get('/:albumid', getPicturesByAlbum)
router.post('/:albumid', postPicture)
router.delete('/:pictureid', deletePicture)

module.exports = router;
