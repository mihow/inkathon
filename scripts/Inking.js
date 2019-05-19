class Inking {
	constructor(options, simpleLayout, penLayout) {
		// this.builder = new InterceptInkBuilder(options);
		this.builderSIMPLE = new InkBuilder(Object.assign({}, options, {layout: simpleLayout}));
		this.builderSIMPLE.id = "SIMPLE"

		this.builderPEN = new InkBuilder(Object.assign({}, options, {layout: penLayout}));
		this.builderPEN.id = "PEN"

		this.phase = null;
		this.strokes = [];

		this.codec = new InkCodec();
	}

	addPoint(input) {
		let sensorPoint = input;

		if (input instanceof Event) {
			if (input.changedTouches) input = input.changedTouches[0];
			sensorPoint = InkBuilder.createSensorPoint(input, Math.max(input.offsetX, 0), Math.max(input.clientY, 0));
		}

		this.builder.add(this.phase, sensorPoint, null);
	}

	begin(e) {
		this.phase = InkBuilder.Phase.BEGIN;

		if (e instanceof PointerEvent && e.pointerType == "pen")
			this.builder = this.builderPEN
		else
			this.builder = this.builderSIMPLE

		this.addPoint(e);
		this.drawPath(this.builder.getPathPart());
	}

	end(e) {
		if (!this.phase) return;
		this.phase = InkBuilder.Phase.END;

		this.addPoint(e);
		this.drawPath(this.builder.getPathPart());

		if (this.strokeRenderer) {
			let stroke = this.strokeRenderer.toStroke(this.builder);
			console.log(stroke);
			this.strokes.push(stroke);
		}

		this.phase = null;
		updateCount();
		updateColor();
	}

	abort() {
		if (!this.phase) return;
		this.phase = null;

		let dirtyArea = RectTools.union(this.strokeRenderer.strokeBounds, this.strokeRenderer.preliminaryDirtyArea);

		this.strokeRenderer.abort();
		this.builder.abort();

		this.refresh(dirtyArea);
	}

	resize(width, height) {
		if (width > screen.deviceWidth) width = screen.deviceWidth;
		if (height > screen.deviceHeight) height = screen.deviceHeight;

		this.canvas.resize(width, height);

		this.refresh();
	}

	redraw(dirtyArea = this.canvas.bounds) {
		this.strokes.forEach(stroke => {
			this.strokeRenderer.draw(stroke);
			this.strokeRenderer.blendStroke(this.strokesLayer);
		});

		this.canvas.clear(dirtyArea);
		this.canvas.blend(this.strokesLayer, {rect: dirtyArea});
	}

	refresh(dirtyArea = this.canvas.bounds) {
		this.canvas.clear(dirtyArea);
		this.canvas.blend(this.strokesLayer, {rect: dirtyArea});
	}

	clear() {
		this.strokesLayer.clear();
		this.canvas.clear();

		this.strokes = [];
		updateCount();
	}

	encode() {
		this.codec.encodeInkData(this.strokes);

		this.codec.encodeDevice(InkDevice.defaults["pen"]);
		this.codec.encodeDevice(InkDevice.defaults["touch"]);
		this.codec.encodeDevice(InkDevice.defaults["mouse"]);

		this.codec.encodeDeviceData();

		return this.codec.encode(InkCodec.DataType.INK_DOCUMENT);
	}

	decode(buffer) {
		return this.codec.decode(buffer, InkCodec.DataType.INK_DOCUMENT);
	}
}
