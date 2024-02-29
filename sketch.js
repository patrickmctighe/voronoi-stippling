let points = [];
let colors = [];
let targets = [];
let scales = [];
let scaleSpeeds = [];
let maxScale = 10; // Maximum scale for each cell
let initialScaleSpeed = .0001; // Speed at which each cell grows or shrinks
let delaunay, voronoi;
let center;
let clickedPoint = -1;
let timer = 0;
let growing = true;
let colorChanged = false; // Add this flag outside the draw() function
let targetColors; // Declare targetColors variable
let lerpSpeed = 0.01; // Define lerpSpeed

function setup() {
  createCanvas(windowWidth, windowHeight);
  targetColors = new Array(colors.length).fill(color(0, 0, 0)); // Initialize targetColors here
  for (let i = 0; i < 5; i++) {
    let x = random(width);
    let y = random(height);
    points.push(createVector(x, y));
    colors.push(color(random(255), random(255), random(255)));
targetColors.push(color(255, 255, 255)); 
    scales.push(1);
    scaleSpeeds.push(initialScaleSpeed);
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
  center = createVector(width / 2, height / 2);
}

function mousePressed() {
  let closestPoint = -1;
  let closestDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    let d = dist(mouseX, mouseY, points[i].x, points[i].y);
    if (d < closestDist) {
      closestDist = d;
      closestPoint = i;
    }
  }
  if (closestDist < 10) { 
    clickedPoint = closestPoint;
  }   else {
    for (let i = 0; i < 10; i++) {
      let x = mouseX + random(-50, 50);
      let y = mouseY + random(-50, 50);
      points.push(createVector(x, y));
      targets.push(createVector(x, y));
      colors.push(color(random(255), random(255), random(255)));
      targetColors.push(color(0, 0, 0)); // Add this line
      scales.push(1);
      scaleSpeeds.push(initialScaleSpeed);
    }
    delaunay = calculateDelaunay(points);
    voronoi = delaunay.voronoi([0, 0, width, height]);
  }
}
function mouseDragged() {

    mousePressed();
  
}

function mouseReleased() {
  clickedPoint = -1; 
}




function draw() {
  background(255);

  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);
  let centroids = [];
  let totalMoved = 0;
  let cellDisappeared = false; // Reset the flag here

  for (let i = 0; i < cells.length; i++) {
    let poly = cells[i];
    let col = colors[i];

    if (p5.Vector.dist(points[i], center) > 30) {
      cellDisappeared = true; // Set cellDisappeared to true here

      noStroke();
      beginShape();

      let insideCanvas = true;
      for (let j = 0; j < poly.length; j++) {
        if (poly[j][0] < 0 || poly[j][0] > width || poly[j][1] < 0 || poly[j][1] > height) {
          insideCanvas = false;
          break;
        }
      }

      if (insideCanvas) { // Draw the cell only if it's inside the canvas
        fill(col);
        for (let j = 0; j < poly.length; j++) {
          vertex(poly[j][0], poly[j][1]);
        }
        endShape(CLOSE);
      }
    }

    let centroid = calculateCentroid(poly);
    let moved = p5.Vector.dist(points[i], centroid);
    totalMoved += moved;
    points[i].lerp(centroid, 0.0002);
  }

  // Start the color transition if one cell disappears and the color hasn't been changed yet
  if (cellDisappeared && !colorChanged) {
    for (let j = 0; j < colors.length; j++) {
      targetColors[j] = color(random(200,255), random(200,255), random(200,255)); // Set a random target color
    }
    colorChanged = true; // Set colorChanged to true after starting the color transition
  }

  // Perform the color transition
  if (colorChanged) {
    let allColorsReached = true; // Flag to check if all colors have reached their target

    for (let j = 0; j < colors.length; j++) {
      colors[j] = lerpColor(colors[j], targetColors[j], lerpSpeed); // Lerp the color

      // Check if the color has reached its target
      if (red(colors[j]) != red(targetColors[j]) || green(colors[j]) != green(targetColors[j]) || blue(colors[j]) != blue(targetColors[j])) {
        allColorsReached = false;
      }
    }

    // Reset colorChanged to false if all colors have reached their target
    if (allColorsReached) {
      colorChanged = false;
    }
  }

  if (!growing) {
    for (let i = 0; i < points.length; i++) {
      points[i].lerp(center, 0.01);
    }
  }

  for (let i = 0; i < cells.length; i++) {
    if (growing) {
      scales[i] += scaleSpeeds[i];
      if (scales[i] >= maxScale) {
        scales[i] = maxScale;
      }
    } else {
      scales[i] -= scaleSpeeds[i];
      if (scales[i] <= 1) {
        scales[i] = 1;
      }
    }
  }

  timer++;
  if (timer >= 5) {
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
  centroid.x /= (6.0 * signedArea);
  centroid.y /= (6.0 * signedArea);
  return centroid;
}