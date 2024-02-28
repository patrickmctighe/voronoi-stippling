let points = [];
let colors = [];
let targets = [];
let delaunay, voronoi;

function setup() {
  createCanvas(828, 1036);
  for(let i = 0 ; i < 100; i++){ // Adjust the number of points as per your preference
    let x = random(width);
    let y = random(height);
    points.push(createVector(x, y));
    colors.push(color(random(255), random(255), random(255))); // Assign a random color to each point
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function mousePressed() {
  // Add a large number of points near the mouse position
  for(let i = 0 ; i < 100; i++){ // Adjust the number of points as per your preference
    let x = mouseX + random(-50, 50); // Adjust the range as per your preference
    let y = mouseY + random(-50, 50); // Adjust the range as per your preference
    points.push(createVector(x, y));
    targets.push(createVector(x, y));
    colors.push(color(random(255), random(255), random(255))); // Assign a random color to each point
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function draw() {
  background(255);

  // Draw points
  for(let i = 0; i < points.length; i++){
    let v = points[i];
    stroke(0);
    strokeWeight(4);
    point(v.x, v.y);
  }

  // Draw Voronoi cells
  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);

 
  for (let i = 0; i < cells.length; i++){
    let poly = cells[i];
    let col = colors[i]; // Use the color assigned to the point
    fill(col);
    stroke(0);
    strokeWeight(1);
    beginShape();
    for (let j = 0 ; j < poly.length; j++){
      vertex(poly[j][0], poly[j][1]);
    }
    endShape(CLOSE);
  }

  // Compute centroids and move points towards them
  let centroids = new Array(cells.length);
  let weights = new Array(cells.length).fill(0);

  for(let i = 0; i < centroids.length; i++){
    centroids[i] = createVector(0, 0);
  }

  for (let i = 0 ; i < width; i++){
    for (let j = 0 ; j < height; j++){
      let delaunayIndex = delaunay.find(i, j);
      centroids[delaunayIndex].x += i;
      centroids[delaunayIndex].y += j;
      weights[delaunayIndex]++;
    }
  }

  for(let i = 0; i < centroids.length; i++){
    if(weights[i] > 0){  
      centroids[i].div(weights[i]);
    } else {
      centroids[i] = points[i].copy();
    }
  }

  for (let i = 0; i < points.length; i++){
    points[i].lerp(targets[i], 0.1);
  }

  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function calculateDelaunay(points){
  let pointsArray = [];
  for(let v of points){
    pointsArray.push(v.x, v.y);
  }
  return new d3.Delaunay(pointsArray);
}