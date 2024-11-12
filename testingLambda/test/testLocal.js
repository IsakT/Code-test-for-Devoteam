import { expect } from 'chai'
import { handler, calculatePosition, calculateDirection, calculateMove, validateGrid, validateCommands } from '../index.js'
import { describe, it } from 'mocha'

describe('unit testing', function () {
  it('calculate direction after given a direction command', function () {
    expect(calculateDirection('N', 'L')).to.equal('W')
    expect(calculateDirection('N', 'R')).to.equal('E')
    expect(calculateDirection('E', 'L')).to.equal('N')
    expect(calculateDirection('E', 'R')).to.equal('S')
    expect(calculateDirection('S', 'L')).to.equal('E')
    expect(calculateDirection('S', 'R')).to.equal('W')
    expect(calculateDirection('W', 'L')).to.equal('S')
    expect(calculateDirection('W', 'R')).to.equal('N')
  })
  it('calculateMove', function () { 
    let position = {x: 5, y: 7}
    let direction = 'N'
    let command = 'F'
    let newPosition = calculateMove(position, direction, command)

    expect(newPosition).to.deep.equal({x: 5, y: 6})

    position = { x: 5, y: 7 }
    direction = 'E'
    newPosition = calculateMove(position, direction, command)

    expect(newPosition).to.deep.equal({ x: 6, y: 7 })

    position = { x: 5, y: 7 }
    direction = 'S'
    newPosition = calculateMove(position, direction, command)

    expect(newPosition).to.deep.equal({ x: 5, y: 8 })

    position = { x: 5, y: 7 }
    direction = 'W'
    newPosition = calculateMove(position, direction, command)

    expect(newPosition).to.deep.equal({ x: 4, y: 7 })
  })
  it('validateGrid', function () {
    expect(validateGrid({x: 0, y: 4})).to.deep.equal({ x: 0, y: 4 })
    expect(validateGrid({x: 100, y: 4})).to.deep.equal({ x: 100, y: 4 })
    expect(validateGrid({x: 1e10, y: 4})).to.deep.equal({ x: 10000000000, y: 4 })
    expect(validateGrid({x: Number.MAX_SAFE_INTEGER,y:  4})).to.deep.equal({ x: Number.MAX_SAFE_INTEGER, y: 4 })
    expect(validateGrid({x: '1', y: '4e3'})).to.deep.equal({ x: 1, y: 4000 })
    expect(validateGrid({x: '1', y: '4'})).to.deep.equal({ x: 1, y: 4 })
    
    // sad paths :(
    expect(validateGrid({x: Infinity, y: 4})).to.equal(false)
    expect(validateGrid({x: -1, y: 4})).to.equal(false)
    expect(validateGrid({x: 1.4,y:  4.6})).to.equal(false)
    expect(validateGrid({x: true, y: 4})).to.equal(false)
    expect(validateGrid({x: ['1'], y: 4})).to.equal(false)
    expect(validateGrid({x: ['1', '2'], y: 4})).to.equal(false)
    expect(validateGrid({x: 1, y: {foo: 'bar'}})).to.equal(false)
    expect(validateGrid({x: 1, y: null})).to.equal(false)
    expect(validateGrid({x: 1, y: undefined})).to.equal(false)
    expect(validateGrid({x: '1', y: 'true'})).to.equal(false)
  })

  it('validateCommands', function () {
    let commands = 'LRFFRRFLFFFFRFFFFRFFFFFFFRR'
    expect(validateCommands(commands)).to.deep.equal(commands.split(''))

    commands = 'LRFFRRFLFFFFRFFFFRFFFFFFFRR'.split('')
    expect(validateCommands(commands)).to.equal(commands)

    commands = ''
    expect(validateCommands(commands)).to.deep.equal([])

    commands = '32467efufdsk'
    expect(validateCommands(commands)).to.equal(false)

    commands = ['LRFFRRFLFFFFRFFFFRFFFFFFFRR']
    expect(validateCommands(commands)).to.equal(false)

    commands = true
    expect(validateCommands(commands)).to.equal(false)

    commands = 12345
    expect(validateCommands(commands)).to.equal(false)
  })

})

