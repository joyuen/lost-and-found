var globals = {
    currentUser: null,
};

var map;
let allMarkers = {};    // cache of (posting id) -> gmap marker
let allPostings = {};   // cache of (posting id) -> posting
var currentCampus;      // the campus the map is currently on
var currentMarker;      // when the create form is open, set to the marker
var pannedMarker;       // the marker of the posting that is currently being viewed
var pannedKey;          // the key of the posting that is currently being viewed
var heatmap;
var heatmapLocations;

//              currentMarker       pannedMarker        pannedKey   form                page
// all posts:   null                null                null        ??                  all-posts
// view posts:  null                something(blue)     something   ??                  content-post
// create:      something(orange)   null                null        init(null)          content-form
// edit:        null                something(orange)   something   init(currentMarker) content-form
// edit,create,view posts -> all posts  are tracked in the "X" callback
// all posts,view posts,edit -> create  are tracked in the map click callback
// create,edit,all posts -> view        are tracked in the marker click callback
// view post -> edit is in the edit button callback
// all post -> edit is impossible
// create -> edit is impossible
// when changing currentMarker, must delete it if it exists
// when changing pannedMarker, reset its logo first

function resetForm() {
    $('#content-form')[0].reset();
    resetImage();
}

function jsDateToDatetime(date) {
    return moment(date).format('YYYY-MM-DDTHH:mm');
}
function showPage(id) {
    // show the page
    for (let elem of $("#sidebar").children()) {
        $(elem).hide();
    }
    $(`#${id}`).show();
}

function panToMarker(key) {
    let m = allMarkers[key];
    let p = allPostings[key];
    map.panTo(m.position);
    showPage("content-post");
    var altpic = `https://picsum.photos/420`;
    $('#post-img')[0].src="";
    if(p.imageID) {
        getImage(p.imageID);
    }
    else {
        $('#post-img')[0].src=altpic+"?"+Math.random();
    }
    document.getElementById('post-title').innerHTML = p.title;
    document.getElementById('post-title').innerHTML = p.title;
    document.getElementById('post-status').innerHTML = "Status: " + p.status;
    document.getElementById('post-item').innerHTML = "Item: " + p.category;
    document.getElementById('post-date').innerHTML = moment(new Date(p.lostDate), "LL");
    document.getElementById('post-author').innerHTML = "Posted by: " + p.postedBy;
    document.getElementById('post-link').href = "/viewpost?id="+p._id;
    $("#edit-button").toggle((globals.currentUser == p.postedBy) && (p.status != "returned"));

    if (currentMarker) {
        currentMarker.setMap(null);
    }
    currentMarker = null;
    if (pannedMarker) {
        pannedMarker.setIcon(undefined);
    }
    pannedMarker = m;
    pannedKey = key;
    pannedMarker.setIcon("/images/map-marker-blue.png");
}

async function getPostingsAndCreateMarkers(n, s, w, e) {
    heatmapLocations = [];
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                var response = req.responseText;
                var json = JSON.parse(response);
                dict = {}
                for(var r in json) {
                    dict[json[r]._id] = json[r];
                    if(json[r].status == "stolen") {
                        var pos = json[r].coordinates.coordinates;
                        var latlng = new google.maps.LatLng(pos[1], pos[0]);
                        heatmapLocations.push(latlng);
                    }
                }
                processPostings(dict);
                if($("#heatmap")[0].checked) {
                    if(heatmap) {
                        heatmap.setMap(null);
                    }
                    toggleHeatmap();
                }
                resolve();
            }
        };
        req.open('POST', location.origin + "/api/region");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var data = "n="+n+"&s="+s+"&w="+w+"&e="+e;
        req.send(data);
    });

    function processPostings(server_postings) {
        allPostings = server_postings;

        for(let key in allMarkers) {
            if(!(key in server_postings)) {
                allMarkers[key].setMap(null);
                delete allMarkers[key];
            }
        }
        for(let key in server_postings) {
            if(key in allMarkers) {
                continue;
            }
            let pos = server_postings[key].coordinates.coordinates;
            let m = new google.maps.Marker({
                position: new google.maps.LatLng(pos[1], pos[0]),
                map: map,
            })
            allMarkers[key] = m;

            m.addListener('click', function() {
                panToMarker(key);
            })
        }
    };
}

