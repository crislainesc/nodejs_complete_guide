const fs = require('fs')

function requestHandler(req, res) {
  const url = req.url
  const method = req.method
  res.setHeader('Content-Type', 'text/html')

  if (url === '/') {
    res.write(`
    <html>
     <body>
        <h1>Some greeting text</h1>
        <h1>Add User</h1>
        <form method="post" action="/create-user">
          <input type="text" name="username"/>
        </form>
        <a href="/create-user">Register</button>
        <a href="/users">View users</a>
      </body>
    </html>`)
    return res.end()
  }

  if (url === '/users') {
    const users = fs.readFileSync('./users.txt')

    users
      .toString()
      .split('\n')
      .map((userName, userNumber) => {
        res.write(`
          <ul>
            <li>${userName} ${userNumber + 1}</li>
          </ul>
        `)
      })

    return res.end()
  }

  if (url === '/create-user' && method === 'POST') {
    const body = []
    req.on('data', (chunk) => body.push(chunk))

    req.on('end', async () => {
      const cachedUsers = fs.readFileSync('./users.txt')

      const parsedBody = Buffer.concat(body).toString()
      const [, username] = parsedBody.split('=')
      await fs.writeFileSync(
        'users.txt',
        cachedUsers.toString().concat(username + '\n'),
        (err) => {
          res.statusCode = 302
        }
      )
      res.statusCode = 200
      res.setHeader('Location', '/')
      res.end()
    })
  }
}

exports.requestHandler = requestHandler
