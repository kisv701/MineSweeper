const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3333;
const ENTRIES_PER_FILE = 300;
let data = {
  xs: [],
  ys: []
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  let input = params(req);
  if(input['board'] && input['target']){
    data.xs.push(input['board']);
    data.ys.push(input['target']);
    if(data.xs.length >= ENTRIES_PER_FILE){
      saveData();
      data.xs = [];
      data.ys = [];
    }

  }
  res.end('GameState collected\n');

  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

var saveData = function(){
  var json = JSON.stringify(data, null, 2);
  fileName = (new Date()).toLocaleString().split(' ').join('_').split(':').join('').split('-').join(''); //Use timestamp as fileName
  fs.writeFile('data/' + fileName + '.json', json, 'utf8', (err)=>{
    console.error(err);
  });
  console.log('Saving: ' + fileName + '.json');
}

var params=function(req){
    let q=req.url.split('?'),result={};
    if(q.length>=2){
        q[1].split('&').forEach((item)=>{
             try {
               result[item.split('=')[0]]=item.split('=')[1];
             } catch (e) {
               result[item.split('=')[0]]='';
             }
        })
    }
    return result;
  }