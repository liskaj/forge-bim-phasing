import { PhasingController } from './phasingController';
import { PhasingPanel } from './phasingPanel';
import { ReportPanel } from './reportPanel';

export class BIMExtension extends Autodesk.Viewing.Extension {
    private _phasingController: PhasingController;
    private _phasingPanel: PhasingPanel;
    private _reportPanel: ReportPanel;
    // buttons
    private _btnPhasing: Autodesk.Viewing.UI.Button;
    private _btnReport: Autodesk.Viewing.UI.Button;

    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
        super(viewer, options);
    }

    public load(): boolean {
        this._phasingController = new PhasingController(this.viewer);
        return true;
    }

    public unload(): boolean {
        if (this._phasingPanel) {
            this.viewer.removePanel(this._phasingPanel);
            this._phasingPanel.uninitialize();
            this._phasingPanel = null;
        }
        if (this._reportPanel) {
            this.viewer.removePanel(this._reportPanel);
            this._reportPanel.uninitialize();
            this._reportPanel = null;
        }
        return true;
    }

    public onToolbarCreated(toolbar?: Autodesk.Viewing.UI.ToolBar): void {
        this.createToolbar();
    }

    private createToolbar(): void {
        // create button
        this._btnPhasing = new Autodesk.Viewing.UI.Button('BIMExtension.Toolbar.Phasing');
        this._btnPhasing.setIcon('phasing-btn');
        this._btnPhasing.setToolTip('Phases');
        this._btnPhasing.onClick = (e: MouseEvent) => {
            this.onPhasing(e);
        };
        // create button
        this._btnReport = new Autodesk.Viewing.UI.Button('BIMExtension.Toolbar.Report');
        this._btnReport.setIcon('report-btn');
        this._btnReport.setToolTip('Report');
        this._btnReport.onClick = (e: MouseEvent) => {
            this.onReport(e);
        };
        // add button to the goup
        const ctrlGroup = new Autodesk.Viewing.UI.ControlGroup('BIMExtension.Toolbar.ControlGroup');

        ctrlGroup.addControl(this._btnPhasing);
        //ctrlGroup.addControl(this._btnReport);
        // add group to main toolbar
        this.viewer.toolbar.addControl(ctrlGroup);
    }

    private onPhasing(e: MouseEvent): void {
        if (!this._phasingPanel) {
            this._phasingPanel = new PhasingPanel(this.viewer.container, 'BIMExtension.PhasingPanel', this._phasingController);
            this.viewer.addPanel(this._phasingPanel);
            // as the panel visibility changes, we fix the button state
            this._phasingPanel.addVisibilityListener((state: boolean) => {
                this._btnPhasing.setState(state ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
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

    private onReport(e: MouseEvent): void {
        if (!this._reportPanel) {
            this._reportPanel = new ReportPanel(this.viewer.container, 'BIMExtension.ReportPanel', this._phasingController);
            this.viewer.addPanel(this._reportPanel);
            // as the panel visibility changes, we fix the button state
            this._reportPanel.addVisibilityListener((state: boolean) => {
                this._btnReport.setState(state ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            });
            this._reportPanel.setVisible(true);
        }
        else {
            this._reportPanel.toggleVisibility();
        }
        if (this._reportPanel.isVisible()) {
            this._reportPanel.refresh();
        }
    }
}
