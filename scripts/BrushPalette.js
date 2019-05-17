let BrushPalette = {
	circle: new PolygonBrush(PolygonBrush.createCircle(), "circle"),
	pencil: new ParticleBrush(0.15, 0.15, ParticleBrush.RotationMode.RANDOM, "/textures/essential_shape_11.png", "/textures/essential_fill_11.png"),
	paws: new ParticleBrush(0.15, 0.15, ParticleBrush.RotationMode.TRAJECTORY, "/textures/paws_shape.png", "/textures/essential_fill_11.png"),
	mipmap: new ParticleBrush(0.035, 0, ParticleBrush.RotationMode.NONE, [
		"/textures/fountain_brush_128x128.png",
		"/textures/fountain_brush_64x64.png",
		"/textures/fountain_brush_32x32.png",
		"/textures/fountain_brush_16x16.png",
		"/textures/fountain_brush_8x8.png",
	], "/textures/essential_fill_8.png"),
	mixedShapes: new ParticleBrush(0.035, 0, ParticleBrush.RotationMode.NONE, [
		"../textures/paws_shape_128x128.png",
		"../textures/paws_shape_64x64.png",
		"../textures/paws_shape_32x32.png",
		"../textures/paws_shape_16x16.png"
	], "../textures/essential_fill_8.png")
};

BrushPalette.pencil.id = "pencil";
BrushPalette.paws.id = "paws";
BrushPalette.mipmap.id = "mipmap";
BrushPalette.mixedShapes.id = "mixedShapes";

BrushPalette.loadFile = function(src) {
	return fetch(src, {mode: "no-cors"}).then(response => response.arrayBuffer()).then(buffer => new Uint8Array(buffer));
}

BrushPalette.loadFiles = function(brushID) {
	let brush = BrushPalette[brushID];

	return new Promise((resolve, reject) => {
		let shape;
		let fill;

		if (Array.isArray(brush.shape)) {
			let mipmap = [];

			let queue = Promise.resolve();

			brush.shape.forEach(src => {
				queue = queue
					.then(() => BrushPalette.loadFile(src)
					.then(bytes => mipmap.push(bytes)));
			});

			queue
				.then(() => shape = mipmap)
				.then(() => BrushPalette.loadFile(brush.fill))
				.then(bytes => fill = bytes)
				.then(() => resolve({shape, fill}))
				.catch(reject);
		}
		else {
			BrushPalette.loadFile(brush.shape)
				.then(bytes => shape = bytes)
				.then(() => BrushPalette.loadFile(brush.fill))
				.then(bytes => fill = bytes)
				.then(() => resolve({shape, fill}))
				.catch(reject);
		}
	});
}

InkCodec.getStrokeBrush = function(brushID) {
	return BrushPalette[brushID];
}

InkCodec.getDevice = function(deviceID) {
	return InkDevice.defaults[deviceID];
}
