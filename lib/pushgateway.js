import url from 'node:url';
import http from 'node:http';
import https from 'node:https';
import { gzipSync } from 'node:zlib';
import { globalRegistry } from './registry.js';

class Pushgateway {
	constructor(gatewayUrl, options, registry) {
		if (!registry) {
			registry = globalRegistry;
		}
		this.registry = registry;
		this.gatewayUrl = gatewayUrl;
		const { requireJobName, ...requestOptions } = {
			requireJobName: true,
			...options,
		};
		this.requireJobName = requireJobName;
		this.requestOptions = requestOptions;
	}

	pushAdd(params = {}) {
		if (this.requireJobName && !params.jobName) {
			throw new Error('Missing jobName parameter');
		}

		return useGateway.call(this, 'POST', params.jobName, params.groupings);
	}

	push(params = {}) {
		if (this.requireJobName && !params.jobName) {
			throw new Error('Missing jobName parameter');
		}

		return useGateway.call(this, 'PUT', params.jobName, params.groupings);
	}

	delete(params = {}) {
		if (this.requireJobName && !params.jobName) {
			throw new Error('Missing jobName parameter');
		}

		return useGateway.call(this, 'DELETE', params.jobName, params.groupings);
	}
}
async function useGateway(method, job, groupings) {
	// `URL` first added in v6.13.0
	// eslint-disable-next-line n/no-deprecated-api
	const url_with_path = new url.URL(path, this.gatewayUrl);
	//const gatewayUrlParsed = parse(this.gatewayUrl);
	const gatewayUrlPath =
		url_with_path.pathname && url_with_path.pathname !== '/'
			? url_with_path.pathname
			: '';
	const jobPath = job
		? `/job/${encodeURIComponent(job)}${generateGroupings(groupings)}`
		: '';
	const path = `${gatewayUrlPath}/metrics${jobPath}`;

	// eslint-disable-next-line n/no-deprecated-api
	//const target = _resolve(this.gatewayUrl, path);
	// eslint-disable-next-line n/no-deprecated-api
	//const requestParams = parse(target);
	const httpModule = isHttps(url_with_path.href) ? https : http;
	const options = Object.assign(url_with_path, this.requestOptions, {
		method,
	});

	return new Promise((resolve, reject) => {
		if (method === 'DELETE' && options.headers) {
			delete options.headers['Content-Encoding'];
		}
		const req = httpModule.request(options, resp => {
			let body = '';
			resp.setEncoding('utf8');
			resp.on('data', chunk => {
				body += chunk;
			});
			resp.on('end', () => {
				if (resp.statusCode >= 400) {
					reject(
						new Error(`push failed with status ${resp.statusCode}, ${body}`),
					);
				} else {
					resolve({ resp, body });
				}
			});
		});
		req.on('error', err => {
			reject(err);
		});

		req.on('timeout', () => {
			req.destroy(new Error('Pushgateway request timed out'));
		});

		if (method !== 'DELETE') {
			this.registry
				.metrics()
				.then(metrics => {
					if (
						options.headers &&
						options.headers['Content-Encoding'] === 'gzip'
					) {
						metrics = gzipSync(metrics);
					}
					req.write(metrics);
					req.end();
				})
				.catch(err => {
					reject(err);
				});
		} else {
			req.end();
		}
	});
}

function generateGroupings(groupings) {
	if (!groupings) {
		return '';
	}
	return Object.keys(groupings)
		.map(
			key =>
				`/${encodeURIComponent(key)}/${encodeURIComponent(groupings[key])}`,
		)
		.join('');
}

function isHttps(href) {
	return href.search(/^https/) !== -1;
}

export default Pushgateway;
