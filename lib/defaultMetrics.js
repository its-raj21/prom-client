import { isObject } from './util.js';

// Default metrics.
import processCpuTotal from './metrics/processCpuTotal.js';
import processStartTime from './metrics/processStartTime.js';
import osMemoryHeap from './metrics/osMemoryHeap.js';
import processOpenFileDescriptors from './metrics/processOpenFileDescriptors.js';
import processMaxFileDescriptors from './metrics/processMaxFileDescriptors.js';
import eventLoopLag from './metrics/eventLoopLag.js';
import processHandles from './metrics/processHandles.js';
import processRequests from './metrics/processRequests.js';
import processResources from './metrics/processResources.js';
import heapSizeAndUsed from './metrics/heapSizeAndUsed.js';
import heapSpacesSizeAndUsed from './metrics/heapSpacesSizeAndUsed.js';
import version from './metrics/version.js';
import gc from './metrics/gc.js';

const metrics = {
	processCpuTotal,
	processStartTime,
	osMemoryHeap,
	processOpenFileDescriptors,
	processMaxFileDescriptors,
	eventLoopLag,
	...(typeof process.getActiveResourcesInfo === 'function'
		? { processResources }
		: {}),
	processHandles,
	processRequests,
	heapSizeAndUsed,
	heapSpacesSizeAndUsed,
	version,
	gc,
};
const metricsList = Object.keys(metrics);

export default function collectDefaultMetrics(config) {
	if (config !== null && config !== undefined && !isObject(config)) {
		throw new TypeError('config must be null, undefined, or an object');
	}

	config = { eventLoopMonitoringPrecision: 10, ...config };

	for (const metric of Object.values(metrics)) {
		metric(config.register, config);
	}
}

const _metricsList = metricsList;
export { _metricsList as metricsList };
