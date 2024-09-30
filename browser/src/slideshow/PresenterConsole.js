/* -*- js-indent-level: 8 -*- */

/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * PresenterConsole
 */

/* global SlideShow _ */

class PresenterConsole {
	constructor(map) {
		this._map = map;
		this._map.on('presentationinfo', this._onPresentationInfo, this);
		this._map.on('newpresentinconsole', this._onPresentInConsole, this);
	}

	_onPresentationInfo() {
		if (!this._proxyPresenter) {
			return;
		}
	}

	_onPresentInConsole() {
		this._map.fire('newpresentinwindow');

		this._proxyPresenter = window.open(
			'',
			'_blank',
			'popup,width=500,height=500',
		);
		if (!this._proxyPresenter) {
			this._map.slideShowPresenter._notifyBlockedPresenting();
			return;
		}

		this._proxyPresenter.addEventListener(
			'beforeunload',
			L.bind(this._onClose, this),
		);
		this._proxyPresenter.addEventListener('click', L.bind(this._onClick, this));
		this._proxyPresenter.addEventListener(
			'keydown',
			L.bind(this._onKeyDown, this),
		);

		this._proxyPresenter.document.documentElement.innerHTML =
			this._slideShowPresenter._generateSlideWindowHtml(_('Presenter Console'));

		this._proxyPresenter.document.body.style.margin = '0';
		this._proxyPresenter.document.body.style.padding = '0';
		this._proxyPresenter.document.body.style.height = '50%';
		this._proxyPresenter.document.body.style.overflow = 'hidden';
	}

	_onKeyDown(e) {
		this._map.slideShowPresenter.getNavigator().onKeyDown(e);
	}

	_onClick(e) {
		this._map.slideShowPresenter.getNavigator().onClick(e);
	}

	_onClose() {
		this._proxyPresenter.removeEventListener(
			'click',
			L.bind(this._onClick, this),
		);
		this._proxyPresenter.removeEventListener(
			'keydown',
			L.bind(this._onKeyDown, this),
		);
		delete this._proxyPresenter;
	}
}

SlideShow.PresenterConsole = PresenterConsole;
