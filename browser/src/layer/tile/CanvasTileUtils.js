/* -*- js-indent-level: 8; fill-column: 100 -*- */
/* global Uint32Array Uint8ClampedArray */

// eslint-disable-next-line no-unused-vars
function unpremultiply(rawDelta, byteLength, byteOffset = 0) {
	var len = byteLength / 4;
	var delta32 = new Uint32Array(
		rawDelta.buffer,
		rawDelta.byteOffset + byteOffset,
		len,
	);
	var clamped8 = new Uint8ClampedArray(
		delta32.buffer,
		delta32.byteOffset,
		delta32.byteLength,
	);
	for (var i32 = 0; i32 < len; ++i32) {
		// premultiplied rgba -> unpremultiplied rgba
		var alpha = delta32[i32] >>> 24;
		if (alpha < 255) {
			if (alpha === 0) {
				delta32[i32] = 0;
			} else {
				// dest can remain at ctored 0 if alpha is 0
				var i8 = i32 * 4;
				// forced to do the math
				clamped8[i8] = Math.ceil((rawDelta[i8] * 255) / alpha);
				clamped8[i8 + 1] = Math.ceil((rawDelta[i8 + 1] * 255) / alpha);
				clamped8[i8 + 2] = Math.ceil((rawDelta[i8 + 2] * 255) / alpha);
			}
		}
	}
	return clamped8;
}
