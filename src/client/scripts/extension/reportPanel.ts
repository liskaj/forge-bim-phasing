/// <reference path='../../../../types/d3/index.d.ts' />
/// <reference path='../../lib/plottable/plottable.d.ts' />

import { PanelBase } from './panelBase';
import { PhasingController, PhasingData } from './phasingController';

export class ReportPanel extends PanelBase {
    private _controller: PhasingController;
    private _templateLoaded: boolean = false;
    private _chart: JQuery;
    private _plot: Plottable.Plots.Bar<string, number>;
    private _table: Plottable.Components.Table;

    constructor(container: Element, id: string, controller: PhasingController, options?: any) {
        super(container, id, 'Elements per phase', options);
        this._controller = controller;
        this.addVisibilityListener((state: boolean) => {
            this.onVisibilityChange(state);
        });
        this.container.classList.add('report-panel');
        this.container.style.left = '60px';
        this.container.style.top = '40px';
        this.container.style.width = '600px';
        this.container.style.height = '400px';
        this.container.style.position = 'absolute';
        // scroll container
        this.createScrollContainer({
            heightAdjustment: 40,
            left: false,
            marginTop: 0
        });
        // create UI
        const url: string = window.location.href + 'scripts/extension/res/reportPanel.html';

        Autodesk.Viewing.Private.getHtmlTemplate(url, (err, content) => {
            this.onTemplate(err, content);
        });
    }

    public refresh(): void {
        if (!this._templateLoaded) {
            return;
        }
        this._controller.getData((data: { [name: string]: PhasingData}) => {
            const chartData = [];
            const keys = Object.keys(data);

            // sort by index
            keys.sort((firstKey, secondKey) => {
                const firstIndex = data[firstKey].index;
                const secondIndex = data[secondKey].index;

                if (firstIndex < secondIndex) {
                    return -1;
                }
                else if (firstIndex > secondIndex) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            keys.forEach((key) => {
                const phaseData: PhasingData = data[key];

                chartData.push({
                    x: phaseData.index + 1,
                    y: phaseData.dbIds.length
                });
            });
            const dataSet = new Plottable.Dataset(chartData);

            if (this._plot) {
                this._plot.datasets([ dataSet ]);
            }
            else {
                const xScale = new Plottable.Scales.Category();
                const yScale = new Plottable.Scales.Linear();
                const xAxis = new Plottable.Axes.Category(xScale, 'bottom');
                const yAxis = new Plottable.Axes.Numeric(yScale, 'left');

                this._plot = new Plottable.Plots.Bar();
                this._plot.addDataset(dataSet);
                this._plot.x((d) => {
                    return d.x;
                }, xScale);
                this._plot.y((d) => {
                    return d.y;
                }, yScale);
                this._table = new Plottable.Components.Table([
                    [yAxis, this._plot],
                    [null, xAxis]
                ]);
                this._table.renderTo(this._chart[0]);
            }
        });
    }

    private onTemplate(err: string, content: string): void {
        const tmp = document.createElement('div');

        tmp.innerHTML = content;
        this.scrollContainer.appendChild(tmp.childNodes[0]);
        this._chart = $('#phasing-chart');
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
