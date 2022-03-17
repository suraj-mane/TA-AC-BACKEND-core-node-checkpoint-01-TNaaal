let http = require("http");
let url = require("url");
let fs = require("fs");
let qs = require('querystring');

var userPath = __dirname + '/contacts/';


let server = http.createServer(handel);

function handel(req,res){
  let parsedUrl = url.parse(req.url);
  let store = '';
  
  req.on('data', (chunk) => {
    store += chunk;
  });
  console.log(store);
  console.log(parsedUrl.pathname);
  req.on('end', () => {
    if(req.method === "GET" && parsedUrl.pathname === "/"){
     res.setHeader('content-type', 'text/html');
     fs.createReadStream('./index.html').pipe(res);
    } else if(req.method === "GET" && parsedUrl.pathname === "/about"){
      res.setHeader('content-type', 'text/html');
      fs.createReadStream('./about.html').pipe(res); 
    } else if(req.method === "GET" && parsedUrl.pathname === "/contact"){
      res.setHeader('content-type', 'text/html');
      fs.createReadStream('./contact.html').pipe(res);
    } else if(req.method === "POST" && parsedUrl.pathname === "/form"){
      var parsedData = qs.parse(store);
      var pdata = JSON.stringify(parsedData);
      var username = parsedData.username;
      fs.open(userPath + username + '.json', 'wx', (err, fd) => {
      if(err) console.log('username already exists');
      fs.writeFile(fd, pdata,(err) => {
        if(err) return console.log(err);
        fs.close(fd, () => {
          res.setHeader('content-type', 'text/html');
          res.end(`<h5>${username}</5> user created.`);
        })
      })  
      })
    } else if(req.url.split(".").pop() === "css"){
      res.setHeader('content-type', 'text/css');
      fs.createReadStream('./' + req.url).pipe(res);
    } else if(parsedUrl.pathname.split(".").pop() === "png"){
      res.setHeader('content-type', 'image'/`${parsedUrl.pathname.split(".").pop() === "png"}`);
      fs.createReadStream('./' + req.url).pipe(res);
    } else if(req.method === "GET" && parsedUrl.pathname === "/users"){
      var user = parsedUrl.query.split("=")[1];
      res.setHeader('content-type', 'text/json');
      fs.createReadStream('./contacts/' + user + '.json').pipe(res);
    } else if (req.method === 'GET' && parsedUrl.pathname === '/users/all') {
      fs.readdir(userPath, (err, files) => {
        let fileLength = files.length - 1;
        if (err) res.end(`File could not load: ${err}`);
        files.forEach((file, index) => {
          fs.readFile(userPath + file, (err, user) => {
            if (err) return res.end(err);
            let data = qs.parse(user.toString());
            res.write(`<h1>Name: ${data.name}</h1>`);
            res.write(`<h2>Email: ${data.email}</h2>`);
            res.write(`<h2>UserName: ${data.username}</h2>`);
            res.write(`<h2>Age: ${data.age}</h2>`);
            res.write(`<h2>Bio: ${data.bio}</h2>`);
            if (fileLength === index) {
              res.end();
            }
          });
        });
      })
    }    
  })
  
}
server.listen(5000, () => {
  console.log('server is start');
});