function initMap() {
    // GLOBALS
    campuses = {
        burnaby: {              // SFU Burnaby
            minZoom: 16,
            center: new google.maps.LatLng(49.2767988, -122.9169812),
            bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(49.272003, -122.933773),  // South West
                new google.maps.LatLng(49.282021, -122.902325)   // North East
            )
        },
        vancouver: {            // SFU Vancouver
            minZoom: 18,
            center: new google.maps.LatLng(49.284526, -123.111648),
            bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(49.284213, -123.113048),  // South West
                new google.maps.LatLng(49.285356, -123.111055)   // North East
            )
        },
        surrey: {               // SFU Surrey
            minZoom: 17.5,
            center: new google.maps.LatLng(49.18665,-122.8494658),
            bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(49.185315, -122.852098),  // South West
                new google.maps.LatLng(49.190122, -122.845559)   // North East
            )
        }
    }

    map = new google.maps.Map(document.getElementById('map'), {
        disablePanMomentum: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        clickableIcons: false,
        styles: [
                    {
                        "featureType": "poi",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "featureType": "poi.school",
                        "stylers": [{ "visibility": "on" }]
                    },
                    {
                        "featureType": "poi.government",
                        "stylers": [{ "visibility": "on" }]
                    },
                    {
                        "featureType": "poi.medical",
                        "stylers": [{ "visibility": "on" }]
                    },
                    {
                        "featureType": "poi.park",
                        "stylers": [{ "visibility": "on" }]
                    },
                    {
                        "featureType": "poi.sports_complex",
                        "stylers": [{ "visibility": "on" }]
                    }
                ]
    });

    // Add controls to the map, allowing users to hide/show features.
    var styleControl = document.getElementById('floating-panel');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);

    // map.addListener('idle', function() {
    //     // This is only for testing, need to grab new coords from db from idle listener below
    //     var bounds = map.getBounds();
    //     neBounds = bounds.getNorthEast();
    //     swBounds = bounds.getSouthWest();

    //     getMarkers(neBounds.lat(), swBounds.lat(), swBounds.lng(), neBounds.lng());

    // });

    map.addListener('click', function(event) {
        var marker = new google.maps.Marker({
          position: event.latLng,
          map: map,
          icon: "images/map-marker-orange.png",
        });

        if (pannedMarker) {
            pannedMarker.setIcon(undefined);
        }
        pannedMarker = null;
        pannedKey = null;
        if (currentMarker) {
            currentMarker.setMap(null);
        }
        currentMarker = marker;

        if($("#postid")[0].value) {
            resetForm();
            $('#postid')[0].value = '';
        }

        showPage('content-form');
        document.getElementById("campus").value = currentCampus;
        document.getElementById("lat").value = event.latLng.lat();
        document.getElementById("lng").value = event.latLng.lng();
        document.getElementById("timezone-offset").value = moment().format('ZZ');

        var snow = jsDateToDatetime(new Date());
        var smin = jsDateToDatetime(new Date(2020, 0, 1));
        document.getElementById("datetime").value = snow;
        document.getElementById("datetime").max = snow;
        document.getElementById("datetime").min = smin;

        marker.addListener('click', function() {
            if(marker) {
                marker.setMap(null);
                showPage("all-post");
            }
        });

        var listener = map.addListener('click', function() {
            marker.setMap(null);
            google.maps.event.removeListener(listener);
        });
    });

    showCampus('burnaby');
    init();
    initPostings();
}

async function showCampus(c) {
    map.setOptions({
        center: campuses[c].center,
        zoom: campuses[c].minZoom,
        minZoom: campuses[c].minZoom,
        restriction: {latLngBounds: campuses[c].bounds, strictBounds: false}}
    );
    map.setCenter(campuses[c].center);
    map.setZoom(campuses[c].minZoom);
    currentCampus = c;

    var bounds = campuses[c].bounds;
    var neBounds = bounds.getNorthEast();
    var swBounds = bounds.getSouthWest();

    await getPostingsAndCreateMarkers(neBounds.lat(), swBounds.lat(), swBounds.lng(), neBounds.lng());
}

