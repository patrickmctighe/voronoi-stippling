let points = [];
let colors = [];
let targets = [];
let scales = [];
let scaleSpeeds = [];
let maxScale = 1;
let initialScaleSpeed = 0.00001;
let delaunay, voronoi;
let center;
let clickedPoint = -1;
let lastMouseDraggedCall = 0;
let suckSlider,
  balanceSlider,
  timeSlider,
  amountSlider,
  color2Slider,
  holeSlider,
  growTimeSlider,
  shrinkTimeSlider;
var sliders = document.querySelectorAll(".slider");
document.querySelector(".open").addEventListener("click", function () {
  document.querySelector(".slidersContainer").style.display = "flex";
  document.querySelector(".open").style.display = "none";
});

document.querySelector(".close").addEventListener("click", function () {
  document.querySelector(".slidersContainer").style.display = "none";
  document.querySelector(".open").style.display = "flex";
});

document.getElementById("resetButton").addEventListener("click", function () {
  points = [];
  colors = [];
  background(255);
  setup();
});

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  draw();
  console.log("resized");
}

for (var i = 0; i < sliders.length; i++) {
  sliders[i].addEventListener("input", function () {
    var amountDiv = this.parentNode.querySelector(".amount");
    amountDiv.textContent = this.value;
  });
  sliders[i].addEventListener("mousedown", function (event) {
    event.stopPropagation();
  });
  sliders[i].dispatchEvent(new Event("input"));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  suckSlider = document.getElementById("suckSlider");
  balanceSlider = document.getElementById("balanceSlider");
  timeSlider = document.getElementById("timeSlider");
  amountSlider = document.getElementById("amountSlider");

  growTimeSlider = document.getElementById("growTimeSlider");
  shrinkTimeSlider = document.getElementById("shrinkTimeSlider");

  color2Slider = document.getElementById("color2Slider");
  holeSlider = document.getElementById("holeSlider");

  for (let i = 0; i < 5; i++) {
    let x = random(width);
    let y = random(height);
    points.push(createVector(x, y));
    colors.push(color(random(255), random(255), random(255)));
    scales.push(1);
    scaleSpeeds.push(initialScaleSpeed);
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
  center = createVector(width / 2, height / 2);
}

function mousePressed() {
  let closestPoint = 1;
  let closestDist = Infinity;

  let color2Value = parseFloat(color2Slider.value);
  let holeValue = parseFloat(holeSlider.value);
  let amountValue = parseFloat(amountSlider.value);

  for (let i = 0; i < points.length; i++) {
    let d = dist(mouseX, mouseY, points[i].x, points[i].y);
    if (d < closestDist) {
      closestDist = d;
      closestPoint = i;
    }
  }
  if (closestDist < holeValue) {
    clickedPoint = closestPoint;
  } else {
    for (let i = 0; i < amountValue; i++) {
      let x = mouseX + random(-50, 50);
      let y = mouseY + random(-50, 50);
      points.push(createVector(x, y));
      targets.push(createVector(x, y));
      colors.push(
        color(random(color2Value), random(color2Value), random(color2Value))
      );
      scales.push(1);
      scaleSpeeds.push(initialScaleSpeed);
    }
    delaunay = calculateDelaunay(points);
    voronoi = delaunay.voronoi([0, 0, width, height]);
  }
}
function mouseDragged() {
  let now = Date.now();
  if (now - lastMouseDraggedCall > 50) {
    mousePressed();
    lastMouseDraggedCall = now;
  }
}

function mouseReleased() {
  clickedPoint = -1;
}

let timer = 0;
let growing = true;

function draw() {
  background(255);

  let suckValue = parseFloat(suckSlider.value);
  let balanceValue = parseFloat(balanceSlider.value);

  let growTimeValue = parseFloat(growTimeSlider.value);
  let shrinkTimeValue = parseFloat(shrinkTimeSlider.value);

  let holeValue = parseFloat(holeSlider.value);

  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);
  let totalMoved = 0;
  for (let i = 0; i < cells.length; i++) {
    let poly = cells[i];
    let col = colors[i];
    if (p5.Vector.dist(points[i], center) > holeValue) {
      fill(col);
      noStroke();
      beginShape();
      for (let j = 0; j < poly.length; j++) {
        vertex(poly[j][0], poly[j][1]);
      }
      endShape(CLOSE);
    }

    let centroid = calculateCentroid(poly);
    let moved = p5.Vector.dist(points[i], centroid);
    totalMoved += moved;
    points[i].lerp(centroid, balanceValue);
  }

  if (!growing) {
    for (let i = 0; i < points.length; i++) {
      points[i].lerp(center, suckValue);
    }
  }

  for (let i = 0; i < cells.length; i++) {
    let targetScale = growing ? maxScale : 1;
    scales[i] = lerp(scales[i], targetScale, scaleSpeeds[i]);
  }

  timer++;
  if (growing && timer >= growTimeValue) {
    timer = 0;
    growing = !growing;
  } else if (!growing && timer >= shrinkTimeValue) {
    timer = 0;
    growing = !growing;
  }

  if (totalMoved > 1) {
    delaunay = calculateDelaunay(points);
    voronoi = delaunay.voronoi([0, 0, width, height]);
  }
}
function calculateDelaunay(points) {
  let pointsArray = [];
  for (let v of points) {
    pointsArray.push([v.x, v.y]);
  }
  return d3.Delaunay.from(pointsArray);
}

function calculateCentroid(poly) {
  let centroid = createVector(0, 0);
  let signedArea = 0;
  for (let i = 0; i < poly.length; i++) {
    let x0 = poly[i][0];
    let y0 = poly[i][1];
    let x1 = poly[(i + 1) % poly.length][0];
    let y1 = poly[(i + 1) % poly.length][1];
    let a = x0 * y1 - x1 * y0;
    signedArea += a;
    centroid.x += (x0 + x1) * a;
    centroid.y += (y0 + y1) * a;
  }
  signedArea *= 0.5;
  centroid.x /= 6.0 * signedArea;
  centroid.y /= 6.0 * signedArea;
  return centroid;
}
