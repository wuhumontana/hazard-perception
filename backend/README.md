# Hazard Perception Backend

## Test Environment

Ensure that you have the correct database URI and port in your .env file.
The environment variables can be used by `process.env.VARIABLE_NAME` within
the module. Your .env file needs to be within the working directory and the
same directory as server.js.

To run the API on port 3000, use the `yarn dev` command. This is the alias
for `dotenv -e .env nodemon server.js --host`. Always use `yarn` after
`git pull` to ensure you have all the required dependencies.

Before pushing, use `yarn prettier --write <filename>` to prettify the code.
