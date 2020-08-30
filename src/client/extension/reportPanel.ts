import { Colors } from './colors';
import { PanelBase } from './panelBase';
import { PhasingController, PhasingData } from './phasingController';
import { Tooltip, TooltipData } from './tooltip';

import { Axes, Components, Dataset, Interactions, Plots, Scales } from 'plottable';

interface ChartData {
    x: number;
    y: number;
}

export class ReportPanel extends PanelBase {
    private _controller: PhasingController;
    private _templateLoaded: boolean = false;
    private _chart: JQuery;
    private _tooltip: Tooltip;
    private _plot: Plots.StackedBar<string, number>;
    private _table: Components.Table;
    private _tooltips: TooltipData[][];

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
        this.container.style.height = '420px';
        this.container.style.position = 'absolute';
        // scroll container
        this.createScrollContainer({
            heightAdjustment: 70,
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
        if (!this._plot) {
            this._controller.getData((data: { [name: string]: PhasingData}) => {
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
                // get object names
                const objectNames: string[] = [];
                let phaseCount: number = 0;

                keys.forEach((key) => {
                    const phaseData: PhasingData = data[key];
                    const objectKeys: string[] = Object.keys(phaseData.objectIds);

                    phaseCount = Math.max(phaseCount, phaseData.index);
                    objectKeys.forEach((objectKey) => {
                        if (objectNames.indexOf(objectKey) < 0) {
                            objectNames.push(objectKey);
                        }
                    });
                });
                objectNames.sort();
                const dataSets: { [key: string]: ChartData[] } = {};

                keys.forEach((key) => {
                    const phaseData: PhasingData = data[key];

                    objectNames.forEach((objectName) => {
                        let dataSet: ChartData[] = dataSets[objectName];

                        if (!dataSet) {
                            dataSet = [];
                            dataSets[objectName] = dataSet;
                        }
                        const objectIds = phaseData.objectIds[objectName];
                        const length = (objectIds ? objectIds.length : 0);

                        dataSet.push({
                            x: phaseData.index + 1,
                            y: length
                        });
                    });
                });
                // tooltips
                this._tooltips = [];

                for (let i = 0; i <= phaseCount; i++) {
                    const tooltipData: TooltipData[] = [];

                    objectNames.forEach((objectName, index) => {
                        const dataSet: ChartData[] = dataSets[objectName];

                        if (dataSet[i].y > 0) {
                            tooltipData.push({
                                category: objectName,
                                categoryIndex: index,
                                value: dataSet[i].y
                            });
                        }
                    });
                    this._tooltips.push(tooltipData);
                }
                const xScale = new Scales.Category();
                const yScale = new Scales.Linear();
                const xAxis = new Axes.Category(xScale, 'bottom');
                const yAxis = new Axes.Numeric(yScale, 'left');

                this._plot = new Plots.StackedBar();
                const panZoom = new Interactions.PanZoom(xScale, null);

                panZoom.attachTo(this._plot);
                const dataKeys: string[] = Object.keys(dataSets);

                dataKeys.forEach((dataKey, index) => {
                    this._plot.addDataset(new Dataset(dataSets[dataKey]).metadata(index));
                });
                // add colors
                const colors: string[] = [];

                for (let i = 0; i < objectNames.length; i++) {
                    colors.push(Colors.chartColors[i]);
                }
                const colorScale = new Scales.InterpolatedColor();

                colorScale.range(colors);
                this._plot.x((d) => {
                    return d.x;
                }, xScale);
                this._plot.y((d) => {
                    return d.y;
                }, yScale);
                this._plot.attr('fill', (d, i, dataSet) => {
                    return dataSet.metadata();
                }, colorScale);
                this._table = new Components.Table([
                    [yAxis, this._plot],
                    [null, xAxis]
                ]);
                this._table.renderTo(this._chart[0]);
                // tooltip
                const pointer = new Interactions.Pointer();

                pointer.onPointerMove((p) => {
                    const closest = this._plot.entityNearest(p);

                    if (closest) {
                        this._tooltip.show(p, this._tooltips[closest.index]);
                    }
                    else {
                        this._tooltip.hide();
                    }
                });
                pointer.onPointerExit(() => {
                    this._tooltip.hide();
                });
                pointer.attachTo(this._plot);
            });
        }
    }

    private onTemplate(err: string, content: string): void {
        const tmp = document.createElement('div');

        tmp.innerHTML = content;
        this.scrollContainer.appendChild(tmp.childNodes[0]);
        this._chart = $('#phasing-chart');
        this._tooltip = new Tooltip('#chart-tooltip');
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
