let seedPoints = [];
let delaunay;

function setup() {
  createCanvas(400, 400);
  for(let i = 0 ; i< 100; i++){
    seedPoints[i] = createVector(random(width), random(height));
  }
  delaunay = calculateDelaunay(seedPoints);
}

function draw() {
  background(255);

  for(let v of seedPoints){
    stroke(0);
    strokeWeight(4);
    point(v.x, v.y);
  }



  let voronoi = delaunay.voronoi([0, 0, width, height]);
  let polygons = voronoi.cellPolygons();
  for (let poly of polygons){
    stroke(0);
    strokeWeight(1);
    noFill();
    beginShape();
  for (let i= 0 ; i<poly.length; i++){
    vertex(poly[i][0], poly[i][1]);

  }
  endShape();
  }
}

function calculateDelaunay(points){
  let pointsArray = [];
  for(let v of points){
    pointsArray.push(v.x, v.y);
  }
  
  return new d3.Delaunay(pointsArray);
}