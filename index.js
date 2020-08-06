const ws = require('ws')
const http = require('http')
const prompt = require('prompt-sync')();

let proxy_url = prompt('URL of proxy server [localhost:3000]: ');
proxy_url = proxy_url || 'localhost:3000'
const client = new ws('ws://' + proxy_url)

let port = prompt('Port # of local server: ')

client.on('message', (data) => {
	let req = JSON.parse(data)
	if ('uuid' in req) {
		console.log('Visit this URL to access your local server:\n' + proxy_url + '/' + req.uuid)
	} else {
		let options = new URL('http://localhost:' + port + req.url)
		let new_req = http.request(options, res => {
			let body = '';
			res.setEncoding('utf8');
			res.on('data', function(chunk) { 
				body += chunk;
			});

			res.on('end', function() {
				let payload = {req_id: req.req_id, headers: res.headers, status: res.statusCode, body}
				client.send(JSON.stringify(payload))
			});
		})
		new_req.method = req.method
		for (let i = 0; i < req.rawHeaders.length; i += 2) {
			new_req.setHeader(req.rawHeaders[i], req.rawHeaders[i+1])
		}
		new_req.write(req.body)
		new_req.end()
	}
})