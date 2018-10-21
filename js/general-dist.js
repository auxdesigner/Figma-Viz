console.clear();

const now = new Date();
renderjson.set_icons('►', '▼');

let selectedDropdown = $("#dropdown-selector"),
	dropdownList = $(".dropdown-list"),
	currentJSON,
	currentJSONstring,
	btnText,
	flagWord;

//////////////////////////////////
//////////// GET JSON ////////////
//////////////////////////////////

function getBase(json){
	$(".file-result__name").text(json.name);
	$(".file-result__image").css("background-image", "url(" + json.thumbnailUrl + ")");
	$(".file-result__json").empty();
};

function finalParsePart(json, level){
	renderjson.set_show_to_level(level);

	$(".file-result__json").append(renderjson(json));
	$(".info-screen").css("overflow", "visible");
	//document.getElementById('file-result').scrollIntoView({behavior: "smooth", block: "start"});

	$('html,body').animate({
	   scrollTop: $("#file-result").offset().top
	});

	currentJSON = json;
	currentJSONstring = JSON.stringify(json);

	var family = jsonQ(json),
	//backgroundColor, color
	types = family.find('type');
	typesValue = types.value();

	var occurrences = { };
	for (var i = 0, j = typesValue.length; i < j; i++) {
	   occurrences[typesValue[i]] = (occurrences[typesValue[i]] || 0) + 1;
	}

	console.log(occurrences);     

	var canvasNum = occurrences['CANVAS'];
	var componentNum = occurrences['COMPONENT'];  
	var instanceNum = occurrences['INSTANCE'];  
	var groupNum = occurrences['GROUP'];  
	var frameNum = occurrences['FRAME'];  
	var sliceNum = occurrences['SLICE'];  

	
	
	
	var textNum = occurrences['TEXT'];
	var imageNum = occurrences['IMAGE'];
	var vectorNum = occurrences['VECTOR'];
	var lineNum = occurrences['LINE'];
	var rectangleNum = occurrences['RECTANGLE'];
	var ellipseNum = occurrences['ELLIPSE'];
	var polygonNum = occurrences['REGULAR_POLYGON'];
	var starNum = occurrences['STAR'];

	

	//console.log(occurrences['LINE']);   
	 
	
	$(".file-result__content").append('<div class="chart"><canvas id="myChart" width="400" height="400"></canvas></div>'); 
	$(".file-result__content").append('<div class="overview"></div>'); 

	// $(".overview").append('<div class="result_box"><div class="result_name">Canvas</div><div class="result_value">'+ canvasNum +'</div></div>');
	$(".overview").append('<div class="result_box"><div class="result_name">Component</div><div class="result_value">'+ componentNum +'</div></div>');
	$(".overview").append('<div class="result_box"><div class="result_name">Instance</div><div class="result_value">'+ instanceNum +'</div></div>');
	$(".overview").append('<div class="result_box"><div class="result_name">Group</div><div class="result_value">'+ groupNum +'</div></div>');
	// $(".overview").append('<div class="result_box"><div class="result_name">Frame</div><div class="result_value">'+ frameNum +'</div></div>');
	// $(".overview").append('<div class="result_box"><div class="result_name">Slice</div><div class="result_value">'+ sliceNum +'</div></div>');

	data = {
	    datasets: [{
	        data: [textNum, imageNum, vectorNum, lineNum, rectangleNum, ellipseNum, polygonNum, starNum]
	    }],

	    // These labels appear in the legend and in the tooltips when hovering different arcs
	    labels: [
	        'Text',
	        'Image',
	        'Vector',
	        'Line',
	        'Rectangle',
	        'Ellipse',
	        'Polygon',
	        'Star'
	    ]
	};


	var ctx = document.getElementById("myChart");

	chart = new Chart(ctx, {
	    type: 'doughnut',
	    data: {
	        datasets: [{
	            label: 'Colors',
	            data: [textNum, imageNum, vectorNum, lineNum, rectangleNum, ellipseNum, polygonNum, starNum],
	            backgroundColor: ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#7FDBFF", "#B10DC9", "#FFDC00", "#001f3f"]
	        }],
	        labels: [
		        'Text',
		        'Image',
		        'Vector',
		        'Line',
		        'Rectangle',
		        'Ellipse',
		        'Polygon',
		        'Star'
		    ]
	    },
	    options: {
	        responsive: true
	    }
	});





	$(".file-result__loader").css({
		"-webkit-transition": "scaleY(0)",
		"-o-transition": "scaleY(0)",
		"transform": "scaleY(0)"
	});
	$(".btn__accent").text(btnText);
	$(".btn-group").fadeIn(50);
};

