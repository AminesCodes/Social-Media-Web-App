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


  let container = document.getElementById('container')

  loadPage()


})

// loads Albums page (by logged or target username)
const loadPage = () => {
  axios.get('http://localhost:3131/albums/')
  .then(response => {
    let create = document.createElement('div')
    container.appendChild(create)
    let list = document.createElement('div')
    list.id = 'list'
    container.appendChild(list)
    for (a of response.data.body) {
      if (a.username === targetUser) {
        createCardAlbum(a)
        getCover(a.id)
    } else if (a.username === loggedUsername) {
        if (document.getElementById('create') === null) {
          create.id = 'create'
          setAlbumForm()
      }
        createCardAlbum(a)
        getCover(a.id)
    }
    }
  })
}

//ALBUMS PAGE FUNCTIONS
// creates Album card
const createCardAlbum = (a) => {
  let card = document.createElement('div')
  card.className = "card"
  card.id = a.id
  let name = document.createElement('p')
  name.innerText = a.album_name
  name.style.fontWeight = 'bold'
  name.style.textAlign = 'center'
  card.appendChild(name)
  card.addEventListener('click', () => clickAlbum(a))
  list.appendChild(card)
}

// sets cover for Album cards
const getCover = (id) => {
  axios.get(`http://localhost:3131/pictures/albums/${id}`)
    .then(response => {
      let link = ''
      if (response.data.body[0] === undefined) {
        link = 'https://i.pinimg.com/236x/fc/7e/ce/fc7ece8e8ee1f5db97577a4622f33975--photo-icon-sad.jpg'
      } else {
        link = response.data.body[0].picture_link
        let id = response.data.body[0].album_id
      }
      let cover = document.createElement('img')
      cover.className = 'cover'
      cover.src = link
      let card = document.getElementById(id)
      card.appendChild(cover)
      addDeleteBtn(id)
    })
}

// adds delete button to Album cards
const addDeleteBtn = (id) => {
  let delAlbumBtn = document.createElement('button')
  delAlbumBtn.innerText = 'Delete Album'
  delAlbumBtn.onclick = () => deleteAlbum(id)
  let card = document.getElementById(id)
  card.appendChild(delAlbumBtn)
}

// deletes Album
const deleteAlbum = (id) => {
  axios.put(`http://localhost:3131/albums/${id}/delete`, { loggedUsername: loggedUsername, loggedPassword: loggedPassword})
  .then(response => {
    location.reload()
  })
}

// sets form for creating Albums
const setAlbumForm = () => {
  let inputAlbumName = document.createElement('input')
  inputAlbumName.setAttribute('type', 'text')
  inputAlbumName.setAttribute('placeholder', 'Album Name')
  inputAlbumName.id = 'albumName'
  create.appendChild(inputAlbumName)
  let createAlbumBtn = document.createElement('button')
  createAlbumBtn.innerText = 'Create Album'
  createAlbumBtn.onclick = () => createAlbum()
  create.appendChild(createAlbumBtn)
  let lineBreak = document.createElement('br')
  create.appendChild(lineBreak)
}

// creates Album
const createAlbum = () => {
  let albumName = document.getElementById('albumName').value
  axios.post('http://localhost:3131/albums/', { albumName: albumName, loggedUsername: loggedUsername, loggedPassword: loggedPassword })
  .then(response => {
    location.reload()
  })
}

// to click on Album cards and its consequences
const clickAlbum = (a) => {
  let list = document.getElementById('list')
  list.innerText = ''
  let title = document.getElementById('title')
  title.innerText = 'Pictures'
  let lineBreak = document.createElement('br')
  title.appendChild(lineBreak)
  if (document.getElementById('create') !== null) {
    let create = document.getElementById('create')
    create.innerText = ''
    setPictureForm()
  }
  showPictures(a.id)
}

// PICTURE FUNCTIONS
// creates Picture card
const createCardPic = async (el, img) => {
  const list = document.getElementById('list')

  const userContainer = document.createElement('div');
  const likeContainer = document.createElement('div');
  const finalContainer = document.createElement('div');

  let comments = await getCommentsPic(el.id)
  let commentDiv = document.createElement('div')
  commentDiv.innerText = 'Comments';
  commentDiv.appendChild(comments)

  let likes = await getLikesPic(el.id)
  let times_liked = document.createElement('div');
  times_liked.innerText = `Liked: ${likes} times`;

  likeContainer.className = 'likeContainer';
  finalContainer.className = 'finalContainer';
  commentDiv.className = 'commentDiv';
  times_liked.className = 'timesLiked';

  img.src = el.picture_link;
  img.id = el.id

  let delPictureBtn = document.createElement('button')
  delPictureBtn.innerText = 'Delete Picture'
  delPictureBtn.onclick = () => delPicture()

  likeContainer.append(times_liked, commentDiv)
  finalContainer.append(img, likeContainer, delPictureBtn)
  list.append(finalContainer)
}

