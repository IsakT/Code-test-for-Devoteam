// robot-cli.js

import readline from "readline"
import fetch from "node-fetch"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  try {
    const apiKey = await askQuestion('Enter the AWS API Gateway key.')
    const gridx = await askQuestion("Enter grid width dimension (e.g., 5): ")
    const gridy = await askQuestion("Enter grid depth dimensions (e.g., 5): ")
    const posx = await askQuestion("Enter starting position x: (e.g., 3): ")
    const posy = await askQuestion("Enter starting position y: (e.g., 4): ")
    const posdir = await askQuestion("Enter starting position direction: (e.g., E or N or W or S): ")
    const commands = await askQuestion("Enter movement commands (e.g., LRRFLRLFRF): ")

    rl.close()

    if (!apiKey || !gridx || !gridy || !posx || !posy || !posdir || !commands) {
      console.log("All fields are required.")
      return
    }

    const apiUrl = 'https://mpzc95tozb.execute-api.eu-west-1.amazonaws.com/default/CalculatePosition'
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        grid: { x: gridx, y: gridy },
        position: { x: posx, y: posy, dir: posdir },
        commands: commands
      })
    })

    let result
    try { result = await response.json() }
    catch (e) {
      console.log(e)
    }

    console.log({ result })
    console.log(`\nFinal Position: (${result?.currentPosition.x}, ${result?.currentPosition.y}) facing ${result?.currentDirection}`)
    if (result.errors) {
      console.log('ERRORS:')
      console.log(JSON.stringify(result.errors))
    }

  } catch (error) {
    console.error("An error occurred:", error)
  }
}

main()