async function getThree(figmaApiKey,figmaId) {
	var result = await fetch('https://api.figma.com/v1/files/' + figmaId, {
		method: 'GET',
		headers: {
			'X-Figma-Token': figmaApiKey
		}
	})
	var figmaTreeStructure = await result.json();
	getBase(figmaTreeStructure);

	if (typeof figmaTreeStructure.err !== "undefined"){
		$(".file-result__name").text(figmaTreeStructure.status);
	}

	finalParsePart(figmaTreeStructure, 1);
};

//////////////////////////////////

async function getPagesAndArtboards(figmaApiKey,figmaId) {
	var result = await fetch('https://api.figma.com/v1/files/' + figmaId, {
		method: 'GET',
		headers: {
			'X-Figma-Token': figmaApiKey
		}
	})
	var figmaTreeStructure = await result.json();

	if (typeof figmaTreeStructure.err == "undefined"){
		getBase(figmaTreeStructure);
		
		let pagesAndArtboardsJSON = {};

		let pages = figmaTreeStructure.document.children;
		pagesAndArtboardsJSON.fileName = figmaTreeStructure.name;
		pagesAndArtboardsJSON.lastModified = figmaTreeStructure.lastModified;
		pagesAndArtboardsJSON.pages = {};

		for (var i in pages) {
			pagesAndArtboardsJSON.pages[pages[i].name] = []
			for (var j in pages[i].children) {
				pagesAndArtboardsJSON.pages[pages[i].name].push(pages[i].children[j].name)
			}
		};

		finalParsePart(pagesAndArtboardsJSON, 2);
	} else {
		getBase(figmaTreeStructure);
		$(".file-result__name").text(figmaTreeStructure.status);
		finalParsePart(figmaTreeStructure, 1);
	}
};

//////////////////////////////////

async function getPages(figmaApiKey,figmaId) {
	var result = await fetch('https://api.figma.com/v1/files/' + figmaId, {
		method: 'GET',
		headers: {
			'X-Figma-Token': figmaApiKey
		}
	});
	var figmaTreeStructure = await result.json();

	if (typeof figmaTreeStructure.err == "undefined"){
		getBase(figmaTreeStructure);
		
		let pagesJSON = {};

		let pages = figmaTreeStructure.document.children;
		pagesJSON.fileName = figmaTreeStructure.name;
		pagesJSON.lastModified = figmaTreeStructure.lastModified;
		pagesJSON.pages = [];

		for (var i in pages) {
			pagesJSON.pages.push(pages[i].name)
		};

		finalParsePart(pagesJSON, 2);
	} else {
		getBase(figmaTreeStructure);
		$(".file-result__name").text(figmaTreeStructure.status);
		finalParsePart(figmaTreeStructure, 1);
	}
};

//////////////////////////////////

async function getArtboards(figmaApiKey,figmaId) {
	var result = await fetch('https://api.figma.com/v1/files/' + figmaId, {
		method: 'GET',
		headers: {
			'X-Figma-Token': figmaApiKey
		}
	})
	var figmaTreeStructure = await result.json();

	if (typeof figmaTreeStructure.err == "undefined"){
		getBase(figmaTreeStructure);
		
		let artboardsJSON = {}

		let pages = figmaTreeStructure.document.children;
		artboardsJSON.fileName = figmaTreeStructure.name;
		artboardsJSON.lastModified = figmaTreeStructure.lastModified;
		artboardsJSON.artboards = [];

		for (var i in pages) {
			for (var j in pages[i].children) {
				artboardsJSON.artboards.push(pages[i].children[j].name);
			}
		};

		finalParsePart(artboardsJSON, 2);
	} else {
		getBase(figmaTreeStructure);
		$(".file-result__name").text(figmaTreeStructure.status);
		finalParsePart(figmaTreeStructure, 1);
	}
};

//////////////////////////////////

async function getByFlag(figmaApiKey,figmaId,flagWord) {
	var result = await fetch('https://api.figma.com/v1/files/' + figmaId, {
		method: 'GET',
		headers: {
			'X-Figma-Token': figmaApiKey
		}
	})
	var figmaTreeStructure = await result.json();

	if (typeof figmaTreeStructure.err == "undefined"){
		getBase(figmaTreeStructure);
		
		let flag = new RegExp(flagWord)
		let flagsJSON = {}

		let pages = figmaTreeStructure.document.children;
		flagsJSON.fileName = figmaTreeStructure.name;
		flagsJSON.lastModified = figmaTreeStructure.lastModified;
		flagsJSON[flagWord] = [];

		for (var i in pages) {
			for (var j in pages[i].children) {
				if (flag.test(pages[i].children[j].name)) {
					flagsJSON[flagWord].push(pages[i].children[j].name)
				}
			}
		}

		finalParsePart(flagsJSON, 2);
	} else {
		getBase(figmaTreeStructure);
		$(".file-result__name").text(figmaTreeStructure.status);
		finalParsePart(figmaTreeStructure, 1);
	}
};


