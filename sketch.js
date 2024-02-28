let points = [];
let colors = [];
let targets = [];
let scales = [];
let maxScale = 10; // Maximum scale for each cell
let scaleSpeed = 1; // Speed at which each cell grows or shrinks
let delaunay, voronoi;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for(let i = 0 ; i < 10; i++){ // Adjust the number of points as per your preference
    let x = random(width);
    let y = random(height);
    points.push(createVector(x, y));
    colors.push(color(random(255), random(255), random(255))); // Assign a random color to each point
    scales.push(1); // Initial scale for each cell
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function mousePressed() {
  // Add a large number of points near the mouse position
  for(let i = 0 ; i < 10; i++){ // Adjust the number of points as per your preference
    let x = mouseX + random(-50, 50); // Adjust the range as per your preference
    let y = mouseY + random(-50, 50); // Adjust the range as per your preference
    points.push(createVector(x, y));
    targets.push(createVector(x, y));
    colors.push(color(random(255), random(255), random(255))); // Assign a random color to each point
    scales.push(1); // Initial scale for each new cell
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function draw() {
  background(255);

  // Draw Voronoi cells and calculate centroids
  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);
  let centroids = [];
  let totalMoved = 0;
  for (let i = 0; i < cells.length; i++){
    let poly = cells[i];
    let col = colors[i]; // Use the color assigned to the point
    fill(col);
    noStroke();
    beginShape();
    for (let j = 0 ; j < poly.length; j++){
      vertex(poly[j][0], poly[j][1]);
    }
    endShape(CLOSE);

    // Calculate centroid and move point towards it
    let centroid = calculateCentroid(poly);
    let moved = p5.Vector.dist(points[i], centroid);
    totalMoved += moved;
    points[i].lerp(centroid, 0.005);
  }

  // Update Delaunay and Voronoi if points have moved a significant distance
  if (totalMoved > 1) {
    delaunay = calculateDelaunay(points);
    voronoi = delaunay.voronoi([0, 0, width, height]);
  }
}

function calculateDelaunay(points){
  let pointsArray = [];
  for(let v of points){
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
  centroid.x /= (6.0 * signedArea);
  centroid.y /= (6.0 * signedArea);
  return centroid;
}