describe('integration test', function () {
  it('output the correct final position of the robot given all inputs', async function () {
    let grid = { x: 5, y: 7 }
    let startingPos = { x: 3, y: 3, dir: 'E' }
    let commands = 'LRFFRRFLFFFFRFFFFRFFFFFFFRR'
    let result = calculatePosition(grid, startingPos, commands)

    expect(result).to.deep.equal({
      currentPosition: { x: 0, y: 0},
      currentDirection: 'S',
      errors: []
    })

    grid = JSON.stringify({ x: 5, y: 7 })
    startingPos = JSON.stringify({ x: 3, y: 3, dir: 'E' })
    commands = 'LRFFRR FLFFFFRFF FFRFFF FFFFRR'
    result = calculatePosition(grid, startingPos, commands)

    expect(result).to.deep.equal({
      currentPosition: { x: 0, y: 0 },
      currentDirection: 'S',
      errors: []
    })

    grid = JSON.stringify({ x: "5", y: "7" })
    startingPos = JSON.stringify({ x: "3", y: "3", dir: 'E' })
    commands = 'LRFFRRFLFFFFRFFFFRFFFFFFFRR'.split('')
    result = calculatePosition(grid, startingPos, commands)

    expect(result).to.deep.equal({
      currentPosition: { x: 0, y: 0 },
      currentDirection: 'S',
      errors: []
    })

    grid = undefined
    startingPos = undefined
    commands = undefined
    result = calculatePosition(grid, startingPos, commands)

    expect(result.errors[0].code).to.equal(5)

    result = await handler(exampleEventAWSApiGateWay())
    expect(result.statusCode).to.equal(200)

    result = await handler(JSON.stringify(exampleEventAWSApiGateWay()))
    expect(result.statusCode).to.equal(200)

  }),
  it('handle an out-of-bounds situation', function () {
    const grid = { x: 5, y: 7 }
    const startingPos = { x: 3, y: 3, dir: 'E' }
    const commands = 'FFFFFFFFFFFFFFFFF'
    const { currentPosition , currentDirection, errors} = calculatePosition(grid, startingPos, commands)

    expect(currentPosition).to.deep.equal({x: 5, y: 3})
    expect(currentDirection).to.equal('E')
    expect(errors[0].code).to.equal(2)
    expect(errors.length).to.equal(15)
  }),
  it('handle bad commands', function () {
    const grid = { x: 5, y: 7 }
    const startingPos = { x: 3, y: 3, dir: 'E' }
    const commands = 'LRFfdsklfn4386oofdsl'
    const { currentPosition, currentDirection, errors } = calculatePosition(grid, startingPos, commands)

    expect(currentPosition).to.deep.equal({ x: undefined, y: undefined })
    expect(currentDirection).to.equal(undefined)
    expect(errors[0].code).to.equal(1)
    expect(errors.length).to.equal(1)
  })
})

function exampleEventAWSApiGateWay() { 
  return {
      resource: '/CalculatePosition',
      path: '/CalculatePosition',
      httpMethod: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        Host: 'mpzc95tozb.execute-api.eu-west-1.amazonaws.com',
        'User-Agent': 'curl/8.7.1',
        'X-Amzn-Trace-Id': 'Root=1-67326e1a-5c98ecf9221110796c860de8',
        'x-api-key': '',
        'X-Forwarded-For': '155.4.131.253',
        'X-Forwarded-Port': '443',
        'X-Forwarded-Proto': 'https'
      },
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {
        resourceId: 'naqdgx',
        resourcePath: '/CalculatePosition',
        operationName: 'PostCalculatePosition',
        httpMethod: 'POST',
        extendedRequestId: 'BGYkPFwnDoEEAiA=',
        requestTime: '11/Nov/2024:20:50:34 +0000',
        path: '/default/CalculatePosition',
        accountId: '590183965667',
        protocol: 'HTTP/1.1',
        stage: 'default',
        domainPrefix: 'mpzc95tozb',
        requestTimeEpoch: 1731358234795,
        requestId: 'eeca7a17-5eb9-4702-affc-15606506c2a6',
        identity: [Object],
        domainName: 'mpzc95tozb.execute-api.eu-west-1.amazonaws.com',
        deploymentId: 'lpf6jk',
        apiId: 'mpzc95tozb'
      },
      body: '{"grid": {"x": "5", "y": "7"}, "position": {"x": "3", "y": "3", "dir": "E"}, "commands": "FFRFFLR"}',
      isBase64Encoded: false
  }
}