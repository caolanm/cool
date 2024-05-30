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

// eslint-disable-next-line no-unused-vars
function unpremultiply(rawDelta : Uint8Array, byteLength : number, byteOffset = 0) {
	for (var i8 = byteOffset; i8 < byteLength + byteOffset; i8 += 4) {
		// premultiplied rgba -> unpremultiplied rgba
		var alpha = rawDelta[i8 + 3];
		if (alpha < 255) {
			if (alpha === 0) {
				rawDelta[i8] = 0;
				rawDelta[i8 + 1] = 0;
				rawDelta[i8 + 2] = 0;
			} else {
				// forced to do the math
				rawDelta[i8] = Math.ceil((rawDelta[i8] * 255) / alpha);
				rawDelta[i8 + 1] = Math.ceil((rawDelta[i8 + 1] * 255) / alpha);
				rawDelta[i8 + 2] = Math.ceil((rawDelta[i8 + 2] * 255) / alpha);
			}
		}
	}
}
