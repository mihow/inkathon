let debounce = function(fn, delay) {
	var timer = null;

	return function () {
		var context = this;
		var args = arguments;

		clearTimeout(timer);

		timer = setTimeout(function () {
			fn.apply(context, args);
		}, delay);
	};
};

addEventListener("load", () => {
	let width = window.innerWidth - 5
	let height = window.innerHeight - 50

	if (!localStorage.getItem("sample"))
		return;

	let pureGLCanvas = (sample == 2);
	let canvas = document.querySelector("canvas");
	let vInker;
	let rInker;

	let glCanvas = new OffscreenCanvas(width, height);

	vInker = pureGLCanvas ? null : new VectorInking(canvas, width, height)
	rInker = new RasterInking(pureGLCanvas ? canvas : glCanvas, width, height)

	if (!pureGLCanvas)
		rInker.strokeRenderer.streamUpdatedArea = vInker.streamUpdatedArea.bind(vInker);

	let inker = pureGLCanvas ? rInker : vInker;

	window.WILL = inker
	WILL.Color = Color

	WILL.switch = (color) => {
		if (color) {
			inker = vInker
			inker.strokeRenderer.configure({ color })
		}
		else
			inker = rInker
	}

	let resize = debounce(() => inker.resize(window.innerWidth - 5, window.innerHeight - 50), 200)

	let penEvent = false;
	console.log('ready');

	document.addEventListener("pointerdown", e => (penEvent = (e.pointerType == "pen")))
	document.addEventListener("pointerup", e => penEvent = false)

	addEventListener("pointerdown", e => (e.pointerType == "pen") ? inker.begin(e) : undefined)
	addEventListener("pointermove", e => (e.pointerType == "pen") ? inker.move(e) : undefined)
	addEventListener("pointerup", e => (e.pointerType == "pen") ? inker.end(e) : undefined)

	canvas.addEventListener("mousedown", e => penEvent ? undefined : inker.begin(e))
	addEventListener("mousemove", e => penEvent ? undefined : inker.move(e))
	addEventListener("mouseup", e => penEvent ? undefined : inker.end(e))

	canvas.addEventListener("touchstart", e => penEvent ? undefined : inker.begin(e), {passive: true})
	addEventListener("touchmove", e => penEvent ? undefined : inker.move(e), {passive: true})
	addEventListener("touchend", e => penEvent ? undefined : inker.end(e), {passive: true})

	addEventListener("pointercancel", e => {
		if (inker.abort) inker.abort(e)
	})

	addEventListener("resize", resize)
})
