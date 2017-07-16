//var myPolygon;
var map;
var polygonCreationZone = 0.001;
var joiningDistance = 4;

var polygons = [];
var id = 1;

function initialize() {
  // Map Center
  var myLatLng = new google.maps.LatLng(49.278448, 20.480067);
  // General Options
  var mapOptions = {
    zoom: 12,
    center: myLatLng,
    mapTypeId: google.maps.MapTypeId.RoadMap
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

  google.maps.event.addListener(map, 'click', function(event) {
    createPolygonAroundPoint(event.latLng);
  });
}

//Display Coordinates below map
function getPolygonCoords(index) {
  var path = this;
  var btnDelete = getDeleteButton(path.btnDeleteImageUrl);

  if(btnDelete.length === 0) 
  {
    var undoimg = $("img[src$='https://maps.gstatic.com/mapfiles/undo_poly.png']");
    
    undoimg.parent().css('height', '21px !important');
    undoimg.parent().parent().append('<div style="overflow-x: hidden; overflow-y: hidden; position: absolute; width: 30px; height: 27px;top:21px;"><img src="' + path.btnDeleteImageUrl + '" class="deletePoly" style="height:auto; width:auto; position: absolute; left:0;"/></div>');
    
    // now get that button back again!
    btnDelete = getDeleteButton(path.btnDeleteImageUrl);
    btnDelete.hover(function() { $(this).css('left', '-30px'); return false;}, 
                    function() { $(this).css('left', '0px'); return false;});
    btnDelete.mousedown(function() { $(this).css('left', '-60px'); return false;});
  }
  
  // if we've already attached a handler, remove it
  if(path.btnDeleteClickHandler) 
    btnDelete.unbind('click', path.btnDeleteClickHandler);
    
  // now add a handler for removing the passed in index
  path.btnDeleteClickHandler = function() {
    path.removeAt(index); 
    return false;
  };
  btnDelete.click(path.btnDeleteClickHandler);

  joinPoints(this);


  polygonsToTextArea();
}

function joinPoints(newPaths) {
  for (var j = polygons.length - 1; j >= 0; j--) {
    if (polygons[j].id == newPaths.polygonId)
      continue;

    var path = polygons[j].getPath();
    var len = path.getLength();

    var changed = false;

    var points = [];
    for (var i = 0; i < len; i++) {
      var newPolygonPath = newPaths;
      for (var k = newPolygonPath.getLength() - 1; k >= 0; k--) {
        if(path.polygonId == newPolygonPath.polygonId)
          break;
        if (getDistance(path.getAt(i), newPolygonPath.getAt(k)) < 10){
            console.log("TODO less than 10", newPolygonPath.getAt(k), path.getAt(i));
        }
      }
    }
  }
}

function polygonsToTextArea(){
  var paths = [];
  for (var j = polygons.length - 1; j >= 0; j--) {
    var path = polygons[j].getPath();
    var len = path.getLength();
    
    var points = [];

    for (var i = 0; i < len; i++) {
      // htmlStr += "new google.maps.LatLng(" + this.getAt(i).toUrlValue(5) + "), ";
      //Use this one instead if you want to get rid of the wrap > new google.maps.LatLng(),
      points.push(path.getAt(i).toUrlValue(5));
    }
    paths.push({id: path.polygonId, points:points});
  }

  document.getElementById('info').innerHTML = JSON.stringify(paths);
}

function polygonDoubleClick(event) {
  event.stop();
  this.setMap(null);
  var index = polygons.indexOf(this);
  polygons.splice(index, 1);
  polygonsToTextArea();
}

function addDeleteButton(poly) {
  var path = poly.getPath();
  path["btnDeleteClickHandler"] = {};
  path["btnDeleteImageUrl"] = 'img/delete.png';
}


function createPolygonAroundPoint(point){
  // console.log(point.lat(), point.lng());
  // Polygon Coordinates
  var triangleCoords = [
    new google.maps.LatLng(point.lat(), point.lng()),
    new google.maps.LatLng(point.lat() + polygonCreationZone, point.lng()),
    new google.maps.LatLng(point.lat(), point.lng() + polygonCreationZone)
  ];
  // Styling & Controls
  var myPolygon = new google.maps.Polygon({
    paths: triangleCoords,
    draggable: true, // turn off if it gets annoying
    editable: true,
    strokeColor: '#FF0000',
    strokeOpacity: 0.7,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.25,
    id: id++,
  });

  polygons.push(myPolygon);

  myPolygon.setMap(map);

  addDeleteButton(myPolygon);

  myPolygon.getPath().polygonId = id;
  
  google.maps.event.addListener(myPolygon.getPath(), "insert_at", getPolygonCoords);
  google.maps.event.addListener(myPolygon.getPath(), "set_at", getPolygonCoords);
  google.maps.event.addListener(myPolygon.getPath(), "remove_at", getPolygonCoords);

  google.maps.event.addListener(myPolygon, 'dblclick', polygonDoubleClick);

  polygonsToTextArea();

}

function getDeleteButton(imageUrl) {
  return  $("img[src$='" + imageUrl + "']");
}

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};