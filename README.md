
# Isak's Code-test-for-Devoteam

  

Code test as part of the Devoteam interview process

  

# To test the robot using a CL-interface

  

Install the necessary packages. Make sure to use Node.js >= 20.

  
	$ cd robot-cli
    $ npm install

Then run:
 

    $ node robot-cli.js

 You will be prompted to input these fields:
 

    Enter the AWS API Gateway key:
    Enter grid width dimension (e.g., 5):
    Enter grid depth dimensions (e.g., 5):
    Enter starting position x: (e.g., 3):
    Enter starting position y: (e.g., 4):
    Enter starting position direction: (e.g., E or N or W or S):
    Enter movement commands (e.g., LRRFLRLFRF):

You will be met with an output, such as:

    Final Position: (3, 2) facing S
    ERRORS:
    [{"code":2,"message":"EOUTBOUNDS: Out of bounds. The robot was ...

The robot will ignore commands that are not appropiate for it to make in the context that it's in.

# Testing
Testing is done using the [Mocha Library](https://mochajs.org/), and the assertions are done with the [Chai library](https://www.chaijs.com/).

To run the tests, go to the *testingLambda/* folder, and run:

	$ npm install
    $ npm test


# Behind the scenes
The actual calculations are done in an AWS Lambda function, via an AWS API Gateway, and can be called with simple HTTP-requests. This makes it possible to add any kind of front-end or interface.

cURL example:

    curl -X POST -v https://mpzc95tozb.execute-api.eu-west-1.amazonaws.com/default/CalculatePosition \
    -H "x-api-key: <redacted>" \
    -H "Content-Type: application/json" \
    -d '{"grid": {"x": "5", "y": "7"}, "position": {"x": "3", "y": "3", "dir": "E"}, "commands": "FFRFFLR"}'

The code for the Lambda function can be found in the file *testingLambda/index.js*.



