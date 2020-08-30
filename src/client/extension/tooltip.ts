/// <reference path='../../../../types/d3/index.d.ts' />
/// <reference path='../../lib/plottable/plottable.d.ts' />

'use strict';

import { Colors } from './colors';

export interface TooltipData {
    category: string;
    categoryIndex: number;
    value: number;
}

export class Tooltip {
    private _tooltip: JQuery;
    private _offsetX: number = 80;
    private _offsetY: number = 20;

    constructor(id: string) {
        this._tooltip = $(id);
    }

    public hide(): void {
        this._tooltip.toggleClass('hidden', true);
    }

    public show(position: Plottable.Point, tooltips: TooltipData[]): void {
        this._tooltip.toggleClass('hidden', false);
        this._tooltip.css({
            left: (position.x + this._offsetX) + 'px',
            top: (position.y + this._offsetY) + 'px'
        });
        this._tooltip.empty();
        tooltips.forEach((tooltip) => {
            const div: HTMLDivElement = document.createElement('div');

            div.innerHTML = '<span style="background-color:' + Colors.chartColors[tooltip.categoryIndex] + '"></span>' +
                tooltip.category + ': ' + tooltip.value;
            this._tooltip.append(div);
        });
    }
}
