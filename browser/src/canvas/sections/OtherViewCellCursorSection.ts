/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// This is used for other views' graphic selections.

class OtherViewCellCursorSection extends CanvasSectionObject {
    documentObject: boolean = true;
    interactable: boolean = false; // We don't bother with events.
    zIndex: number = L.CSections.DefaultForDocumentObjects.processingOrder;
    drawingOrder: number = L.CSections.DefaultForDocumentObjects.drawingOrder;
    processingOrder: number = L.CSections.DefaultForDocumentObjects.processingOrder;

    static sectionNamePrefix = 'OtherViewCellCursorSection ';
    static sectionPointers: Array<OtherViewCellCursorSection> = [];

    constructor(viewId: number, rectangle: cool.SimpleRectangle, part: number) {
        super();

        this.size = [rectangle.pWidth, rectangle.pHeight];
        this.position = [rectangle.pX1, rectangle.pY1];
        this.sectionProperties.color = L.LOUtil.rgbToHex(L.LOUtil.getViewIdColor(viewId));
        this.name = OtherViewCellCursorSection.sectionNamePrefix + viewId;

        this.sectionProperties.viewId = viewId;
        this.sectionProperties.part = part;

        this.sectionProperties.popUpContainer = null;
        this.sectionProperties.popUpShown = false;

        this.sectionProperties.username = null;
        this.sectionProperties.popUpTimer = null;
    }

    onDraw(frameCount?: number, elapsedTime?: number, subsetBounds?: Bounds): void {
        this.adjustPopUpPosition();

        this.context.strokeStyle = this.sectionProperties.color;
        this.context.lineWidth = 2;
        this.context.strokeRect(-0.5, -0.5, this.size[0], this.size[1]);
    }

    checkMyVisibility() {
        if (app.map._docLayer._selectedPart !== this.sectionProperties.part)
            return false;
        else
            return true;
    }

    adjustPopUpPosition() {
        if (!this.showSection || !this.sectionProperties.popUpShown)
            return;

        const pos = [this.myTopLeft[0] / app.dpiScale + this.size[0] * 0.5 / app.dpiScale - 55, (this.myTopLeft[1] / app.dpiScale) - 60];
        this.sectionProperties.popUpContainer.style.left = pos[0] + 'px';
        this.sectionProperties.popUpContainer.style.top = pos[1] + 'px';
    }

    prepareUsernamePopUp() {
        if (this.sectionProperties.popUpContainer === null) {
            const popUpContainer = document.createElement('div');

            popUpContainer.style.width = '110px';
            popUpContainer.style.height = '45px';
            popUpContainer.style.display = 'none';
            popUpContainer.style.position = 'absolute';
            popUpContainer.style.textAlign = 'center';
            popUpContainer.style.zIndex = '11';

            const nameContainer = document.createElement('div');
            popUpContainer.appendChild(nameContainer);

            const nameParagraph = document.createElement('p');
            nameContainer.appendChild(nameParagraph);
            nameParagraph.textContent = this.sectionProperties.username;
            nameParagraph.style.padding = '0';
            nameParagraph.style.lineHeight = '45px';
            nameParagraph.style.margin = 'auto';

            const arrowDiv = document.createElement('div');
            arrowDiv.style.width = arrowDiv.style.height = '20px';
            arrowDiv.style.transform = 'rotate(45deg)';
            arrowDiv.style.display = 'inline-block';
            arrowDiv.style.position = 'relative';
            arrowDiv.style.top = '-10px';
            popUpContainer.appendChild(arrowDiv);

            popUpContainer.style.backgroundColor = nameContainer.style.backgroundColor = this.sectionProperties.color;
            arrowDiv.style.backgroundColor = nameParagraph.style.backgroundColor = this.sectionProperties.color;
            nameParagraph.style.color = 'white';

            document.getElementById('document-container').appendChild(popUpContainer);

            this.sectionProperties.popUpContainer = popUpContainer;
        }
    }

    clearPopUpTimer() {
        if (this.sectionProperties.popUpTimer) {
            clearTimeout(this.sectionProperties.popUpTimer);
            this.sectionProperties.popUpTimer = null;
        }
    }

    showUsernamePopUp() {
        if (this.sectionProperties.popUpContainer) {
            this.sectionProperties.popUpShown = true;
            this.sectionProperties.popUpContainer.style.display = '';

            this.clearPopUpTimer();

            this.sectionProperties.popUpTimer = setTimeout(() => {
                this.hideUsernamePopUp();
            }, 3000);
        }
    }

    hideUsernamePopUp() {
        if (this.sectionProperties.popUpContainer) {
            this.sectionProperties.popUpShown = false;
            this.sectionProperties.popUpContainer.style.display = 'none';
        }
        this.clearPopUpTimer();
    }

    public static addOrUpdateOtherViewCellCursor(viewId: number, username: string, rectangleData: Array<string>, part: number) {
        let rectangle = new cool.SimpleRectangle(0, 0, 0, 0);
        if (rectangleData)
            rectangle = new app.definitions.simpleRectangle(parseInt(rectangleData[0]), parseInt(rectangleData[1]), parseInt(rectangleData[2]), parseInt(rectangleData[3]));

        const sectionName = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        let section: OtherViewCellCursorSection;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            section = app.sectionContainer.getSectionWithName(sectionName);
            section.sectionProperties.part = part;
            section.size[0] = rectangle.pWidth;
            section.size[1] = rectangle.pHeight;
            section.setPosition(rectangle.pX1, rectangle.pY1);
        }
        else {
            section = new OtherViewCellCursorSection(viewId, rectangle, part);
            app.sectionContainer.addSection(section);
            OtherViewCellCursorSection.sectionPointers.push(section);
        }

        section.sectionProperties.username = username;
        section.prepareUsernamePopUp();

        section.setShowSection(section.checkMyVisibility());

        if (section.showSection)
            section.showUsernamePopUp();

        app.sectionContainer.requestReDraw();
    }

    public static removeView(viewId: number) {
        const sectionName = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            const section = app.sectionContainer.getSectionWithName(sectionName);
            OtherViewCellCursorSection.sectionPointers.splice(OtherViewCellCursorSection.sectionPointers.indexOf(section), 1);
            app.sectionContainer.removeSection(sectionName);
            app.sectionContainer.requestReDraw();
        }
    }

    public static updateVisibilities() {
        for (let i = 0; i < OtherViewCellCursorSection.sectionPointers.length; i++) {
            const section = OtherViewCellCursorSection.sectionPointers[i];
            section.setShowSection(section.checkMyVisibility());
        }
        app.sectionContainer.requestReDraw();
    }

    public static getViewCursorSection(viewId: number) {
        const name = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        return app.sectionContainer.getSectionWithName(name);
    }

    public static doesViewCursorExist(viewId: number) {
        const name = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        return app.sectionContainer.doesSectionExist(name);
    }

    public static showPopUpForView(viewId: number) {
        if (OtherViewCellCursorSection.doesViewCursorExist(viewId)) {
            const section = OtherViewCellCursorSection.getViewCursorSection(viewId);

            section.showUsernamePopUp();
        }
    }
}

app.definitions.otherViewCellCursorSection = OtherViewCellCursorSection;
