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
    const picsFromAlbum = await db.any(requestQuery, [req.albumId])
    res.json({
      status: 'success',
      message: `retrieved pictures from album with ID ${req.albumId}`,
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
    await db.none(insertQuery, [req.targetAlbum.albumId, req.pictureLink])
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
    await db.none(deleteQuery, [req.targetPicture.id])
  } catch (err) {
    res.status(500)
    res.send({
      status: 'failed',
      message: 'Something went wrong'
    })
  }
}

//routes

router.get('/:albumId', getPicturesByAlbum)
router.post('/:albumId', postPicture)
router.delete('/:pictureId', deletePicture)

module.exports = router;
