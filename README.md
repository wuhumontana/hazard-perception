# Hazard Perception

This is the hazard perception training and testing application that is being developed for the BTSCRP-16 project. 

## Installation

### Node.js

Install [Node.js](https://nodejs.org/en/download) if you haven't already. This will allow you to use `npm` to install other Node.js programs.

### Yarn

Yarn is a package manager that adds required dependencies before running the application. To install Yarn, run the following command:

`npm install --global yarn`

You may encounter permission errors after running the line above. If this is the case, try running this command:

`npm config set prefix '~/.npm-packages'`

Then, append the following line of code to your shell configuration file (e.g., .zshrc for Zsh or .bashrc for Bash):
`export PATH="$PATH:$HOME/.npm-packages/bin"`
After completing these steps, create a new shell instance and try running the above npm command to install Yarn.

## Running the Application

After Yarn is installed, you will need to create an .env in the same directory as server.js. Ensure that you have the correct database URI and port in your .env file. 

Next, open two separate shell windows to run the entire application. On the first shell, navigate to the `frontend` directory and enter the command `yarn dev`. On the second shell, navigate to the `backend` directory and enter the same command, `yarn dev`.