// get likes of a Picture (by ID)
getLikesPic = async (id) => {
  let likesResponse = await axios.get(`http://localhost:3131/likes/pictures/${id}`)
  if (likesResponse.data.message === "Picture doesn't have likes") {
    return 0
  } else {
    return likesResponse.data.body.length
  }
}

// get comments of a Picture (by ID)
getCommentsPic = async (id) => {
  let comments = document.createElement('div')
  let commentsResponse = await axios.get(`http://localhost:3131/comments/pictures/${id}`)
  let body = commentsResponse.data.body
  body.forEach((el) => {
    let p = document.createElement('p')
    p.innerText = el.author_username + ': ' + el.comment
    comments.appendChild(p)
  })
  return (comments)
}

// gets Pictures and sets prev and next Buttons, changes Picture when clicking on them
const showPictures = async (id) => {
  let i = 0
  let go = 1
  let picturesResponse = await axios.get(`http://localhost:3131/pictures/albums/${id}`)
  let length = picturesResponse.data.body.length
  let img = document.createElement('img')
  // let card = document.getElementById(id)
  // card.appendChild(img)
  grab(i, go, picturesResponse, img)
  let prevButton = document.createElement('button')
  prevButton.innerText = 'prev'
  prevButton.id = 'prevBtn'
  prevButton.addEventListener('click', () => {
    go = 1
    i = clickPrev(i)
    grab(i, go, picturesResponse, img)
  })
  title.appendChild(prevButton)
  let nextButton = document.createElement('button')
  nextButton.innerText = 'next'
  nextButton.id = 'nextBtn'
  nextButton.addEventListener('click', () => {
    go = 1
    i = clickNext(i, length)
    grab(i, go, picturesResponse, img)
  })
  title.appendChild(nextButton)
}

// secondary functions for showPictures
const clickNext = (i, length) => {
  if (i < (length - 1)) {
    return i + 1
  } else {
    return i
  }
}

const clickPrev = (i) => {
  if (i > 0) {
    return i - 1
  } else {
    return i
  }
}

const grab = (i, go, response, img) => {
  let list = document.getElementById('list')
  list.innerText = ''
  let length = response.data.body.length
  while (i < length && go === 1) {
  let link = response.data.body[i].picture_link
  let albumId = response.data.body[i].album_id
  img.src = link
  img.className = albumId
  createCardPic(response.data.body[i], img)
  go = 0
  }
}

// deletes Picture from current Album (by ID)
const delPicture = () => {
  let img = document.querySelector('img')
  let pictureId = img.id
  axios.put(`http://localhost:3131/pictures/delete/${pictureId}` , { loggedUsername: loggedUsername, loggedPassword: loggedPassword })
  .then(response => {
    location.reload()
  })
}

// sets form for adding Picture to current Album
const setPictureForm = () => {
  let inputPictureLink = document.createElement('input')
  inputPictureLink.setAttribute('type', 'text')
  inputPictureLink.setAttribute('placeholder', 'Picture Link')
  inputPictureLink.id = 'pictureLink'
  create.appendChild(inputPictureLink)
  let addPictureBtn = document.createElement('button')
  addPictureBtn.innerText = 'Add Picture'
  addPictureBtn.onclick = () => addPicture()
  create.appendChild(addPictureBtn)
  let lineBreak = document.createElement('br')
  let lineBreak2 = document.createElement('br')
  create.appendChild(lineBreak)
  create.appendChild(lineBreak2)
}

// adds a Picture to current Album
const addPicture = () => {
  let img = document.querySelector('img')
  let albumId = img.className
  let pictureLink = document.getElementById('pictureLink').value
  axios.post(`http://localhost:3131/pictures/albums/${albumId}`, { pictureLink: pictureLink, loggedUsername: loggedUsername, loggedPassword: loggedPassword })
  .then(response => {
    location.reload()
  })
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