DROP DATABASE IF EXISTS social_media_app_db;

CREATE DATABASE social_media_app_db;

\c social_media_app_db

-- USERS TABLE:
CREATE TABLE users
(
    username VARCHAR PRIMARY KEY,
    firstname VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    dob DATE NOT NULL,
    user_password VARCHAR NOT NULL,
    signing_date DATE NOT NULL DEFAULT CURRENT_DATE
);
-- PostgreSQL uses the  yyyy-mm-dd format (ENTERED AS A STRING!!!)
-- TO REQUEST A DATE : SELECT TO_CHAR(NOW() :: DATE, 'Mon dd, yyyy'); 
-- TO CALCULATE AGE : SELECT AGE(birth_date);

-- POSTS TABLE:
CREATE TABLE posts
(
    id SERIAL PRIMARY KEY,
    poster_username VARCHAR REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
    body VARCHAR NOT NULL,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE
);


-- ALBUMS TABLE:
CREATE TABLE albums
(
    id SERIAL PRIMARY KEY,
    album_name VARCHAR,
    owner_username VARCHAR REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
    album_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- PICTURES TABLE
CREATE TABLE pictures
(
    id SERIAL PRIMARY KEY,
    album_id INT REFERENCES albums (id) ON DELETE CASCADE ON UPDATE CASCADE,
    picture_link VARCHAR NOT NULL,
    picture_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- COMMENTS TABLE:
CREATE TABLE comments
(
    id SERIAL PRIMARY KEY,
    author_username VARCHAR REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
    post_id INT REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
    picture_id INT REFERENCES pictures (id) ON DELETE CASCADE ON UPDATE CASCADE,
    comment TEXT,
    comment_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- LIKES TABLE:
CREATE TABLE likes
(
    id SERIAL PRIMARY KEY,
    liker_username VARCHAR REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
    post_id INT REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
    picture_id INT REFERENCES pictures (id) ON DELETE CASCADE ON UPDATE CASCADE
);


INSERT INTO users
    (username, firstname, lastname, dob, user_password)
VALUES
    ('vonbar', 'Voniel', 'Brown', '1995-08-23', '123'),
    ('aminescodes', 'Amine', 'Bensalem', '1983-06-14', '456'),
    ('sergiocohens', 'Sergio', 'Cohen-Salama', '1987-04-10', '789'),
    ('jenama', 'Johanne', 'Enama', '1991-03-15', '234');


INSERT INTO posts
    (poster_username, body)
VALUES
    ('aminescodes', 'This is my first post :)'),
    ('vonbar', 'I like turtles'),
    ('aminescodes', 'I like this chair !!'),
    ('vonbar', 'this is a post'),
    ('jenama', 'let''s do this'),
    ('jenama', 'posting something'),
    ('sergiocohens', 'save the whales'),
    ('sergiocohens', 'eat pray and love');

-- FOR MERGE CONFLICT, copy the fellowing and paste at the end of the previous version of this file
-- after removing the last line (line 80) (SELECT * FROM users JOIN posts ON username = poster_username;)

INSERT INTO albums
    (album_name, owner_username)
VALUES
    ('Kids', 'jenama'),
    ('Random', 'sergiocohens'),
    ('Manga', 'aminescodes'),
    ('Turtles', 'vonbar'),
    ('Pixar', 'aminescodes');


INSERT INTO pictures
    (album_id, picture_link)
VALUES
    (1, 'https://cdn.tinybuddha.com/wp-content/uploads/2015/10/Having-Fun.png'),
    (1, 'https://image.freepik.com/free-vector/cute-happy-kids-having-fun-cartoons_18591-60558.jpg'),
    (2, 'https://ichef.bbci.co.uk/images/ic/800xn/p07gq3kw.jpg'),
    (2, 'https://www.bensound.com/bensound-img/happyrock.jpg'),
    (3, 'http://www.imfdb.org/images/thumb/6/61/Vampire_knight_poster.jpg/301px-Vampire_knight_poster.jpg'),
    (3, 'http://otakurevolution.com/storyimgs/juukuchi/Escaflowne/vlcsnap-2016-04-09-15h39m02s69.png'),
    (4, 'https://image.shutterstock.com/image-vector/sea-turtle-cartoon-260nw-701671366.jpg'),
    (4, 'https://i.pinimg.com/originals/56/5a/f5/565af5258e27b98b07c31a594b880534.jpg'),
    (5, 'https://www.pop-culture.biz/images17/0737CABF.jpg'),
    (5, 'https://usercontent1.hubstatic.com/14174350.png');


INSERT INTO comments
    (author_username, post_id, comment)
VALUES
    ('sergiocohens', 1, 'Better late then never'),
    ('jenama', 2, 'cute creatures'),
    ('aminescodes', 2, 'yeah, unless they are a ninja one'),
    ('vonbar', 5, 'Go fot it!!'),
    ('vonbar', 8, 'Interesting point of view');


INSERT INTO comments
    (author_username, picture_id, comment)
VALUES
    ('aminescodes', 1, 'Amine Comment on Johanne album1 picture1'),
    ('sergiocohens', 2, 'Sergio Comment on Johanne album1 picture2'),
    ('jenama', 3, 'Johanne Comment Sergio on album1 picture1'),
    ('jenama', 4, 'Johanne Comment Sergio on album1 picture2'),
    ('vonbar', 5, 'VonielComment on Amin album1 picture1'),
    ('sergiocohens', 6, 'Sergio Comment Amin on album1 picture2'),
    ('vonbar', 7, 'Voniel Comment on Voniel album1 picture1'),
    ('jenama', 8, 'Johanne Comment on Voniel album1 picture2'),
    ('vonbar', 9, 'Voniel Comment on Amin album2 picture1'),
    ('sergiocohens', 7, 'Sergio Comment on Voniel album1 picture1');


INSERT INTO likes
    (liker_username, post_id)
VALUES
    ('jenama', 1),
    ('jenama', 2),
    ('jenama', 3),
    ('jenama', 4),
    ('sergiocohens', 2),
    ('sergiocohens', 4),
    ('sergiocohens', 5),
    ('sergiocohens', 6);


INSERT INTO likes
    (liker_username, picture_id)
VALUES
    ('aminescodes', 1),
    ('aminescodes', 2),
    ('aminescodes', 3),
    ('aminescodes', 7),
    ('vonbar', 1),
    ('vonbar', 2),
    ('vonbar', 3),
    ('vonbar', 4);


SELECT * FROM users JOIN posts ON username = poster_username;

