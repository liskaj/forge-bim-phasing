/// <reference path='viewer.d.ts' />

declare module Autodesk {
    export module Viewing {
        export module Extensions {
            export module Markups {
                export module Core {
                    export class MarkupsCore extends Autodesk.Viewing.Extension {
                        duringEditMode: boolean;
                        duringViewMode: boolean;

                        enterEditMode(): boolean;
                        leaveEditMode(): boolean;
                        changeEditMode(mode: EditMode): void;
                        hide(): boolean;
                        show(): boolean;
                        toggle(): boolean;
                        clear(): void;
                        generateData(): string;
                        generatePoints3d(): any;
                        allowNavigation(allow: boolean): void;
                        disableMarkupInteractions(disable: boolean): void;
                    }

                    export class EditMode {
                        constructor(extension: Autodesk.Viewing.Extension);
                    }

                    export class EditModeArrow extends EditMode {
                    }

                    export class EditModeCircle extends EditMode {
                    }

                    export class EditModeCloud extends EditMode {
                    }

                    export class EditModeFreehand extends EditMode {
                    }

                    export class EditModeRectangle extends EditMode {
                    }

                    export class EditModeText extends EditMode {
                    }
                }
            }
        }
    }
}