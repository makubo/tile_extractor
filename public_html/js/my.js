var context;
var source_image;
var tile_height;
var tile_width;
var canvas_height;
var canvas_width;
var tile_shiftx;
var tile_shifty;

window.onload = function () {
    context = document.getElementById("main_canvas").getContext('2d');
    source_image = document.createElement("img");

    getTileSize();
    getTileShifts();

    source_image.onload = function () {
        context.canvas.height = this.height;
        context.canvas.width = this.width;
        context.drawImage(this, 0, 0);
        canvas_height = this.height;
        canvas_width = this.width;
        document.getElementById("tile_height").max = this.height;
        document.getElementById("tile_width").max = this.width;
    };

    // Got from here https://www.html5rocks.com/en/tutorials/file/dndfiles/
    document.getElementById("file-input").onchange = function (e) {
        var f = e.target.files[0]; // FileList object

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                source_image.src = e.target.result;
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    };

    document.getElementById("tile_height").onchange = function (e) {
        getTileSize();
        redraw();
    };

    document.getElementById("tile_width").onchange = function (e) {
        getTileSize();
        redraw();
    };

    document.getElementById("tile_shiftx").onchange = function (e) {
        getTileShifts();
        redraw();
    };

    document.getElementById("tile_shifty").onchange = function (e) {
        getTileShifts();
        redraw();
    };

    document.getElementById("main_canvas").onmousemove = function (e) {
        context.drawImage(source_image, 0, 0);
        context.fillStyle = 'rgba(0, 255, 128, 0.5)';
        context.strokeStyle = 'rgba(196, 196, 196, 0.5)';

        var canvas_rect = context.canvas.getBoundingClientRect();
        var mouseCanvasX = e.clientX - canvas_rect.left;
        var mouseCanvasY = e.clientY - canvas_rect.top;

        highlightTile(mouseCanvasX, mouseCanvasY);
        drawGrid();
    };

    document.getElementById("main_canvas").onmousedown = function (e) {
        var canvas_rect = context.canvas.getBoundingClientRect();
        var mouseCanvasX = e.clientX - canvas_rect.left;
        var mouseCanvasY = e.clientY - canvas_rect.top;

        downloadTile(mouseCanvasX, mouseCanvasY);
    };
};

function getTileSize() {
    tile_height = parseInt(document.getElementById("tile_height").value);
    tile_width = parseInt(document.getElementById("tile_width").value);
    document.getElementById("tile_shiftx").max = tile_height - 1;
    document.getElementById("tile_shifty").max = tile_width - 1;
};

function getTileShifts() {
    tile_shiftx = parseInt(document.getElementById("tile_shiftx").value);
    tile_shifty = parseInt(document.getElementById("tile_shifty").value);
};

function redraw() {
    context.drawImage(source_image, 0, 0);
    drawGrid();
};

function drawGrid() {
    context.beginPath();
    for (var y = 0; y <= canvas_height / tile_height; y++) {
        context.moveTo(0, y * tile_height + tile_shifty);
        context.lineTo(canvas_width, y * tile_height + tile_shifty);
    };

    for (var x = 0; x <= canvas_width / tile_width; x++) {
        context.moveTo(x * tile_width + tile_shiftx, 0);
        context.lineTo(x * tile_width + tile_shiftx, canvas_height);
    };

    context.stroke();
};

function downloadTile(x, y) {
    var temp_canvas = document.createElement("canvas");
    var temp_context = temp_canvas.getContext("2d");
    var a = document.createElement("a");

    temp_canvas.width = tile_width;
    temp_canvas.height = tile_height;

    var tileX = getTileCoordinate(x, y).x;
    var tileY = getTileCoordinate(x, y).y;

    temp_context.drawImage(source_image, -tileX, -tileY);
    var tileURL = temp_canvas.toDataURL();

    a.style.display = "none";
    a.download = "tile_" + tile_width + "x" + tile_height + "_"
            + getTileIndex(x, y).x + "." + getTileIndex(x, y).y + ".png";
    document.body.appendChild(a);
    a.href = tileURL;
    a.click();
    a.remove();
    temp_canvas.remove();
};

function highlightTile(x, y) {
    var tileCoord = getTileCoordinate(x, y);
    context.fillRect(tileCoord.x, tileCoord.y, tile_width, tile_height);
};

function getTileIndex(x, y) {
    return {
        x: Math.floor((x - getShifts().x) / tile_width),
        y: Math.floor((y - getShifts().y) / tile_height)
    };
};

function getTileCoordinate(x, y) {
    return {
        x: getTileIndex(x, y).x * tile_width + getShifts().x,
        y: getTileIndex(x, y).y * tile_height + getShifts().y
    };
};

function getShifts() {
    var shiftx = 0;
    var shifty = 0;
    if (tile_shiftx > 0) {
        shiftx = tile_shiftx - tile_width;
    };
    if (tile_shifty > 0) {
        shifty = tile_shifty - tile_height;
    };
    return {
        x: shiftx,
        y: shifty
    };
};
