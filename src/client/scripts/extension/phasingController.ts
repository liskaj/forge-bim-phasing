/// <reference path='../../../../types/forge/viewer.d.ts' />

import * as THREE from 'three';

export interface PhasingData {
    name: string;
    index: number;
    objectIds: { [category: string]: number[] };
    area: number;
    volume: number;
    totalElements: number;
}

export class PhasingController {
    private _categoryMapping: { [key: string]: string } = {
        'Revit Air Terminals' : 'HVAC Elements',
        'Revit Columns' : 'Structural Elements',
        'Revit Curtain Panels' : 'Curtain Wall Elements',
        'Revit Curtain Wall Mullions' : 'Curtain Wall Elements',
        'Revit Doors' : 'Doors',
        'Revit Ducts' : 'HVAC Elements',
        'Revit Duct Fittings' : 'HVAC Elements',
        'Revit Electrical Equipment' : 'Electrical',
        'Revit Flex Ducts' : 'HVAC Elements',
        'Revit Floors' : 'Floors',
        'Revit Lighting Devices' : 'Electrical',
        'Revit Lighting Fixtures' : 'Electrical',
        'Revit Slab Edges' : 'Structural Elements',
        'Revit Structural Columns' : 'Structural Elements',
        'Revit Structural Foundations' : 'Structural Elements',
        'Revit Structural Framing' : 'Structural Elements',
        'Revit Walls' : 'Walls'
    };
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
        '14-Electrical'
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
        const currentPhase: PhasingData = this._data[phase];
        const keys: string[] = Object.keys(this._data);

        for (let i: number = 0; i < keys.length; i++) {
            const key = keys[i];
            const phaseData: PhasingData = this._data[key];
            let objectIds: number[] = [];
            const objectKeys: string[] = Object.keys(phaseData.objectIds);

            objectKeys.forEach((objectKey: string) => {
                objectIds = objectIds.concat(phaseData.objectIds[objectKey]);
            });
            if (phaseData.index < currentPhase.index) { // existing
                existingDbIds = existingDbIds.concat(objectIds);
            }
            else if (phaseData.index === currentPhase.index) { // new
                currentDbIds = objectIds;
            }
            else { // future
                futureDbIds = futureDbIds.concat(objectIds);
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
                'Area',
                'Category'
            ];

            this.viewer.model.getBulkProperties(ids, properties, (propResults: Autodesk.Viewing.PropertyResult[]) => {
                propResults.forEach((propResult: Autodesk.Viewing.PropertyResult) => {
                    let phase: string;
                    let category: string;
                    let area: number = 0.0;
                    let volume: number = 0.0;

                    propResult.properties.forEach((p) => {
                        switch (p.displayName) {
                            case 'Category':
                                if (p.displayCategory === '__category__') {
                                    category = p.displayValue;
                                }
                                break;
                            case 'Phase Created':
                                phase = p.displayValue;
                                break;
                            case 'Area':
                                area = parseFloat(p.displayValue);
                                break;
                            case 'Volume':
                                volume = parseFloat(p.displayValue);
                                break;
                        }
                    });
                    if (category in this._categoryMapping) {
                        category = this._categoryMapping[category];
                    }
                    else {
                        category = 'Other';
                    }
                    if (phase) {
                        let phaseData: PhasingData = data[phase];

                        if (!phaseData) {
                            phaseData = {
                                name: phase,
                                area: 0.0,
                                volume: 0.0,
                                objectIds: {},
                                index: 0,
                                totalElements: 0
                            };
                        }
                        let objectIds: number[];

                        if (category in phaseData.objectIds) {
                            objectIds = phaseData.objectIds[category];
                        }
                        else {
                            objectIds = [];
                            phaseData.objectIds[category] = objectIds;
                        }
                        objectIds.push(propResult.dbId);
                        phaseData.area += area;
                        phaseData.volume += volume;
                        data[phase] = phaseData;
                    }
                });
                // assign indexes & calculate total
                const keys: string[] = Object.keys(data);

                keys.forEach((k) => {
                    const phaseData = data[k];

                    phaseData.index = this._phases.indexOf(k);
                    const objectKeys: string[] = Object.keys(phaseData.objectIds);
                    let total: number = 0;

                    objectKeys.forEach((objectKey) => {
                        total += phaseData.objectIds[objectKey].length;
                    });
                    phaseData.totalElements = total;
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
