/* -*- js-indent-level: 8; fill-column: 100 -*- */
/* eslint-disable no-inner-declarations */
/* global importScripts Uint8Array */

if ('undefined' === typeof window) {
	importScripts('../../node_modules/fzstd/umd/index.js');
	importScripts('../layer/tile/CanvasTileUtils.js');
	addEventListener('message', onMessage);

	console.log('MessagePreProcessor initialised', self.fzstd);

	function onMessage(e) {
		switch (e.data.message) {
			case 'tile-process':
				var buffer = e.data.buffer;
				var offset = 0;
				var processed = [];
				var buffers = [buffer.buffer];
				for (const tile of e.data.tiles) {
					var startOffset = offset;
					var stream = new self.fzstd.Decompress((chunk, _isLast) => {
						buffer.set(chunk, offset);
						offset += chunk.length;
					});
					stream.push(tile.rawData);
					var delta = new Uint8Array(buffer.buffer, startOffset, offset - startOffset);
					if (tile.isKeyframe) {
						self.unpremultiply(delta, delta.length);
					} else {
						for (var i = 0; i < delta.length; ++i) {
							switch (delta[i]) {
								case 99: // 'c': // copy row
									i += 4;
									break;
								case 100: // 'd': // new run
									var span = delta[i + 3] * 4;
									i += 4;
									self.unpremultiply(delta, span, i);
									i += span - 1;
									break;
								case 116: // 't': // terminate delta
									break;
								default:
									console.error(
										'[' + i + ']: ERROR: Unknown delta code ' + delta[i],
									);
									i = delta.length;
									break;
							}
						}
					}
					processed.push({'id': tile.id, 'rawData': tile.rawData, 'processedData': delta });
					buffers.push(tile.rawData.buffer);
				}
				postMessage({ message: e.data.message, tiles: processed, buffer: buffer}, buffers);
				break;

			default:
				console.error('Unrecognised preprocessor message', e);
		}
	}
}
