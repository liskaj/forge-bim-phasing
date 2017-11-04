/// <reference path='../../../../types/forge/viewer.d.ts' />

import * as THREE from 'three';

export interface PhasingData {
    name: string;
    index: number;
    dbIds: number[];
    area: number;
    volume: number;
}

export class PhasingController {
    private _phases: string[] = [
        '01-Site',
        '02-Structural Foundations',
        '03-Steel Erection',
        '04-Concrete & Metal Decking',
        '05-Stairs',
        '06-Roof',
        '07-Exterior Walls',
        '08-Curtain Walls & Windows',
        '09-Parking',
        '10-Partitions',
        '11-Ceilings',
        '12-HVAC',
        '13-Pluming',
        '14-Electrical',
    ];
    private _data: { [name: string]: PhasingData };
    private _hiddenDbIds: number[] = [];
    private _colorExisting: THREE.Vector4;
    private _colorNew: THREE.Vector4;
    private _currentPhase: PhasingData;

    constructor(private _viewer: Autodesk.Viewing.Private.GuiViewer3D) {
        this._colorExisting = new THREE.Vector4(0.75, 0.75, 0.75, 0.8);
        this._colorNew = new THREE.Vector4(0.0, 0.85, 0.0, 0.8);
    }

    private get viewer(): Autodesk.Viewing.Private.GuiViewer3D {
        return this._viewer;
    }

    public get currentPhase(): PhasingData {
        return this._currentPhase;
    }

    public get firstPhase(): string {
        return this._phases[0];
    }

    public get lastPhase(): string {
        return this._phases[this._phases.length - 1];
    }

    public get nextPhase(): string {
        const index: number = this.currentPhase.index;

        if (index < (this._phases.length - 1)) {
            return this._phases[index + 1];
        }
        return this._currentPhase.name;
    }

    public get previousPhase(): string {
        const index: number = this.currentPhase.index;

        if (index > 0) {
            return this._phases[index - 1];
        }
        return this._currentPhase.name;
    }

    public get phases(): string[] {
        return this._phases;
    }

    public displayPhase(phase: string): void {
        let existingDbIds: number[] = [];
        let currentDbIds: number[] = [];
        let futureDbIds: number[] = [];
        let hiddenDbIds: number[] = [];
        const currentPhase: PhasingData = this._data[phase];
        const keys: string[] = Object.keys(this._data);

        for (let i: number = 0; i < keys.length; i++) {
            const key = keys[i];
            const phaseData: PhasingData = this._data[key];

            if (phaseData.index < currentPhase.index) { // existing
                existingDbIds = existingDbIds.concat(phaseData.dbIds);
            }
            else if (phaseData.index === currentPhase.index) { // new
                currentDbIds = phaseData.dbIds;
            }
            else { // future
                futureDbIds = futureDbIds.concat(phaseData.dbIds);
            }
        }
        // unhide previously hidden nodes
        this.viewer.isolate();
        this.showHiddenNodes();
        // apply theming
        this.viewer.clearThemingColors(this.viewer.model);
        let dbIds: number[] = [];

        // existing
        existingDbIds.forEach((id: number) => {
            this.viewer.setThemingColor(id, this._colorExisting, this.viewer.model);
        });
        dbIds = dbIds.concat(existingDbIds);
        // new (current elements)
        currentDbIds.forEach((id: number) => {
            this._viewer.setThemingColor(id, this._colorNew, this._viewer.model);
        });
        dbIds = dbIds.concat(currentDbIds);
        // hide future elements
        futureDbIds.forEach((id: number) => {
            this.viewer.impl.visibilityManager.setNodeOff(id, true);
            this._hiddenDbIds.push(id);
        });
        // isolate
        this._viewer.isolate(dbIds);
        // remember current phase
        this._currentPhase = currentPhase;
    }

    public getData(callback: (data: { [name: string]: PhasingData }) => void): void {
        if (this._data) {
            callback(this._data);
            return;
        }
        const data: { [name: string]: PhasingData } = {};

        this.viewer.model.getObjectTree((instanceTree: Autodesk.Viewing.InstanceTree) => {
            // get leaf nodes
            const ids: number[] = [];

            instanceTree.enumNodeChildren(instanceTree.getRootId(), (id: number) => {
                if (instanceTree.getChildCount(id) === 0) {
                    ids.push(id);
                }
            }, true);
            const properties: string[] = [
                'Phase Created',
                'Volume',
                'Area'
            ];

            this.viewer.model.getBulkProperties(ids, properties, (propResults: Autodesk.Viewing.PropertyResult[]) => {
                propResults.forEach((propResult: Autodesk.Viewing.PropertyResult) => {
                    let phase: string;
                    let area: number = 0.0;
                    let volume: number = 0.0;

                    propResult.properties.forEach((p) => {
                        switch (p.displayName) {
                            case 'Phase Created':
                                phase = p.displayValue;
                                break;
                            case 'Area':
                                area = parseFloat(p.displayValue);
                                break
                            case 'Volume':
                                volume = parseFloat(p.displayValue);
                                break;
                        }
                    });
                    if (phase) {
                        let phaseData: PhasingData = data[phase];

                        if (!phaseData) {
                            phaseData = {
                                name: phase,
                                area: 0.0,
                                volume: 0.0,
                                dbIds: [],
                                index: 0
                            }
                        }
                        phaseData.dbIds.push(propResult.dbId);
                        phaseData.area += area;
                        phaseData.volume += volume;
                        data[phase] = phaseData;
                    }
                });
                // assign indexes
                const keys: string[] = Object.keys(data);

                keys.forEach((k) => {
                    const phaseData = data[k];

                    phaseData.index = this._phases.indexOf(k);
                });
                // remember data
                this._data = data;
                callback(data);
            });
        });
    }

    public restoreDisplay(): void {
        this.showHiddenNodes();
        this.viewer.clearThemingColors(this.viewer.model);
        this.viewer.showAll();
    }

    private showHiddenNodes(): void {
        this._hiddenDbIds.forEach((id: number) => {
            this.viewer.impl.visibilityManager.setNodeOff(id, false);
        });
        this._hiddenDbIds = [];
    }
}
