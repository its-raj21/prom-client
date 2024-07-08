import { inspect } from 'node:util';

// These are from https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
const metricRegexp = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/;
const labelRegexp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function validateMetricName(name) {
	return metricRegexp.test(name);
}

export function validateLabelName(names = []) {
	return names.every(name => labelRegexp.test(name));
}

export function validateLabel(savedLabels, labels) {
	for (const label in labels) {
		if (!savedLabels.includes(label)) {
			throw new Error(
				`Added label "${label}" is not included in initial labelset: ${inspect(
					savedLabels,
				)}`,
			);
		}
	}
}
