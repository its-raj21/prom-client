import Gauge from '../gauge.js';
import { readdirSync } from 'node:fs';
import { platform } from 'node:process';

const PROCESS_OPEN_FDS = 'process_open_fds';

export default (registry, config = {}) => {
	if (platform !== 'linux') {
		return;
	}

	const namePrefix = config.prefix ? config.prefix : '';
	const labels = config.labels ? config.labels : {};
	const labelNames = Object.keys(labels);

	new Gauge({
		name: namePrefix + PROCESS_OPEN_FDS,
		help: 'Number of open file descriptors.',
		registers: registry ? [registry] : undefined,
		labelNames,
		collect() {
			try {
				const fds = readdirSync('/proc/self/fd');
				// Minus 1 to not count the fd that was used by readdirSync(),
				// it's now closed.
				this.set(labels, fds.length - 1);
			} catch {
				// noop
			}
		},
	});
};

export const metricNames = [PROCESS_OPEN_FDS];
