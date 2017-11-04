import { PanelBase } from './panelBase';
import { PhasingController, PhasingData } from './phasingController';

export class PhasingPanel extends PanelBase {
    private _controller: PhasingController;
    private _templateLoaded: boolean = false;
    private _dataLoaded: boolean = false;
    private _btnFirst: JQuery;
    private _btnLast: JQuery;
    private _btnPrev: JQuery;
    private _btnNext: JQuery;
    private _labelPhase: JQuery;
    private _labelElements: JQuery;
    private _labelArea: JQuery;
    private _labelVolume: JQuery;

    constructor(container: Element, id: string, controller: PhasingController, options?: any) {
        super(container, id, 'Phases', options);
        this._controller = controller;
        this.addVisibilityListener((state: boolean) => {
            this.onVisibilityChange(state);
        });
        this.container.classList.add('phasing-panel');
        this.container.style.left = '60px';
        this.container.style.top = '40px';
        this.container.style.width = '320px';
        this.container.style.height = '200px';
        this.container.style.position = 'absolute';
        // scroll container
        this.createScrollContainer({
            heightAdjustment: 40,
            left: false,
            marginTop: 0
        });
        // create UI
        const url: string = window.location.href + 'scripts/extension/res/phasingPanel.html';

        Autodesk.Viewing.Private.getHtmlTemplate(url, (err, content) => {
            this.onTemplate(err, content);
        });
    }

    public refresh(): void {
        if (!this._templateLoaded) {
            return;
        }
        if (!this._dataLoaded) {
            this._controller.getData((data: { [name: string]: PhasingData }) => {
                this._dataLoaded = true;
                // navigate to 1st phase
                this._btnFirst.click();
            });
        }
        else {
            const phaseData: PhasingData = this._controller.currentPhase;

            this._labelPhase.text(phaseData.name + ' (' + (phaseData.index + 1) + '/' + this._controller.phases.length + ')');
            this._labelElements.text(phaseData.dbIds.length);
            this._labelArea.text(phaseData.area.toFixed(3).toString());
            this._labelVolume.text(phaseData.volume.toFixed(3).toString());
        }
    }

    private displayPhase(phase: string): void {
        let currentPhase: string;

        if (this._controller.currentPhase) {
            currentPhase = this._controller.currentPhase.name;
        }
        if (currentPhase === phase) {
            return;
        }
        this._controller.displayPhase(phase);
        this.refresh();
    }

    private onBtnFirstClick(e: JQuery.Event): void {
        this.displayPhase(this._controller.firstPhase);
    }

    private onBtnNextClick(e: JQuery.Event): void {
        this.displayPhase(this._controller.nextPhase);
    }

    private onBtnPrevClick(e: JQuery.Event): void {
        this.displayPhase(this._controller.previousPhase);
    }

    private onBtnLastClick(e: JQuery.Event): void {
        this.displayPhase(this._controller.lastPhase);
    }

    private onTemplate(err: string, content: string): void {
        const tmp = document.createElement('div');

        tmp.innerHTML = content;
        this.scrollContainer.appendChild(tmp.childNodes[0]);
        this._btnFirst = $('#phasing-first');
        this._btnFirst.on('click', (e) => {
            this.onBtnFirstClick(e);
        });
        this._btnNext = $('#phasing-next');
        this._btnNext.on('click', (e) => {
            this.onBtnNextClick(e);
        });
        this._btnPrev = $('#phasing-prev');
        this._btnPrev.on('click', (e) => {
            this.onBtnPrevClick(e);
        });
        this._btnLast = $('#phasing-last');
        this._btnLast.on('click', (e) => {
            this.onBtnLastClick(e);
        });
        this._labelPhase = $('#phasing-phase');
        this._labelElements = $('#phasing-elements');
        this._labelArea = $('#phasing-area');
        this._labelVolume = $('#phasing-volume');
        this._templateLoaded = true;
        // update dialog
        this.refresh();
    }

    private onVisibilityChange(state: boolean): void {
        if (!state) {
            this._controller.restoreDisplay();
        }
    }
}
