/**
 * Important note: this application is not suitable for benchmarks!
 */

var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , io = require('../')
  , sys = require('sys')
  , server;
    
server = http.createServer(function(req, res){
  // your normal server code
  var path = url.parse(req.url).pathname;
  switch (path){
    case '/':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
      res.end();
      break;
      
    case '/json.js':
    case '/jquery.js':
    case '/chat1.html':
    case '/chat.html':
      fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
      break;
      
    default: send404(res);
  }
}),

send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};

server.listen(8080);
var publisher  = require('redis').createClient();
var redis = require('redis');
var redisclient = redis.createClient();
redisclient.set('connected', 1, redis.print);
var io = io.listen(server);
io.on('connection', function(client){
       console.log(process.memoryUsage());
       client.on('subscribe', function(pattern) {
               client.subscribe(pattern);
       });
       client.on('publish', function(pattern, message) {
               publisher.publish(pattern, JSON.stringify(message));
       });
       client.on('unsubscribe', function(pattern) {
               if(pattern) {
                       client.unsubscribe(pattern);
               } else {
                       client.unsubscribe();
               }
       });
			 client.on('disconnect', function(){   
              redisclient.decr('connected', function(e, c) {
								sys.puts("Number still connected: " + c.toString());
          			var msg = 'Number still connected: ' + c.toString();
								publisher.publish('*', JSON.stringify(msg));
              })
			client.quitGracefully();
			 });  

      redisclient.incr('connected', function(e, c) {
        sys.puts("Number connected: "+c.toString());
				var msg = 'Number connected: ' + c.toString();
				publisher.publish('*', JSON.stringify(msg));
      });
});
