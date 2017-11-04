/// <reference path='../../../../types/forge/viewer.d.ts' />

import { PhasingController } from './phasingController';
import { PhasingPanel } from './phasingPanel';

export class BIMExtension extends Autodesk.Viewing.Extension {
    private _phasingController: PhasingController;
    private _phasingPanel: PhasingPanel;
    // buttons
    private _btnPhases: Autodesk.Viewing.UI.Button;

    constructor(viewer: Autodesk.Viewing.Private.GuiViewer3D, options: any) {
        super(viewer, options);
    }

    public load(): boolean {
        this._phasingController = new PhasingController(this.viewer);
        this.createToolbar();
        return true;
    }

    public unload(): boolean {
        if (this._phasingPanel) {
            this.viewer.removePanel(this._phasingPanel);
            this._phasingPanel.uninitialize();
            this._phasingPanel = null;
        }
        return true;
    }

    private createToolbar(): void {
        // create button
        this._btnPhases = new Autodesk.Viewing.UI.Button('BIMExtension.Toolbar.Phasing');
        this._btnPhases.setIcon('phasing-btn');
        this._btnPhases.setToolTip('Phases');
        this._btnPhases.onClick = (e: MouseEvent) => {
            this.onPhases(e);
        };
        // add button to the goup
        const ctrlGroup = new Autodesk.Viewing.UI.ControlGroup('BIMExtension.Toolbar.ControlGroup');

        ctrlGroup.addControl(this._btnPhases);
        // add group to main toolbar
        this.viewer.toolbar.addControl(ctrlGroup);
    }

    private onPhases(e: MouseEvent): void {
        if (!this._phasingPanel) {
            this._phasingPanel = new PhasingPanel(this.viewer.container, 'BIMExtension.QtoPanel', this._phasingController);
            this.viewer.addPanel(this._phasingPanel);
            // as the panel visibility changes, we fix the button state
            this._phasingPanel.addVisibilityListener((state: boolean) => {
                this._btnPhases.setState(state ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            });
            this._phasingPanel.setVisible(true);
        }
        else {
            this._phasingPanel.toggleVisibility();
        }
        if (this._phasingPanel.isVisible()) {
            this._phasingPanel.refresh();
        }
    }
}
