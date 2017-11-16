import config from '../../config.js';

export function checkContentType(response, expected = 'application/json') {
	const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf(expected) === -1) {
		throw new Error(`Expected ${expected} but got ${contentType}`);
  }
}
