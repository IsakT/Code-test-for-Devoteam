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
        `Expected position to be within grid: x ${grid.x}, y ${grid.y}. Found: x ${position.x} y ${position.y}`
    },
    'ebadpos': {
      code: 3, message:
        'EBADPOS: Faulty position of robot. No commands will be executed. /' +
        `Expected position to be within grid: x ${grid.x}, y ${grid.y}. Found: x ${position.x} y ${position.y}`
    },
    'ebadgrid': {
      code: 4, message:
        'EBADGRID: Expected grid dimensions to be positive integers.'
    }
  }

  return { ...errors[error], context: { grid, position, direction, commands } }
}

function validDirections() { 
  return ['N', 'E', 'S', 'W']
}

function calculatePosition({ x, y }, { x: initx, y: inity, dir }, commandsInput) {
  if (!Array.isArray(commandsInput) || commandsInput.length < 1 || typeof commandsInput != 'string') {
    return composeError('ebadcom', { grid: { x, y }, position: { x: initx, y: inity }, commandsInput })
  }
  if (checkOutOfBounds({ x, y }, { x: initx, y: inity }) || !validDirections().includes(dir)) {
    return composeError('ebadpos', { grid: { x, y }, position: { x: initx, y: inity }, direction: dir, commandsInput })
  }

  const grid = validateGrid(x, y)

  if (!grid) {
    return composeError('ebadgrid', { grid: { x, y }, position: { x: initx, y: inity }, direction: dir, commands })
  }
  
  const commands = Array.isArray(commandsInput) ? commandsInput : commandsInput.split('');

  const results = commands.reduce((acc, command) => {
    if (!['F', 'L', 'R'].includes(command)) {
      const error = composeError('ebadcom', { grid, position: acc.currentPosition, direction: acc.currentDirection, commands })
      acc.errors.push(error)
      return acc
    }
    if (['L', 'R'].includes(command)) {
      acc.currentDirection = calculateDirection(acc.currentDirection, command)
    } else if (command === 'F') {
      const suggestedMove = calculateMove(acc.currentPosition, acc.currentDirection)
      const outofbounds = checkOutOfBounds(grid, suggestedMove)
      if (outofbounds) {
        const error = composeError('eoutbounds', { grid, position: acc.currentPosition, direction: acc.currentDirection, commands })
        acc.errors.push(error)
        return acc
      }
      acc.currentPosition = suggestedMove
    }

    return acc
  }, {
    currentPosition: { initx, inity },
    currentDirection: dir,
    errors: []
  })

  console.log({ results })

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

function calculateMove({ x, y }, direction) {
  switch (direction) {
    case 'N': return { x, y: y - 1 }
    case 'S': return { x, y: y + 1 }
    case 'W': return { x: x - 1, y }
    case 'E': return { x: x + 1, y }
  }
}

function checkOutOfBounds(grid, position) {
  if (position.x < 0 || position.x > grid.x) return true
  if (position.y < 0 || position.y > grid.y) return true
  return false
}

function validateGrid(x, y) {
  if (typeof x !== 'number' && typeof x !== 'string') return false
  if (typeof y !== 'number' && typeof y !== 'string') return false
  
  const parsedX = Number(x)
  const parsedY = Number(y)

  return Number.isInteger(parsedX) && parsedX >= 0 && Number.isInteger(parsedY) && parsedY >= 0 ? {parsedX, parsedY} : false
}

export { calculatePosition, calculateDirection, calculateMove, validateGrid }