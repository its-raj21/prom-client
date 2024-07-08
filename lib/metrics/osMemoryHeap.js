import Gauge from '../gauge.js';
import linuxVariant, {
	metricNames as linuxMetricNames,
} from './osMemoryHeapLinux.js';
import safeMemoryUsage from './helpers/safeMemoryUsage.js';

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';

function notLinuxVariant(registry, config = {}) {
	const namePrefix = config.prefix ? config.prefix : '';
	const labels = config.labels ? config.labels : {};
	const labelNames = Object.keys(labels);

	new Gauge({
		name: namePrefix + PROCESS_RESIDENT_MEMORY,
		help: 'Resident memory size in bytes.',
		registers: registry ? [registry] : undefined,
		labelNames,
		collect() {
			const memUsage = safeMemoryUsage();

			// I don't think the other things returned from `process.memoryUsage()` is relevant to a standard export
			if (memUsage) {
				this.set(labels, memUsage.rss);
			}
		},
	});
}

export default (registry, config) =>
	process.platform === 'linux'
		? linuxVariant(registry, config)
		: notLinuxVariant(registry, config);

export const metricNames =
	process.platform === 'linux' ? linuxMetricNames : [PROCESS_RESIDENT_MEMORY];
