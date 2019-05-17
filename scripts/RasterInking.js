const SIMPLE_LAYOUT_RASTER = [
	PathPoint.Property.X,
	PathPoint.Property.Y,
	PathPoint.Property.SIZE,
	PathPoint.Property.ALPHA
];

const PEN_LAYOUT_RASTER = [
	PathPoint.Property.X,
	PathPoint.Property.Y,
	PathPoint.Property.SIZE,
	PathPoint.Property.ALPHA,
	PathPoint.Property.ROTATION,
	PathPoint.Property.SCALE_X,
	PathPoint.Property.SCALE_Y,
	PathPoint.Property.OFFSET_X,
	PathPoint.Property.OFFSET_Y
];

class RasterInking extends Inking {
	constructor(canvas, width, height) {
		super({
			pathPointCalculator: Calculators.raster,
			spacing: BrushPalette.pencil.spacing,
			particles: true,
			collectSensorData: true
		}, SIMPLE_LAYOUT_RASTER, PEN_LAYOUT_RASTER);

		let strokeColor = Color.from(74, 74, 74, 0.1);

		this.canvas = InkCanvasGL.createInstance(canvas, width, height);
		this.strokesLayer = this.canvas.createLayer();

		this.strokeRenderer = new StrokeRendererGL(this.canvas);

		BrushPalette.pencil.configure(this.canvas.ctx).then(() => this.strokeRenderer.configure({brush: BrushPalette.pencil, color: strokeColor})).catch(console.error);
	}

	drawPath(pathPart) {
		if (!pathPart.added.length) return;

		this.strokeRenderer.draw(pathPart.added, this.phase == InkBuilder.Phase.END);

		if (this.phase == InkBuilder.Phase.UPDATE) {
			let color = this.strokeRenderer.color;

			if (localStorage.getItem("showPreliminary"))
				this.strokeRenderer.color = Color.RED;

			this.strokeRenderer.drawPreliminary(pathPart.predicted);

			this.strokeRenderer.color = color;

			this.canvas.clear(this.strokeRenderer.updatedArea);
			this.canvas.blend(this.strokesLayer, {rect: this.strokeRenderer.updatedArea});

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

	move(e) {
		if (!this.phase) return;
		this.phase = InkBuilder.Phase.UPDATE;

		this.addPoint(e);

		if (this.frameID != this.canvas.frameID) {
			this.frameID = this.canvas.requestAnimationFrame(() => {
				if (!this.phase) return;
				this.drawPath(this.builder.getPathPart());
			}, true);
		}
	}
}
