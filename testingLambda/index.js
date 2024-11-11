export const handler = async (event) => {
  const { grid, position, commands } = parseApiCallEvent(event)
  const results = calculatePosition(grid, position, commands)
  
  
  const statusCode = results.errors.length === 0 ? 200 : 400
  return {
    statusCode,
    body: JSON.stringify(results)
  }
}

function parseApiCallEvent(event) {
  if (typeof event === 'string') {
    event = JSON.parse(event)
  }
  if (event?.body) {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  } else if (event?.grid){
    return typeof event === 'string' ? JSON.parse(event) : event
  }
  throw('Error: parseApiCallEvent failed. Expected grid, position and commands, but found: ' + JSON.stringify(event))
}

function composeError(error, { grid, position, direction, commands }) {
  const errors = {
    'ebadcom': {
      code: 1, message:
        'EBADCOM: Bad command. Robot\'s position unchanged. /n' +
        `Expected commands: L, R, F. Found: ${String(commands)}`
    },
    'eoutbounds': {
      code: 2, message:
        'EOUTBOUNDS: Out of bounds. The robot was or tried to be positioned beyond its grid dimensions. /' +
        `Expected position to be within grid: x ${grid?.x}, y ${grid?.y}. Found: x ${position?.x} y ${position?.y}`
    },
    'ebadpos': {
      code: 3, message:
        'EBADPOS: Faulty position or direction of robot. /' +
        `Expected position to be within grid: x ${grid?.x}, y ${grid?.y}. Found: x ${position?.x} y ${position?.y}`
    },
    'ebadgrid': {
      code: 4, message:
        'EBADGRID: Expected grid dimensions to be positive integers.'
    },
    'ebadparams': {
      code: 5, message:
        'EBADPARAMS: one or more parameters were found to be undefined or falsy.'
    }

  }

  return { ...errors[error], context: { grid, position, direction, commands } }
}

function validDirections() { 
  return ['N', 'E', 'S', 'W']
}

function validCommands() { 
  return [
    ...validPivots(),
    ...validMovements()
  ]
}

function validPivots() {
  return ['L', 'R']
}

function validMovements() { 
  return ['F']
}

function inputParsing(gridSize, position, commandsInput) {
  if (!gridSize || !position || !commandsInput) {
    return { errors: [composeError('ebadparams', { grid: gridSize, position, direction: position?.dir, commandsInput })] }
  }

  const errors = []
  const grid = validateGrid(gridSize)
  const initialPosition = validatePosition(position)
  const commands = validateCommands(commandsInput)

  // valid grid
  if (!grid) {
    errors.push(
      composeError('ebadgrid', { grid: gridSize, position, direction: position?.dir, commandsInput }))
  }

  // valid current position relative to grid
  if (!initialPosition || !initialPosition.dir || checkOutOfBounds(grid, initialPosition)) {
    errors.push(
      composeError('ebadpos', { grid: gridSize, position, direction: position?.dir, commandsInput })
    )
  }

  // valid commands and direction
  if (!commands) {
    errors.push(
      composeError('ebadcom', { grid: gridSize, position, direction: position?.dir, commandsInput })
    )
  }

  return {grid, initialPosition, commands, errors}
}

function calculatePosition(gridSize, initPos, commandsInput) {
  const { grid, initialPosition, commands, errors } = inputParsing(gridSize, initPos, commandsInput)
  
  if (errors.length > 0) {
    return {
      // set position to undefined to signal robot not to move from whatever position it was in.
      currentPosition: { x: undefined, y: undefined }, 
      currentDirection: undefined,
      errors
    }
  }

  // iterate over commands and execute them
  const results = commands.reduce((acc, command) => {
    if (validPivots().includes(command)) {
      acc.currentDirection = calculateDirection(acc.currentDirection, command)
    }
    
    if (validMovements().includes(command)) {
      const suggestedMove = calculateMove(acc.currentPosition, acc.currentDirection, command)
      const outofbounds = checkOutOfBounds(grid, suggestedMove)
      if (outofbounds) {
        const error = composeError('eoutbounds', { grid, position: suggestedMove, direction: acc.currentDirection, commands })
        acc.errors.push(error)
        return acc
      }
      acc.currentPosition = suggestedMove
    }

    return acc
  }, {
    currentPosition: initialPosition,
    currentDirection: initialPosition.dir,
    errors: []
  })

  return results
}

function calculateDirection(currentDir, commandDir) {
  if (!['L', 'R'].includes(commandDir)) return currentDir

  switch (commandDir) {
    case 'L':
      if (currentDir === 'N') return 'W'
      if (currentDir === 'E') return 'N'
      if (currentDir === 'S') return 'E'
      if (currentDir === 'W') return 'S'
      break
    case 'R':
      if (currentDir === 'N') return 'E'
      if (currentDir === 'E') return 'S'
      if (currentDir === 'S') return 'W'
      if (currentDir === 'W') return 'N'
  }
}

function calculateMove({ x, y }, direction, command) {
  switch (`${direction}-${command}`) {
    case 'N-F': return { x, y: y - 1 }
    case 'S-F': return { x, y: y + 1 }
    case 'W-F': return { x: x - 1, y }
    case 'E-F': return { x: x + 1, y }
  }
}

function checkOutOfBounds(grid, position) {
  if (position.x < 0 || position.x > grid.x) return true
  if (position.y < 0 || position.y > grid.y) return true
  return false
}

function validateCommands(commandsInput) {
  const doValidate = (commands) => {
    const badCommandsFound = commands.some((command) => {
      return !validCommands().includes(command)
    })

    return badCommandsFound ? false : commands
  }

  // handle commandsInput being a string
  if (typeof commandsInput === 'string') {
    const commands = commandsInput.replaceAll(' ', '').split('')
    return doValidate(commands)
  }

  // handle commandsInput being an array
  if (Array.isArray(commandsInput) && commandsInput.length > 0){
    return doValidate(commandsInput)
  }

  // guilty until proven otherwise
  return false
}

function validatePosition(pos) { 
  let parsedInput = pos
  if (typeof pos === 'string') {
    parsedInput = JSON.parse(pos)
  }

  const parsed = validateCoordinates(parsedInput?.x, parsedInput?.y)
  if (parsed) {
    return { x: parsed.x, y: parsed.y, dir: validateDirection(parsedInput.dir) }  
  }
  return false
}

function validateDirection(direction) {
  return validDirections().includes(direction) ? direction : false
}

function validateGrid(grid) {
  let parsedGrid = grid
  if (typeof grid === 'string') {
    parsedGrid = JSON.parse(grid)
   }
  return validateCoordinates(parsedGrid?.x, parsedGrid?.y)
}

function validateCoordinates(x, y) {
  if (typeof x !== 'number' && typeof x !== 'string') return false
  if (typeof y !== 'number' && typeof y !== 'string') return false

  const parsedX = Number(x)
  const parsedY = Number(y)

  return Number.isInteger(parsedX) && parsedX >= 0 && Number.isInteger(parsedY) && parsedY >= 0 ? { x: parsedX, y: parsedY } : false

}

// not needed in AWS Lambda
export { calculatePosition, calculateDirection, calculateMove, validateGrid, validateCommands }