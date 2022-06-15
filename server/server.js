const fs = require('fs');
const Path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000;
const musicPath = Path.join(__dirname, 'static', 'mp3');
const albumsPath = Path.join(__dirname, 'static', 'mp3', 'albums');
const uploadPath = Path.join(__dirname, 'static', 'mp3', 'upload');
const util = require('util');
const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const dataStore = require('nedb');
const formidable = require('formidable');

const favorites = new dataStore({
  filename: 'favorites',
  autoload: true,
});

const getAlbums = async () => {
  let listOfAlbums = [];
  const foldersOfAlbums = await readDir(albumsPath);
  for (let albumName of foldersOfAlbums) {
    const cover = `albums/${albumName}/cover.jpg`;
    const album = {
      title: albumName,
      cover,
    };
    listOfAlbums.push(album);
  }

  const foldersOfUpload = await readDir(uploadPath);
  for (let albumName of foldersOfUpload) {
    let coverName = 'cover.jpg';
    const uploadAlbumFiles = await readDir(Path.join(uploadPath, albumName));
    for (const file of uploadAlbumFiles) {
      if (Path.extname(file) === '.jpg' || Path.extname(file) === '.png') {
        coverName = file;
      }
    }
    const cover = `upload/${albumName}/${coverName}`;
    const album = {
      title: albumName,
      cover,
    };
    listOfAlbums.push(album);
  }

  return JSON.stringify(listOfAlbums);
};

const getAlbumSongList = async (albumTitle) => {
  let playList = [];

  const albumPath = fs.existsSync(Path.join(albumsPath, albumTitle)) ? Path.join(albumsPath, albumTitle) : Path.join(uploadPath, albumTitle);
  const albumFiles = await readDir(albumPath);
  for (let file of albumFiles) {
    const fileExtension = Path.extname(file);
    const filePath = Path.join(albumPath, file);
    const fileSize = fs.statSync(filePath).size;
    if (fileExtension === '.mp3') {
      playList.push({ id: `${albumTitle}${file}${fileSize}`, album: albumTitle, title: file, size: fileSize });
    }
  }
  return JSON.stringify(playList);
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
  console.log(req.method, req.url);
  if (req.method === 'GET') {
    const splitUrl = req.url.split('/');
    const lastone = splitUrl[splitUrl.length - 1];
    const extension = Path.extname(lastone);

    if (extension === '.jpg' || extension === '.png') {
      const mimeType = extension === '.jpg' ? 'jpeg' : 'png';
      const imagePath = decodeURIComponent(Path.join(musicPath, req.url));

      res.writeHead(200, { 'Content-Type': `image/${mimeType}` });
      res.write(await readFile(imagePath));
      res.end();
      return;
    } else if (extension === '.mp3') {
      const songPath = fs.existsSync(decodeURIComponent(Path.join(albumsPath, req.url))) ? decodeURIComponent(Path.join(albumsPath, req.url)) : decodeURIComponent(Path.join(uploadPath, req.url));
      const songSize = fs.statSync(songPath).size;
      res.writeHead(200, {
        'Content-Type': `audio/mpeg`,
        'Content-Length': songSize,
        'Accept-Ranges': 'bytes',
      });
      res.write(await readFile(songPath));
      res.end();
    } else if (req.url === '/albums') {
      const data = await getAlbums();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(data);
      res.end();
      return;
    } else if (req.url === '/favorites') {
      favorites.find({}, (err, docs) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(docs));
        res.end();
        return;
      });
    } else if (req.url === '/admin') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(await readFile(Path.join(__dirname, 'static', 'html', 'admin.html')));
      res.end();
      return;
    } else if (req.url === '/image/mp3' || req.url === '/image/wav') {
      imagePath = Path.join(__dirname, 'static', 'images', 'mp3.png');
      res.writeHead(200, { 'Content-Type': `image/png` });
      res.write(await readFile(imagePath));
      res.end();
      return;
    } else if (req.url === '/image/jpg' || req.url === '/image/jpeg' || req.url === '/image/png') {
      imagePath = Path.join(__dirname, 'static', 'images', 'jpg.png');
      res.writeHead(200, { 'Content-Type': `image/png` });
      res.write(await readFile(imagePath));
      res.end();
      return;
    }
  } else if (req.method === 'POST') {
    if (req.url === '/songs') {
      let requireData = '';
      req.on('data', (chunk) => {
        requireData += chunk;
      });

      req.on('end', async () => {
        const currentAlbum = JSON.parse(requireData).title;
        const songs = await getAlbumSongList(currentAlbum);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(songs);
        res.end();
        return;
      });
    } else if (req.url === '/addToFavorites') {
      let requireData = '';
      req.on('data', (chunk) => {
        requireData += chunk;
      });

      req.on('end', async () => {
        const song = JSON.parse(requireData);
        console.log(song);
        favorites.insert(song);
        res.writeHead(200);
        res.end();
      });
    } else if (req.url === '/removeFromFavorites') {
      let requireData = '';
      req.on('data', (chunk) => {
        requireData += chunk;
      });

      req.on('end', async () => {
        const song = JSON.parse(requireData);

        favorites.remove(song, { multi: true }, function(err, numRemoved) {
          console.log('usunięto dokumentów: ', numRemoved);
          res.writeHead(200);
          res.end();
        });
      });
    } else if (req.url === '/sendFiles') {
      const formData = formidable({ multiples: true });
      const data = Date.now().toString();
      let id = `${data} - `;
      for (let i = 0; i < 4; i++) {
        const randomNumber = Math.floor(Math.random() * (10 - 1)) + 1;
        id = `${id}${randomNumber}`;
      }
      formData.uploadDir = Path.join(__dirname, 'static', 'mp3', 'Upload', id);
      fs.mkdirSync(Path.join(__dirname, 'static', 'mp3', 'Upload', id));

      let names = [];
      let extensions = [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      formData
        .on('fileBegin', (_field, file) => {
          const tempFilePath = file.path.split('\\');
          tempFilePath[tempFilePath.length - 1] = file.name;
          file.path = tempFilePath.join('\\');
          names.push(file.name);
          extensions.push(file.name.split('.')[file.name.split('.').length - 1]);
        })
        .parse(req, () => {
          if (!extensions.includes('jpg')) {
            fs.copyFileSync(Path.join(musicPath, 'default-cover.jpg'), Path.join(__dirname, 'static', 'mp3', 'Upload', id, 'cover.jpg'));
          }
          res.write(JSON.stringify(names));
          res.end();
        });

      return;
    }
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
});

server.listen(PORT, () => console.log('serwer startuje na porcie 3000'));
