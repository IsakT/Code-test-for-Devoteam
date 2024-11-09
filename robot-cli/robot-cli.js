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
        const gridDimensions = await askQuestion("Enter grid dimensions (e.g., 5 7): ")
        const startingPosition = await askQuestion("Enter starting position and direction (e.g., 3 3 E): ")
        const commands = await askQuestion("Enter movement commands (e.g., LRRFLRLFRF): ")

        rl.close()

        if (!gridDimensions || !startingPosition || !commands) {
            console.log("All fields are required.")
            return
        }

        // Set your API Gateway URL and token or API key
        const apiUrl = 'https://mpzc95tozb.execute-api.eu-west-1.amazonaws.com/default/CalculatePosition'

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                gridDimensions: gridDimensions,
                startingPosition: startingPosition,
                commands: commands
            })
        })

        console.log({ response })

        const result = await response.json()

        console.log({ result })

        console.log(`\nFinal Position: (${result.finalPosition.x}, ${result.finalPosition.y}) facing ${result.finalPosition.direction}`)

    } catch (error) {
        console.error("An error occurred:", error)
    }
}

main()
