# Forge BIM Phasing Application

Forge BIM Phasing application based on Node.js.

## Prerequisites
* Install [git](https://pages.git.autodesk.com/github-solutions/).
* Install [Node.js LTS](https://nodejs.org/).
* Install [Visual Studio Code](https://code.visualstudio.com/).

## Development Environment
* Clone or download code from [Git](https://git.autodesk.com/consulting-emea/forge-bim-phasing)
* Run `npm install`. This will install all dependencies and build both server and client.
* Enter `set FORGE_CLIENT_ID=xxxx` where `xxxx` is unique client ID of your Forge application. The client ID can be generated on [Forge portal](https://developer.autodesk.com/).
* Enter `set FORGE_CLIENT_SECRET=xxxx` where `xxxx` is unique secret of your Forge application.
* Build server by typing `npm run build:server`.
* Start node server by typing `npm start`. This starts server on port 3000.
* Start dev server by typing `npm run dev`. This starts development server on port 5000.

When using your own client ID/secret you also need to translate model and update URN in `appController.ts`.

## Building the application
* Use `npm run build:server` to build the server.
* Use `npm run build:client` to build the client.

## Running the application
1. Open web page [here](http://forge-bim-phasing.azurewebsites.net). Note that it's using shared instance so it may take a while when website opens when running for first time.
2. Click on Phases button in the main toolbar.
3. The Phases panel is displayed.
4. Use navigation buttons in the panel to navigate betwen phases.
5. The elements associated with current phase are highligthed in green color. The panel displays brief statistics (number of elements, area, volume).
6. Click on Report button.
7. The Report panel is displayed. It displays report of elements for each phase.
