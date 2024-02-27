let points = [];
let delaunay, voronoi;
let bubbas;

function preload(){
  bubbas = loadImage('sadie.png');
}

function setup() {
  createCanvas(828, 1036);
  for(let i = 0 ; i< 70000; i++){
    let x = random(width);
    let y = random(height);
    let col = bubbas.get(x, y);
    if(random(100)> brightness(col)){
      points.push(createVector(x,y));
    } else{
      i--;
    }
    
  }
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
  // noLoop();
}

function draw() {
  background(255);

  for(let v of points){
    let col = bubbas.get(v.x, v.y);
    stroke(col);
    strokeWeight(4);
   point(v.x, v.y);
  }

  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);

  // for (let i = 0; i < cells.length; i++){
  //   let poly = cells[i];
  //   let col = bubbas.get(points[i].x, points[i].y);
  //   fill(col);
  //   stroke(0);
  //   strokeWeight(1);
  //   beginShape();
  //   for (let j = 0 ; j < poly.length; j++){
  //     vertex(poly[j][0], poly[j][1]);
  //   }
  //   endShape(CLOSE);
  // }

  let centroids = new Array(cells.length);
let weights = new Array(cells.length).fill(0);

for(let i= 0 ; i <centroids.length; i++){
  centroids[i] = createVector(0,0)
}
bubbas.loadPixels();
let delaunayIndex= 0
for (let i= 0 ; i<width; i++){
  for (let j= 0 ; j<height; j++){
    let index = i+j * width * 4;
    let r = bubbas.pixels[index + 0];
    let g = bubbas.pixels[index + 1];
    let b = bubbas.pixels[index + 2];
    let bright= (r+g+b)/3;
    let weight = 1 - bright/255;
    delaunayIndex = delaunay.find(i, j, delaunayIndex);
    centroids[delaunayIndex].x += i * weight;
    centroids[delaunayIndex].y += j * weight;
    weights[delaunayIndex] += weight;
  }
}

for(let i = 0; i< centroids.length; i++){
  if(weights[i] > 0){  centroids[i].div(weights[i]);}

else{
  centroids= points[i].copy();
}

}


for (let i = 0 ; i< points.length; i++){
  points[i].lerp(centroids[i], 0.01);
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