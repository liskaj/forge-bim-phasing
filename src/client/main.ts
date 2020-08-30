'use strict';

import { AppController } from './appController';

let appController: AppController = null;

$(document).ready(async () => {
    console.info('Document is loaded');
    if (!appController) {
        appController = new AppController();
    }
    await appController.initialize();
    await appController.load();
});
