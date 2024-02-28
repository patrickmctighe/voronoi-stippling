let points = [];
let colors = [];
let targets = [];
let delaunay, voronoi;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 10; i++) {
    let x = random(width);
    let y = random(height);
    points.push(createVector(x, y));
    targets.push(createVector(x, y)); // Initialize targets with current positions
    colors.push(color(random(255), random(255), random(255)));
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function mousePressed() {
  // Add a large number of points near the mouse position
  for (let i = 0; i < 10; i++) {
    let x = mouseX + random(-50, 50);
    let y = mouseY + random(-50, 50);
    points.push(createVector(x, y));
    targets.push(createVector(x, y));
    colors.push(color(random(255), random(255), random(255)));
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function draw() {
  background(255);

  // Draw Voronoi cells
  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);

  beginShape(); // Begin batch drawing
  for (let i = 0; i < cells.length; i++) {
    let poly = cells[i];
    let col = colors[i];
    fill(col);
    noStroke();
    for (let j = 0; j < poly.length; j++) {
      vertex(poly[j][0], poly[j][1]);
    }
  }
  endShape(CLOSE); // End batch drawing

  // Move points towards targets
  for (let i = 0; i < points.length; i++) {
    points[i].lerp(targets[i], 0.005);
  }

  // Update Voronoi and Delaunay
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function calculateDelaunay(points) {
  let pointsArray = [];
  for (let v of points) {
    pointsArray.push(v.x, v.y);
  }
  return new d3.Delaunay(pointsArray);
}