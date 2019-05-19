const SIMPLE_LAYOUT_VECTOR = [
	PathPoint.Property.X,
	PathPoint.Property.Y,
	PathPoint.Property.SIZE
];

const PEN_LAYOUT_VECTOR = [
	PathPoint.Property.X,
	PathPoint.Property.Y,
	PathPoint.Property.SIZE,
	PathPoint.Property.ROTATION,
	PathPoint.Property.SCALE_X,
	PathPoint.Property.SCALE_Y,
	PathPoint.Property.OFFSET_X,
	PathPoint.Property.OFFSET_Y
];

class VectorInking extends Inking {
	constructor(canvas, width, height) {
		super({
			pathPointCalculator: Calculators.vector,
			brushPolygon: BrushPalette.circle.polygon,
			collectSensorData: true
		}, SIMPLE_LAYOUT_VECTOR, PEN_LAYOUT_VECTOR);

		let strokeColor = Color.from(255, 0, 0, 1);

		this.canvas = InkCanvas2D.createInstance(canvas, width, height);
		this.strokesLayer = this.canvas.createLayer();
		this.bitmapLayer = this.canvas.createLayer();

		this.strokeRenderer = new StrokeRenderer2D(this.canvas);
		this.strokeRenderer.configure({brush: BrushPalette.circle, color: strokeColor});
	}

	drawPath(pathPart) {
		if (!pathPart.added.length) return;

		this.strokeRenderer.draw(pathPart.added, this.phase == InkBuilder.Phase.END);

		if (this.phase == InkBuilder.Phase.UPDATE) {
			let color = this.strokeRenderer.color;

			if (localStorage.getItem("showPreliminary"))
				this.strokeRenderer.color = Color.from(192, 192, 192);

			this.strokeRenderer.drawPreliminary(pathPart.predicted);

			//this.strokeRenderer.color = color;

			let dirtyArea = RectTools.intersect(this.strokeRenderer.updatedArea, this.canvas.bounds);

			if (dirtyArea) {
				this.canvas.clear(dirtyArea);
				this.canvas.blend(this.strokesLayer, {rect: dirtyArea});
			}

			this.strokeRenderer.blendUpdatedArea();
		}
		else if (this.phase == InkBuilder.Phase.END) {
			let dirtyArea = RectTools.intersect(this.strokeRenderer.updatedArea, this.canvas.bounds);

			if (dirtyArea) {
				this.canvas.clear(dirtyArea);
				this.canvas.blend(this.strokesLayer, {rect: dirtyArea});
			}

			dirtyArea = RectTools.intersect(this.strokeRenderer.strokeBounds, this.canvas.bounds);

			if (dirtyArea) {
				this.strokeRenderer.blendStroke(this.strokesLayer);

				this.canvas.clear(dirtyArea);
				this.canvas.blend(this.strokesLayer, {rect: dirtyArea});
			}
		}
	}

	streamUpdatedArea(data, updatedArea, complete) {
		this.bitmapLayer.clear();
		this.bitmapLayer.writePixels(data, updatedArea);

		this.canvas.clear(updatedArea);
		this.canvas.blend(this.strokesLayer, {rect: updatedArea});
		this.canvas.blend(this.bitmapLayer, {rect: updatedArea});

		if (complete) {
			this.strokesLayer.blend(this.bitmapLayer, {rect: updatedArea});

			this.canvas.clear(updatedArea);
			this.canvas.blend(this.strokesLayer, {rect: updatedArea});
		}
	}

	move(e) {
		if (!this.phase) return;
		this.phase = InkBuilder.Phase.UPDATE;

		this.addPoint(e);

		if (!this.requested) {
			this.requested = true;

			requestAnimationFrame(() => {
				this.requested = false;

				if (!this.phase) return;
				this.drawPath(this.builder.getPathPart());
			});
		}
	}
}
