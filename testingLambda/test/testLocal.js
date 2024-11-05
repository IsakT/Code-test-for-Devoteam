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
    let position1 = {x: 5, y: 7}
    let direction1 = 'N'
    let newPosition1 = calculateMove(position1, direction1)

    expect(newPosition1).to.deep.equal({x: 5, y: 6})

    let position2 = { x: 5, y: 7 }
    let direction2 = 'E'
    let newPosition2 = calculateMove(position2, direction2)

    expect(newPosition2).to.deep.equal({ x: 6, y: 7 })

    let position3 = { x: 5, y: 7 }
    let direction3 = 'S'
    let newPosition3 = calculateMove(position3, direction3)

    expect(newPosition3).to.deep.equal({ x: 5, y: 8 })

    let position4 = { x: 5, y: 7 }
    let direction4 = 'W'
    let newPosition4 = calculateMove(position4, direction4)

    expect(newPosition4).to.deep.equal({ x: 4, y: 7 })
  })
  it('validateGrid', function () {
    expect(validateGrid(0, 4)).to.deep.equal({ parsedX: 0, parsedY: 4 })
    expect(validateGrid(100, 4)).to.deep.equal({ parsedX: 100, parsedY: 4 })
    expect(validateGrid(1e10, 4)).to.deep.equal({ parsedX: 10000000000, parsedY: 4 })
    expect(validateGrid(Number.MAX_SAFE_INTEGER, 4)).to.deep.equal({ parsedX: Number.MAX_SAFE_INTEGER, parsedY: 4 })
    expect(validateGrid('1', '4e3')).to.deep.equal({ parsedX: 1, parsedY: 4000 })
    expect(validateGrid('1', '4')).to.deep.equal({ parsedX: 1, parsedY: 4 })
    
    expect(validateGrid(Infinity, 4)).to.equal(false)
    expect(validateGrid(-1, 4)).to.equal(false)
    expect(validateGrid(1.4, 4.6)).to.equal(false)
    expect(validateGrid(true, 4)).to.equal(false)
    expect(validateGrid(['1'], 4)).to.equal(false)
    expect(validateGrid(['1', 2], 4)).to.equal(false)
    expect(validateGrid(1, {foo: 'bar'})).to.equal(false)
    expect(validateGrid(1, null)).to.equal(false)
    expect(validateGrid(1, undefined)).to.equal(false)
    expect(validateGrid('1', 'true')).to.equal(false)
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