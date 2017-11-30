# Forge BIM Phasing Application

Forge BIM Phasing application based on Node.js.

## Prerequisites
* Install [git](https://pages.git.autodesk.com/github-solutions/).
* Install [Node.js LTS](https://nodejs.org/).
* Install [Visual Studio Code](https://code.visualstudio.com/).

## Development Environment
* Clone or download code from [Git](https://git.autodesk.com/consulting-emea/forge-bim-phasing)
* Run `npm install`. This will install all dependencies and build both server and client.
* Enter `set CONSUMER_KEY=xxxx` where `xxxx` is unique key for your Forge application. The key can be generated on [Forge portal](https://developer.autodesk.com/).
* Enter `set CONSUMER_SECRET=xxxx` where `xxxx` is unique secret for your Forge application.
* Start node server by typing `npm start`.

When using your own key/secret you also need to translate model and update URN in `appController.ts`.

## Running the application
1. Open web page [here](http://forge-bim-phasing.azurewebsites.net). Note that it's using shared instance so it may take a while when website opens when running for first time.
2. Click on Phases button in the main toolbar.
3. The Phases panel is displayed.
4. Use navigation buttons in the panel to navigate betwen phases.
5. The elements associated with current phase are highligthed in green color. The panel displays brief statistics (number of elements, area, volume).
6. Click on Report button.
7. The Report panel is displayed. It displays report of elements for each phase.