//////////////////////////////////
//////// DROPDOWN CONTROL ////////
//////////////////////////////////

function hideDropdown(dropdown) {
	if (dropdown.hasClass("dropdown-item__selected")) {
		dropdown.removeClass("dropdown-item__selected");
		dropdown.find(".dropdown-item__arrow-down").removeClass("dropdown-item__arrow-up");
		$(".dropdown-list").slideToggle("fast");
	} else {
		dropdown.addClass("dropdown-item__selected");
		dropdown.find(".dropdown-item__arrow-down").addClass("dropdown-item__arrow-up");
		$(".dropdown-list").slideToggle("fast");
	}
};

selectedDropdown.click(function () {
	hideDropdown($(this));
});

$(".dropdown-list .dropdown-item").click(function () {
	selectedDropdown.find("i").removeClass(selectedDropdown.find("i").attr("class"))
	.addClass($(this).find("i").attr("class"));

	selectedDropdown.find("span").text($(this).find("span").text());

	dropdownList.find(".dropdown-item").each(function(){
		if (!$(this).is(':visible')){
			$(this).show();
		}
	}).promise().done($(this).hide());

	if ($("#selected-icon").hasClass("icon-m_by-flag")){
		$("#by-flag-wrap").slideDown("fast");
	} else {
		$("#by-flag-wrap").slideUp("fast");
	}

	hideDropdown(selectedDropdown);
});


//////////////////////////////////
////////// PARSE JSON ////////////
//////////////////////////////////

$(".btn__accent").click(function(){
	btnText = $(this).text()
	if(!$("#token").val() && $("#file-id").val()){
		alert("Paste personal access token");
	} else if (!$("#file-id").val() && $("#token").val()){
		alert("Paste file ID");
	} else if (!$("#token").val() && !$("#file-id").val()){
		alert("Paste Personal access token and file ID")
	} else if ($("#token").val() && $("#file-id").val()){
		if ($("#selected-icon").hasClass("icon-m_JSON")) {
			getThree($("#token").val(), $("#file-id").val());
		} else if ($("#selected-icon").hasClass("icon-m_pages-and-artboards")){
			getPagesAndArtboards($("#token").val(), $("#file-id").val());
		} else if ($("#selected-icon").hasClass("icon-m_pages")){
			getPages($("#token").val(), $("#file-id").val());
		} else if ($("#selected-icon").hasClass("icon-m_artboards")){
			getArtboards($("#token").val(), $("#file-id").val());
		} else if ($("#selected-icon").hasClass("icon-m_by-flag")){
			flagWord = $("#by-flag").val();
			getByFlag($("#token").val(), $("#file-id").val(),flagWord);
		}
		$(".file-result__loader").css({
			"-webkit-transition": "scaleY(1)",
			"-o-transition": "scaleY(1)",
			"transform": "scaleY(1)"
		});
		$(this).text("Fetching…")
	}
});


//////////////////////////////////
///// COPY TO CLIPBOARD FOO //////
//////////////////////////////////

function copyToClipboard(str) {
  function listener(e) { e.clipboardData.setData("text/plain", str);
                         e.preventDefault(); }
  document.addEventListener("copy", listener);
  document.execCommand("copy");
  document.removeEventListener("copy", listener);
};

$("#copy-to-clipboard").click(function(){
	copyToClipboard(currentJSONstring);
});

//////////////////////////////////
////////// SAVE TO JSON //////////
//////////////////////////////////

function saveJson(obj, name) {
	var str = JSON.stringify(obj);
	var data = encode( str );

	var blob = new Blob( [ data ], {
		type: "application/octet-stream"
	});
	
	var url = URL.createObjectURL( blob );
	var link = document.createElement( "a" );
	link.setAttribute("href", url);
	link.setAttribute("download", now.getUTCDate() + "." + (now.getUTCMonth()+1) + "." + now.getUTCFullYear() + "-" + name + ".json");
	var event = document.createEvent("MouseEvents");
	event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	link.dispatchEvent(event);
};

var encode = function( s ) {
	var out = [];
	for ( var i = 0; i < s.length; i++ ) {
		out[i] = s.charCodeAt(i);
	}
	return new Uint8Array( out );
};

$("#save-as-json").click(function(){
	saveJson(currentJSON, $(".file-result__name").text());
});

