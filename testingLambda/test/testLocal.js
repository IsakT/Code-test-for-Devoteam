import { expect } from 'chai'
import { calculatePosition, calculateDirection, calculateMove, validateGrid } from '../index.js'
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
    let grid = {x: 5, y: 7}
    let direction = 'E'
    let newPosition = calculateMove(grid, direction)

    expect(newPosition).to.deep.equal({x: 6, y: 7})

    let grid = { x: 5, y: 7 }
    let direction = 'E'
    let newPosition = calculateMove(grid, direction)

    expect(newPosition).to.deep.equal({ x: 6, y: 7 })

    let grid = { x: 5, y: 7 }
    let direction = 'E'
    let newPosition = calculateMove(grid, direction)

    expect(newPosition).to.deep.equal({ x: 6, y: 7 })
  })
})

// describe('calculate position, integration test', function () {
//   it('output the correct final position of the robot given all inputs', function () {
//     const grid = { x: 5, y: 7 }
//     const startingPos = { x: 3, y: 3, dir: 'E' }
//     const commands = 'LRFLLRLRLFLRLF'
//     const result = calculatePosition(grid, startingPos, commands)

//     expect(result).to.deep.equal({ x: 3, y: 3, dir: 'N' })
//   })
//   it('handle out-of-bounds situation', function () {
//     const grid = { x: 5, y: 7 }
//     const startingPos = { x: 3, y: 3, dir: 'E' }
//     const commands = 'LRFLLRLRLFLRLF'
//     const result = calculatePosition(grid, startingPos, commands)

//     expect(result).to.deep.equal({ x: 3, y: 3, dir: 'N' })
//   }),
//     it('handle bad commands', function () {
//       const grid = { x: 5, y: 7 }
//       const startingPos = { x: 3, y: 3, dir: 'E' }
//       const commands = 'LRFfdsklfn4386oofdsl'
//       const result = calculatePosition(grid, startingPos, commands)

//       expect(result).to.deep.equal({ x: 3, y: 3, dir: 'N' })
//     })
// })