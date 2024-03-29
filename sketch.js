let points = [];
let colors = [];
let targets = [];
let scales = [];
let scaleSpeeds = [];
let maxScale = 1; // Maximum scale for each cell
let initialScaleSpeed = .00001; // Speed at which each cell grows or shrinks
let delaunay, voronoi;
let center;
let clickedPoint = -1;
let suckSlider, balanceSlider, timeSlider, amountSlider, color1Slider, color2Slider, holeSlider;


function setup() {
  createCanvas(windowWidth, windowHeight);
  suckSlider = document.getElementById('suckSlider');
  balanceSlider = document.getElementById('balanceSlider');
  timeSlider = document.getElementById('timeSlider');
  amountSlider = document.getElementById('amountSlider');
 
  color1Slider = document.getElementById('color1Slider');
  color2Slider = document.getElementById('color2Slider');
  holeSlider = document.getElementById('holeSlider');
  let color1Value = parseFloat(color1Slider.value);



  for (let i = 0; i < 5; i++) {
    let x = random(width);
    let y = random(height);
    points.push(createVector(x, y));
    colors.push(color(random(color1Value), random(color1Value), random(color1Value)));
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
      colors.push(color(random(color2Value), random(color2Value), random(color2Value)));
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



let timer = 0;
let growing = true;

function draw() {
  background(255);

  let suckValue = parseFloat(suckSlider.value);
  let balanceValue = parseFloat(balanceSlider.value);
  let timeValue = parseFloat(timeSlider.value);

  
  
  
  let holeValue = parseFloat(holeSlider.value);
  
  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);
  let centroids = [];
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
    points[i].lerp(centroid, suckValue);
  }

  if (!growing) {
    for (let i = 0; i < points.length; i++) {
      points[i].lerp(center, balanceValue);
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
  if (timer >= timeValue) {
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