function showBurnaby() {
    showCampus('burnaby');
}

function showVancouver() {
    showCampus('vancouver');
}

function showSurrey() {
    showCampus('surrey');
}


async function refreshPosting(postid) {
    return new Promise((resolve, reject) => {
        console.log(`getting ${postid}`);
        $.get(`api/postings/${postid}`, function(data) {
            allPostings[postid] = data;
            console.log(data);
            if (!(postid in allMarkers)) {
                let m = new google.maps.Marker({
                    position: new google.maps.LatLng(data.coordinates.coordinates[1], data.coordinates.coordinates[0]),
                    map: map,
                });
                heatmapLocations.push(m.position);
                m.addListener('click', function() {
                    panToMarker(postid);
                })
                allMarkers[postid] = m;
            }
            console.log(allMarkers[postid], allPostings[postid]);
            resolve();
        });
    });
}

async function getImage(imageID) {
    return new Promise((resolve, reject) => {
        $.get(`api/image/${imageID}`, function(data) {
            console.log(data);
            $('#post-img')[0].src=data;
            resolve();
        });
    });
}

function toggleHeatmap() {
    var heatmapElement = $('#heatmap')[0]
    if(heatmapElement.checked) {
        if(heatmap) {
            heatmap.setMap(null);
        }
        heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatmapLocations,
          radius: 50,
          opacity: 0.3,
        });
        heatmap.setMap(map);
    }
    else {
        heatmap.setMap(null);
    }
}

function init() {
    $.get(`/api/postings`, function(res) {
        globals.currentUser = res.user;
    });

    /* setup callbacks */
    $(".cancel-button").on('click', function(e) {
        showPage("all-post");
        if (currentMarker) {
            currentMarker.setMap(null);
        }
        currentMarker = null;
        if (pannedMarker) {
            pannedMarker.setIcon(undefined);
        }
        pannedMarker = null;
        pannedKey = null;
        resetForm();
        $('#postid')[0].value = '';
    });

    $(".edit-button").on('click', function(e) {
        resetForm();

        pannedMarker.setIcon("images/map-marker-orange.png");

        var post = allPostings[pannedKey];
        document.getElementById("campus").value = post.campus;
        document.getElementById("lng").value = post.coordinates.coordinates[0];
        document.getElementById("lat").value = post.coordinates.coordinates[1];
        document.getElementById("postid").value = pannedKey;
        document.getElementById("title").value = post.title;
        document.getElementById(post.status).checked = true;
        document.getElementById("location").value = post.location;
        document.getElementById("detail").value = post.description;
        document.getElementById("item").value = post.category;

        document.getElementById("datetime").value = jsDateToDatetime(new Date(post.lostDate));
        document.getElementById("datetime").max = jsDateToDatetime(new Date());
        document.getElementById("datetime").min = jsDateToDatetime(new Date(2020, 0, 1));
        document.getElementById("timezone-offset").value = moment().format('ZZ');

        showPage("content-form");
    });

    $("#submit-btn").on('click', function(e) {
        var form = $('#content-form');
        if (form[0].checkValidity() === false) {
            form[0].reportValidity();
            return;
        }

        $.post("api/postings", form.serialize(), function(postid) {
            refreshPosting(postid).then(() => {
                panToMarker(postid);
                toggleHeatmap();
                startPagination({}, getPostsPerPage());
                resetForm();
                $('#postid')[0].value = '';
            });
        });

        // $.post("api/postings", $('#content-form').serialize(), function(data) {
        //     showPage("all-post");
        //     currentPosting = data;
        //     showCampus(currentCampus);
        //     map.panTo(existing[currentPosting].position);
        //     startPagination({}, getPostsPerPage());
        //     $('#content-form')[0].reset();
        //     $('#postid')[0].value = '';
        // });
    });

    $("#heatmap").on('click',toggleHeatmap);
};

function loadScript() {
 var script = document.createElement('script');
 script.type = 'text/javascript';
 script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCbW2Hw8v1WrPy0VUWt8KYIGjh8BUhlh-0&libraries=visualization&callback=initMap';
 document.body.appendChild(script);
}

window.onload = loadScript;
