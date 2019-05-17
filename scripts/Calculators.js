let Calculators = {
	vector: function pathPointCalculator(previous, current, next) {
		// x, y, z, size, red, green, blue, alpha, rotation, scaleX, scaleY, scaleZ, offsetX, offsetY, offsetZ
		let point = new PathPoint(current.x, current.y);

		if (isNaN(current.force)) {
			// previous, current, next, minValue, maxValue, initialValue, finalValue, minSpeed, maxSpeed, remap
			point.size = InkBuilder.calculateBasedOnSpeed(previous, current, next, 4, 12, 0.5, null, 100, 4000, v => v);
		}
		else {
			point.size = 0.5 + 10 * current.force + 3.0 * Math.cos(current.altitudeAngle);

			if (previous != null) {
				let prev = previous.computedAzimuthAngle || previous.azimuthAngle;
				let cur = current.azimuthAngle;

				if (cur > prev) {
					let d1 = cur - prev;
					let cur1 = (cur - 2 * Math.PI);
					let d2 = prev - cur1;

					point.rotation = (d1 < d2) ? cur : cur1;
				}
				else {
					let cur1 = (cur + 2 * Math.PI);
					let d1 = cur1 - prev;
					let d2 = prev - cur;

					point.rotation = (d1 < d2) ? cur1 : cur;
				}
			}
			else
				point.rotation = current.azimuthAngle;

			current.computedAzimuthAngle = point.rotation;

			let cosAltitudeAngle = Math.cos(current.altitudeAngle);

			point.scaleX = 1.0 + 1.11 * cosAltitudeAngle;
			point.offsetX = 0.5 * point.size * cosAltitudeAngle;

			point.scaleY = 1.0;
			point.offsetY = 0;
		}

		return point;
	},

	raster: function pathPointCalculator(previous, current, next) {
		// x, y, z, size, red, green, blue, alpha, rotation, scaleX, scaleY, scaleZ, offsetX, offsetY, offsetZ
		let point = new PathPoint(current.x, current.y);

		if (isNaN(current.force)) {
			// previous, current, next, minValue, maxValue, initialValue, finalValue, minSpeed, maxSpeed, remap
			point.size = InkBuilder.calculateBasedOnSpeed(previous, current, next, 2, 3 * 2.5, 3 * 0.5, null, 100, 4000, v => v);
			point.alpha = InkBuilder.calculateBasedOnSpeed(previous, current, next, 0.05, 0.2, 0.1, null, 100, 1000);

			// point.rotation = 0;
			// point.scaleX = 1;
			// point.scaleY = 1;
			// point.offsetX = 0;
			// point.offsetY = 0;
		}
		else {
			// size = 0.5 + 10 * current.force + 3.0 * Math.cos(current.altitudeAngle);
			point.size = 2 + 2 * current.force;
			point.alpha = 0.1 + 0.05 * current.force;

			if (previous != null) {
				let prev = previous.computedAzimuthAngle || previous.azimuthAngle;
				let cur = current.azimuthAngle;

				if (cur > prev) {
					let d1 = cur - prev;
					let cur1 = (cur - 2 * Math.PI);
					let d2 = prev - cur1;

					point.rotation = (d1 < d2) ? cur : cur1;
				}
				else {
					let cur1 = (cur + 2 * Math.PI);
					let d1 = cur1 - prev;
					let d2 = prev - cur;

					point.rotation = (d1 < d2) ? cur1 : cur;
				}
			}
			else
				point.rotation = current.azimuthAngle;

			current.computedAzimuthAngle = point.rotation;

			let cosAltitudeAngle = Math.cos(current.altitudeAngle);

			// point.scaleX = 1.0 + 1.11 * cosAltitudeAngle;
			point.scaleX = 1.0 + 4.11 * cosAltitudeAngle;
			point.offsetX = 0.5 * point.size * 1.11 * cosAltitudeAngle;

			point.scaleY = 1;
			point.offsetY = 0;
		}

		point.red = Math.ceil((1 - point.alpha) * 255);
		point.green = Math.ceil(Math.max(0.8 - point.alpha, 0.3) * 255);
		point.blue = Math.ceil(Math.min(1.9 * point.alpha, 1) * 255);

		return point;
	}
};
