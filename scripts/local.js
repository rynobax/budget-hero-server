const lambdaFunction = require('../src/lambda.js')
const apiGatewayEvent = require('../api-gateway-event.json')

const server = lambdaFunction.handler(apiGatewayEvent, {
  succeed: v => {
    console.log(v)
    if(v.isBase64Encoded) console.log(Buffer.from(v.body, 'base64').toString())
    process.exit(0)
  }
}, (e, v) => {
  console.error(v)
  process.exit(1)
})

process.stdin.resume()

function exitHandler(options, err) {
    if (options.cleanup && server && server.close ) {
      server.close()
    }

    if (err) console.error(err.stack)
    if (options.exit) process.exit()
}

process.on('exit', exitHandler.bind(null, { cleanup: true }))
process.on('SIGINT', exitHandler.bind(null, { exit: true })) // ctrl+c event
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
