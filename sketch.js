let points = [];
let delaunay, voronoi;

function setup() {
  createCanvas(600, 600);
  for(let i = 0 ; i< 1000; i++){
    points[i] = createVector(random(width), random(height));
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function draw() {
  background(255);

  for(let v of points){
    stroke(0);
    strokeWeight(4);
    point(v.x, v.y);
  }



 


  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);
  for (let poly of cells){
    stroke(0);
    strokeWeight(1);
    noFill();
    beginShape();
  for (let i= 0 ; i<poly.length; i++){
    vertex(poly[i][0], poly[i][1]);

  }
  endShape();
  }

  let centroids =[];
for(let poly of cells){
let centroid = createVector(0, 0);
for (let i = 0; i < poly.length; i++){
  centroid.x += poly[i][0];
  centroid.y += poly[i][1];
}
centroid.div(poly.length);
centroids.push(centroid);
}
for (let i = 0 ; i< points.length; i++){
  points[i].lerp(centroids[i], 0.1);
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