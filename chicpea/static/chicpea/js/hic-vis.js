var diameter = $("#svg-container").width();
var trans = "translate(" + diameter * 0.5 + "," + diameter * 0.5 + ")";
var interactionScore = 5;
var interactionColor = d3.scale.linear().domain([interactionScore, 20]).range(["blue", "red"]);
var start, CHR, totalBP, region;
var pi = Math.PI;  
    		
function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
}

function overlaps(s1, e1, s2, e2) {
    if (s1 < s2 & e1 < e2 & e1 > s2) {
        return 1;
    } else if (s2 < s1 & e2 > s1 & e2 < e1) {
        return 1;
    } else if (s2 > s1 & s2 < e1 & e2 < e1) {
        // return 1;
    } else if (s2 < s1 & e2 > e1) {
        return 1;
    } else if (s1 < s2 & e1 > e2) {
        return 1;
    } else if (s1 == s2 | s1 == e2 | e1 == s1 | e1 == e2) {
        return 1;
    }
    return 0;
}


function adjustBump(annot, offset) {
    var recurse = 0;
    for (var i = 0; i < annot.length; i++) {
        for (var j = 0; j < annot.length; j++) {
            if (i != j) {
                var g1 = annot[i];
                var g2 = annot[j];
                if (g1.bumpLevel == g2.bumpLevel && overlaps(g1.start - offset, g1.end + offset, g2.start - offset, g2.end + offset)) {
                    annot[i].bumpLevel++;
                    recurse = 1;
                }
            }
        }
    }
    if (recurse) {
        adjustBump(annot, offset);
    }
}


function computeCartesian(r, coord, totalBP) {
    var arcAvail = 360 - 10;
    var ratio = coord / totalBP;
    var theta = (((coord / totalBP) * arcAvail) * (pi / 180)) + (5 * (pi / 180));
    if (theta <= pi / 2) {
        return ({
            x: r * Math.sin(theta),
            y: r * Math.cos(theta) * -1
        });
    } else if (theta > pi / 2 && theta <= pi) {
        return ({
            x: r * Math.sin(theta),
            y: r * Math.cos(theta) * -1
        });
    } else if (theta > pi && theta <= (3 * pi) / 2) {
        return ({
            x: r * Math.sin(theta),
            y: r * Math.cos(theta) * -1
        });
    } else if (theta > (3 * pi) / 2 && theta <= 2 * pi) {
        return ({
            x: r * Math.sin(theta),
            y: r * Math.cos(theta) * -1
        });
    } else {
        theta = (arcAvail * (pi / 180)) + (5 * (pi / 180))
        return ({
            x: r * Math.sin(theta),
            y: r * Math.cos(theta) * -1
        });
    }


}


function computePath(start, end, r, totalBP, diameter) {
    // creates some d magic to connect paths
    // <path class="SamplePath" d="M100,200 C100,100 250,100 250,200
    //                                 S400,300 400,200" />
    startcoords = computeCartesian(r, start, totalBP);
    endcoords = computeCartesian(r, end, totalBP);
    //harcoded !!!!!!!!
    startcontrol = computeCartesian(r - (diameter * 0.1), start, totalBP);
    endcontrol = computeCartesian(r - (diameter * 0.1), end, totalBP);
    return ("M" + startcoords.x + "," + startcoords.y +
        " C" + startcontrol.x + "," + startcontrol.y + "," + endcontrol.x + "," + endcontrol.y + " " + endcoords.x + "," + endcoords.y);
}



function computeStrandPath(start, end, r, totalBP, flag) {
    startcoords = computeCartesian(r, start, totalBP);
    endcoords = computeCartesian(r, end, totalBP);
    //var flag = "0,1";
    if (undefined === flag){
    	flag = "0,1";    	
		if ((end - start) /totalBP > 0.5){
			flag = "1,1";
		// flag = "0,0";
		}
    }
    return ("M" + startcoords.x + "," + startcoords.y +
        " A" + r + "," + r + " 0 " + flag + " " + endcoords.x + "," + endcoords.y);
}

function computeArcPath(start, end, r1, r2, totalBP) {
    startcoords1 = computeCartesian(r1, start, totalBP);
    endcoords1 = computeCartesian(r1, end, totalBP);
    startcoords2 = computeCartesian(r2, start, totalBP);
    endcoords2 = computeCartesian(r2, end, totalBP);
    var flag1 = "0,1";
    if ((end - start) /totalBP > 0.5){
        	flag1 = "1,1";
        }
        var flag2 = "0,0";
        if ((end - start) /totalBP > 0.5) {
        flag2 = "0,1";
    }
    return ("M" + startcoords1.x + "," + startcoords1.y +
        " A" + r1 + "," + r1 + " 0 " + flag1 + " " + endcoords1.x + "," + endcoords1.y +
        " L" + endcoords2.x + "," + endcoords2.y +
        " A" + r2 + "," + r2 + " 0 " + flag2 + " " + startcoords2.x + "," + startcoords2.y +
        " z");
}

function computePointPath(start, end, score, minscore, maxscore, r, totalBP, diameter) {
    var adjMaxscore = maxscore - minscore;
    var adjScore = score - minscore;
    var trackwidth = diameter * 0.05;
    var radius = r;
    if (adjMaxscore > 0)
    	radius += ((parseFloat(adjScore) / adjMaxscore) * trackwidth)
    var startcoords = computeCartesian(radius, start, totalBP);
    return "translate(" + (startcoords.x + (diameter * 0.5)) + "," + (startcoords.y + (diameter * 0.5)) + ")";
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function log10(val) {
	return Math.log(val) / Math.LN10;
}




function renderHic(term, tissue, diameter, breadcrumb) {
	resetPage(term, tissue, breadcrumb)
	var gwas = $("#gwas").val();
	
	d3.json("/chicpea/search?searchTerm=" + term + '&tissue=' + tissue + '&snp_track=' + gwas, function (error, json) {
		if (error) return console.warn(error);
		if (json.error) {
				$("div.radio.tissue").each(function (index, value){
						var t = $(this).find("input").val();
						$("#"+t+"_count").text("(0)")
				});
				div = d3.select("#svg-container")
				.append("div")
				.html("<h1>"+json.error+"</h1>")
				.attr("id", "message")
				.style("width", "100%")
				.style("text-align", "center")
				.style("padding-top", "200px");
			return;
		}
		data = json;
		var genes = data.genes;
		var snps = data.snps;
		var meta = data.meta;
		var extras = data.extra;
		
		totalBP = data.meta.rend - data.meta.rstart;
		start = parseInt(meta.ostart);
		CHR = meta.rchr;
		region = data.region
		                                                                 
		$("#region").val(data.region);
		$("#totalBP").val(totalBP); 
		
		var tissues = [];
		for (var i=0;i<meta.tissues.length;i++) {
			tissues[meta.tissues[i]] = 0;
		}
		
		var hics = data.hic;
		if (hics.length == 0) {
			div = d3.select("#svg-container")
				.append("div")
				.html("<h1>No interactions found</h1>")
				.attr("id", "message")
				.style("width", "100%")
				.style("text-align", "center")
				.style("padding-top", "200px");
			return;
		}
		for (var i = 0; i < hics.length; i++) {
		    hics[i].id = i + 1;
		}
		
		// set this to make genes that are close but not overlapping bump
		var offset = 0;
		adjustBump(genes, offset);
		var bt = {};
		for (var g in genes) {
			bt[genes[g].gene_biotype] = 1;
		}
		bt['hilight'] = 1;
		
		var vis = d3.select("#svg-container").append("svg").attr("id", "main-svg").attr("width", diameter).attr("height", diameter);
		
		vis.append("text")
			.attr("x", 0).attr("y", 0)
			.attr("text-anchor", "left")  
			.style("font-size", "20px")
			.attr("class", "svg_only")
			.text($("#page_header").html());
		
		
		var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
		
		addCenterScale();
		
		
		vis.append("g").attr("class", "left arrow_heads").selectAll("defs")
			.data(Object.keys(bt))
			.enter()
			.append("marker")
			.attr("id", function (d) {
			return ("lharrow_" + d);
		})
		.attr("viewBox", "-1 0 6 6")
		.attr("refX", -0.1)
		.attr("refY", 3)
		.attr("markerUnits", "strokeWidth")
		.attr("markerWidth", 1)
		.attr("markerHeight", 1)
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M0,0 L-1,3 L0,6")
		.attr("class", function (d) {
				if (d =='hilight') return "hilight";
				else return d;
		});
		
		vis.append("g").attr("class", "right arrow_heads").selectAll("defs")
			.data(Object.keys(bt))
			.enter()
			.append("marker")
			.attr("id", function (d) {
			return ("rharrow_" + d);
		})
		.attr("viewBox", "0 0 6 6")
		.attr("refX", 0.1)
		.attr("refY", 3)
		.attr("markerUnits", "strokeWidth")
		.attr("markerWidth", 1)
		.attr("markerHeight", 1)
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M0,0 L1,3 L0,6")
		.attr("class", function (d) {
				if (d =='hilight') return "hilight";
				else return d;
		});
		
		if (extras.length > 0) addExtraData(extras);
		
		
		//add gene track
		
		var gene = vis.append("g").attr("class", "track genes").selectAll("svg").data(genes).enter();
		    
		gene.append("path")
			.attr("d", function (d) {
				return (computeStrandPath(d.start, d.end, (diameter * 0.35) + (d.bumpLevel * 15), totalBP));
			})
			.attr("transform", trans)
			.attr("class", function (d) {
					if (d.gene_name == $("#search_term").val().toUpperCase() || d.gene_id == $("#search_term").val().toUpperCase()) {
						return "hilight";
					} else {
						return d.gene_biotype;
					}
			})
			.attr("marker-start", function (d) {
				var bt = d.gene_biotype;
				if (d.gene_name == $("#search_term").val().toUpperCase() || d.gene_id == $("#search_term").val().toUpperCase()) {
					bt = 'hilight';
				}
				if (d.strand == "-") return ("url(#lharrow_" + bt + ")");
			})
			.attr("marker-end", function (d) {
				var bt = d.gene_biotype;
				if (d.gene_name == $("#search_term").val().toUpperCase() || d.gene_id == $("#search_term").val().toUpperCase()) {
					bt = 'hilight';
				}
				if (d.strand == "+") return ("url(#rharrow_" + bt + ")");
			})
			.on("click", function (d) {
					$("#search_term").val(d.gene_name);
					var term = $("#search_term").val().toUpperCase();
					div.transition().duration(500).style("opacity", 0);
					d3.selectAll("svg").remove();
					renderHic(term, tissue, diameter, 1);
					return false;
			})
			.on("mouseover", function (d, i) {
				div.transition().duration(200).style("opacity", 0.9);
				div.html(d.gene_name + "</br>" + d.gene_biotype + "</br>" + d.gene_id + "</br>" + numberWithCommas(parseInt(d.start) + start) + "</br>" + numberWithCommas(parseInt(d.end) + start))
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
					
				d3.select(this).style("opacity", 0.3);
			})
			.on("mouseout", function (d) {
					div.transition().duration(500).style("opacity", 0);
					d3.select(this).style("opacity", 1);
			});
				
/*			gene.append("text")
		        .style("text-align", "left")
		        .attr("class", "svg_only")
		        .attr("transform", function (d) {
		        		return (computePointPath(d.start, d.end, 0, 0, 0, (diameter * 0.36) + (d.bumpLevel * 15), totalBP, diameter))
		        })
				.text(function (d) {
		        		//console.log(d.gene_name);
		        		return d.gene_name;
		        });*/
		        
		        
		
		$("#maxScore").val(addSNPTrack(data.meta, data.snps, totalBP));
		
		addInteractions(data.meta, hics, totalBP, tissues);
			
    	var angleOffset = 5,
		arcAvail = 360 - (2 * angleOffset)
		endAngle = (angleOffset * pi)/180,
		startAngle = ((arcAvail + angleOffset) * pi) / 180;
			
		var arc = d3.svg.arc()
			.innerRadius((diameter * 0.4) - 60).outerRadius(diameter * 0.4)
			.startAngle(-endAngle).endAngle(endAngle);
	
		vis.append("path").attr("d", arc).attr("id", "originWedge")
			.attr("fill", "lightgrey")
			.attr("transform", trans);
			
				
		var text = vis.append("text")
			.attr("x", 10).attr("dy", -5);
	
		text.append("textPath")
			.attr("xlink:href","#originWedge")
			.text("chr"+CHR)
		
		for(var t in tissues) {
			$("#"+t+"_count").text("("+tissues[t]+")");
		}   
		
		// end of JSON call     
	});
}

function addCenterScale(){
	var vis = d3.select("#main-svg");

    var innerRadius = diameter * 0.4,
    	outerRadius = innerRadius + 1,
    	angleOffset = 5,
		arcAvail = 360 - (2 * angleOffset),
		startAngle = (angleOffset * pi)/180,
		endAngle = ((arcAvail + angleOffset) * pi) / 180;
    
	tickData = getTickData(innerRadius, arcAvail, startAngle, endAngle);
	
	var scale_group = vis.append("g").attr("class", "track scale")
		.attr("id", "fullScale").selectAll("svg")
		.data([1]).enter();
			
	var arc = d3.svg.arc()
		.innerRadius(innerRadius).outerRadius(outerRadius)
		.startAngle(startAngle).endAngle(endAngle);
	
	scale_group.append("path").attr("d", arc).attr("id", "arcScale");
	
	var ticks = scale_group.append("g").attr("class", "axis scale ticks").selectAll("svg")
		.data(tickData).enter()
		.append("g")
		.attr("class", "tick")
		.attr("transform", function (d) {
				return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + outerRadius + ",0)";
		});

	ticks.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 5)
		.attr("y2", 0)
		.style("stroke", "#000");

	ticks.append("text")
		.attr("x", 8)
		.attr("dy", ".35em")
		.attr("transform", function(d) { return d.angle > pi ? "rotate(180)translate(-16)" : null; })
		.style("text-anchor", function(d) { return d.angle > pi ? "end" : null; })
		.text(function(d) { return d.label; });
	
	vis.select("#fullScale").attr("transform", trans)
}

function getTickData(innerRadius, arcAvail, startAngle, endAngle){
	
	var circum = innerRadius * pi;
	var circAvail = (((arcAvail * pi)/180)/(2 * pi)) * circum;
	var end = start + totalBP;
	
	var data = [{'label': null, 'angle': startAngle, 'position': start}];

	var position1 = 1000000 * Math.ceil(start/100000)/10
	var angle1 = (circAvail/totalBP)*(position1-start)/(2 * Math.PI * (diameter/2)) * (2 * Math.PI);
	data.push({'label': position1/1000000+"Mb", 'position': position1, 'angle': startAngle+angle1});
	//data.push({'label': numberWithCommas(position1), 'position': position1, 'angle': startAngle+angle1});

	var position2 = 1000000 * Math.floor(end/100000)/10
	var angle2 = (circAvail/totalBP)*(end-position2)/(2 * Math.PI * (diameter/2)) * (2 * Math.PI);

	var count = Math.ceil((position2-position1)/100000);
	var section = ((arcAvail * Math.PI)/180 - angle2 - angle1) / count;

	var totalAngle = startAngle+angle1;
	for (i=position1+100000; i<position2; i+=100000){
		label = Math.ceil(i/100000)/10
		//label = numberWithCommas(i);
		totalAngle += section
		data.push({'label': label+"Mb", 'position': i, 'angle': totalAngle});
		//data.push({'label': label, 'position': i, 'angle': totalAngle});
	}
	data.push({'label': position2/1000000+"Mb", 'position': position2, 'angle': endAngle-angle2});
	//data.push({'label': numberWithCommas(position2), 'position': position2, 'angle': endAngle-angle2});
	data.push({'label': null, 'angle': endAngle, 'position': end});
	//console.log(data);
	
	return data;
}
	

function addExtraData(extras){
	var vis = d3.select("#main-svg");
	var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0).style("width", "100px");
	
	var path = vis.append("g").attr("class", "track extras3").selectAll("svg")
		.data(extras.filter(function (d) { return CHR==d.chr; }))
		.enter()
		.append("path")
		.attr("d", function (d) {
				padding = (totalBP/1000) - (d.end-d.start);
				return (computeStrandPath(d.start-(padding/2), d.end+(padding/2), diameter * 0.35, totalBP));
		})
		.attr("transform", trans)
		.attr("stroke", "red")
		.attr("stroke-width", "100")
		.on("mouseover", function (d) {
			div.transition().duration(200).style("opacity", 0.9);
			div.html(d.name).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");
			d3.select(this).style("opacity", 0.3);
		})
		.on("mouseout", function (d) {
				div.transition().duration(500).style("opacity", 0);
				d3.select(this).style("opacity", 1);
		});
}

function addSNPTrack(meta, snps, totalBP){
	
	var vis = d3.select("#main-svg");
	var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0).style("width", "200px");
	var maxscore = 0;
	var tissue = $("input:radio[name=tissue]:checked").val();
	             
	for (var i = 0; i < snps.length; i++) {
		if (snps[i].score > maxscore) {
			maxscore = parseFloat(snps[i].score);
		}
	}
	
	var thresh = -1 * log10(1e-1);
	var symb = d3.svg.symbol();
	symb.size(10);
	vis.append("g").attr("class", "track snps").selectAll("svg")
		.data(snps.filter(function (d) {
				return parseFloat(d.score) >= thresh;
		}))
		.enter()
		.append("path")
		.attr("transform", function (d) {
				return (computePointPath(d.start, d.end, d.score, thresh, maxscore, diameter * 0.29, totalBP, diameter))
		})
		.attr("d", symb)
		.attr("stroke", function (d) {
				if (parseFloat(d.score) == maxscore) return "red";
				return "black";
		})
		.attr("fill", function (d) {
				if (parseFloat(d.score) == maxscore) return "red";
				return "black";
		})
		.on("mouseover", function (d, i) {
				div.transition()
				.duration(200)
				.style("opacity", 0.9);
				div.html(d.name + "</br>P Value (-log10) = " + parseFloat(d.score).toFixed(2) + "</br>" + numberWithCommas(parseInt(d.start) + parseInt(meta.rstart)) + "</br>")
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
				                                                     
				d3.select(this).style("opacity", 0.3);
		})
		.on("mouseout", function (d) {
				div.transition()
				.duration(500)
				.style("opacity", 0);
				d3.select(this).style("opacity", 1);
		})                                                          
		.on("click", function (d) {
            	$("#search_term").val(d.name);
            	var term = $("#search_term").val()
            	d3.selectAll("svg").remove();
            	renderHic(term, tissue, diameter, 1);
            	return false;
		})
		
		return maxscore;
}

function addInteractions(meta, hics, totalBP, tissues) {
	// add hic links
	
	var vis = d3.select("#main-svg");
	var tissue = $("input:radio[name=tissue]:checked").val();
	
	var path = vis.append("g").attr("class", "middle hic").selectAll("svg")
		.data(hics)
		.enter()
		.append("path")
		.attr("id", function (d, i) {
				return ('p' + i);
		})
		.attr("class", function(d){
				classes = "interaction";
				for (var i=0;i<meta.tissues.length;i++) {
					if (parseFloat(d[meta.tissues[i]]) >= interactionScore){
						classes += " "+meta.tissues[i];
						tissues[meta.tissues[i]]++;
					}
				}
				return classes;
		})
		//.attr("display", "none")
		.attr("d", function (d) {
				return computePath(d.baitStart + ((d.baitEnd - d.baitStart) / 2), d.oeStart + ((d.oeEnd - d.oeStart) / 2), diameter * 0.28, totalBP, diameter);
		})
		.attr("transform", trans)
		.attr("fill", "none")
		.attr("stroke-width", 3);
		
		pathDetails(path);
		
		vis.selectAll("path.interaction").sort(function (a, b) {
				if (parseFloat(a[tissue]) < interactionScore) return -1;
				if (a[tissue] > b[tissue]) return 1;
				if (b[tissue] > a[tissue]) return -1;
				else return 0;
		});
}

function pathDetails(interactions){
	var vis = d3.select("#main-svg");
	var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0).style("width", "100px");
	var tissue = $("input:radio[name=tissue]:checked").val();
	
	data = interactions.data();
	
	//var totalBP = $("#totalBP").val();
	
	interactions.attr("stroke", function (d) {
			if (parseFloat(d[tissue]) >= interactionScore){
				return interactionColor(d[tissue]);
			}
			else{
				return "lightgrey";
			}
	})
	.on("mouseover", function (d, i) {
			div.transition().duration(200).style("opacity", 0.9);
			div.html("CHiCAGO score " + parseFloat(d[tissue]).toFixed(2)).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
			
			vis.selectAll("path.interaction").sort(function (a, b) {
					if (parseFloat(a[tissue]) < interactionScore) return -1;
					if (a[tissue] > b[tissue]) return 1;
					if (b[tissue] > a[tissue]) return -1;
					else return 0;
			});
			
			if (d3.select(".updateClick").node() != null){
				this.parentNode.appendChild(d3.select(".updateClick").node());
			}
			d3.select(this).classed('hover', true);
			this.parentNode.appendChild(this);
			
			vis.append("path")
				.attr("class", "deleteMe")
				.attr("d", computeArcPath(d.oeStart, d.oeEnd, diameter * 0.28, diameter / 2.5, totalBP))
				.style("stroke-width", 1)
				.style("stroke", "red")
				.attr("transform", trans)
				.attr("fill", "none")
				
			vis.append("path")
				.attr("class", "deleteMe")
				.attr("d", computeArcPath(d.baitStart, d.baitEnd, diameter * 0.28, diameter / 2.5, totalBP))
				.style("stroke-width", 1)
				.style("stroke", "blue")
				.attr("transform", trans)
				.attr("fill", "none")
	})
	.on("mouseout", function (d, i) {
			div.transition().duration(500).style("opacity", 0);
			d3.select(this).classed('hover', false);
			vis.selectAll(".deleteMe").remove();			
			
			vis.selectAll("path.interaction").sort(function (a, b) {
					if (parseFloat(a[tissue]) < interactionScore) return -1;
					if (a[tissue] > b[tissue]) return 1;
					if (b[tissue] > a[tissue]) return -1;
					else return 0;
			});
			
			if (d3.select(".updateClick").node() != null){
				this.parentNode.appendChild(d3.select(".updateClick").node());
			}
	})
	.on("click", function (d) {
			resetVis();
            $(".deleteMe").attr('class', 'deleteClick');
            d3.select(this).classed('updateClick', true);
			
			$("#footer-bait").html('chr' + CHR + ':' + numberWithCommas(d.baitStart + start) + '..' + numberWithCommas(d.baitEnd + start) + " (" + ((d.baitEnd - d.baitStart) / 1000).toFixed(2) + "KB)");
			$("#footer-target").html('chr' + CHR + ':' + numberWithCommas(d.oeStart + start) + '..' + numberWithCommas(d.oeEnd + start) + " (" + ((d.oeEnd - d.oeStart) / 1000).toFixed(2) + "KB)");
				
			drawRegionPanel("bait", CHR, (d.baitStart +start), (d.baitEnd + start), $("#maxScore").val());
			drawRegionPanel("target", CHR, (d.oeStart + start), (d.oeEnd + start), $("#maxScore").val());
	});
	
	interactions.sort(function (a, b) {
			if (parseFloat(a[tissue]) < interactionScore) return -1;
			if (a[tissue] > b[tissue]) return 1;
			if (b[tissue] > a[tissue]) return -1;                                                                 
			else return 0;
	});
}

function drawRegionPanel(type, chr, start, end, maxscore) {	
	var region = chr+':'+start+'-'+end,
		data1 = [start, end],
		w = $("#panel-" + type).width(), h = 270, trackHeight = 90,
		margin = {top: 10, right: 10, bottom: 10, left: 10},
		formatxAxis = d3.format('0,000,000f'),
		xRange = d3.scale.linear().domain([d3.min(data1), d3.max(data1)]).range([(3 * margin.left), (w - margin.left)]),
		regionStart = d3.min(data1),
		tissue = $("input:radio[name=tissue]:checked").val();
		
	var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    var gwas = $("#gwas").val();
    
    $("#panel-" + type).isLoading({ text: "Loading", position: "overlay" });
		
	d3.json("/chicpea/search?region=" + region + '&tissue=' + tissue + '&snp_track=' + gwas, function (error, data) {
			if (error) { $("#panel-" + type).isLoading( "hide" ); return console.warn(error);}
			
			//console.log(data);
			adjustBump(data.genes, 100);	
			
			//Create the SVG Viewport
			var svgContainer = d3.select("#panel-" + type).append("svg:svg")
				.attr("width", w)
				.attr("height", h)
				.attr("id", type + "-svg");
				
			svgContainer.append("text")
				.attr("x", 0).attr("y", 0)
				.attr("text-anchor", "left")  
				.style("font-size", "18px")
				.attr("class", "svg_only")
				.text(type.substring(0,1).toUpperCase() + type.substring(1));
			
			//Create the Axis
			var xAxis = d3.svg.axis()
				.scale(xRange)
				.ticks(4)
				.tickFormat(formatxAxis);
			
			//Create an SVG group Element for the Axis elements and call the xAxis function
			var xAxisGroup = svgContainer.append("svg:g")
				.attr("class", "x axis").attr("id", type+"XAxis")
				.attr("transform", "translate(0," + (h - margin.top - margin.bottom) + ")")
				.call(xAxis);
				
			// TRACK 1 - SNPS
			var yRangeS = d3.scale.linear().domain([0, maxscore]).range([trackHeight - margin.top, margin.top]);
			
			var yAxis = d3.svg.axis()
				.scale(yRangeS)
				.ticks(3)
				.tickFormat(d3.format('.0f'))
				.tickSize(-(w - margin.right - 3 * margin.left), 0, 0)
				.orient("left");
			
			var yAxisGroup = svgContainer.append("svg:g")
				.attr("class", "y axis").attr("id", type+"YAxis")
				.attr("transform", "translate(" + (3 * margin.left) + ",0)")
				.call(yAxis);
			
			yAxisGroup.append("text")
				.attr("class", "y label")
				.style("text-anchor", "middle")
				.attr("text-anchor", "end")
				.attr("y", -2.5 * margin.left)
				.attr("x", -(0.5 * trackHeight))
				.attr("dy", ".75em")
				.attr("transform", "rotate(-90)")
				.text("P Value (-log10)");
				
			var snp = svgContainer.append("g").attr("class", "track snps").attr("id", type+"SNPTrack")
				.selectAll(".snp")
				.data(data.snps)
				.enter().append("g")
				.attr("class", "snp");		
			
			snp.append("path")
				.attr("class", "marker")
				.attr("d", d3.svg.symbol().size(30))
				.attr("stroke", function (d) {
					if (parseFloat(d.score) == maxscore) return "red";
					if (parseFloat(d.score) >= 7.03) return "green";
					return "lightgrey";
				})
				.attr("fill", function (d) {
					if (parseFloat(d.score) == maxscore) return "red";
					if (parseFloat(d.score) >= 7.03) return "green";
					return "lightgrey";
				})
				.attr("transform", function (d) {
					return "translate(" + xRange(d.start + regionStart) + "," + yRangeS(d.score) + ")";
				})
				.on("mouseover", function (d, i) {
						div.transition()
							.duration(200)
							.style("opacity", 0.9);
						div.html(d.name + "</br>" + d3.round(d.score, 3) + "</br>" + numberWithCommas(parseInt(d.start) + parseInt(regionStart)))
							.style("left", (d3.event.pageX + 10) + "px")
							.style("top", (d3.event.pageY - 18) + "px");
						d3.select(this).style("opacity", 0.3);
				})
				.on("mouseout", function (d) {
						div.transition()
							.duration(500)
							.style("opacity", 0);
						d3.select(this).style("opacity", 1);
				});
				
			// TRACK 2 - GENES
			var yRangeG = d3.scale.linear().domain([0, trackHeight]).range([margin.top, margin.top + trackHeight]);
			var geneTrackOffset = trackHeight + (margin.top);
				
			var gene = svgContainer.append("g").attr("class", "track genes").attr("id", type+"GeneTrack")
				.selectAll(".gene")
				.data(data.genes)
				.enter().append("g")
				.attr("class", "gene");
				
				var lineFunction = d3.svg.line()
					.x(function (d) {
					return d.x;
				})
					.y(function (d) {
					return d.y;
				})
					.interpolate("linear");
				
				gene.append("path")
					.attr("class", function (d) {
					return "line "+d.gene_biotype;
				})
					.attr("d", function (d) {
					if (d.strand == "-") {
						return lineFunction([{
							x: xRange(d.end + regionStart),
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel))
						}, {
							x: xRange(d.start + regionStart) + 5,
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel))
						}, {
							x: xRange(d.start + regionStart),
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel)) + 6
						}, {
							x: xRange(d.start + regionStart) + 5,
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel)) + 12
						}, {
							x: xRange(d.end + regionStart),
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel)) + 12
						}, {
							x: xRange(d.end + regionStart),
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel))
						}])
					} else {
						return lineFunction([{
							x: xRange(d.start + regionStart),
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel))
						}, {
							x: xRange(d.start + regionStart),
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel)) + 12
						}, {
							x: xRange(d.end + regionStart) - 5,
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel)) + 12
						}, {
							x: xRange(d.end + regionStart),
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel)) + 6
						}, {
							x: xRange(d.end + regionStart) - 5,
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel))
						}, {
							x: xRange(d.start + regionStart),
							y: geneTrackOffset + yRangeG((30 * d.bumpLevel))
						}])
					}
				});
				
			gene.append("text")
                .style("text-align", "right")
				.attr("y", function (d) {
				return geneTrackOffset + yRangeG(30 * d.bumpLevel);
			})
				.attr("x", function (d) {
				return xRange(d.start + regionStart) - 1.5*margin.left;
			})
				.attr("transform", function (d) {
				return "translate(0,-2)";
			})
				.text(function (d) {
				return d.gene_name;
			});
				
			// TRACK 3 - BLUEPRINT
			var yRangeB = d3.scale.linear().domain([0, trackHeight]).range([margin.top, margin.top + trackHeight]);
			var trackOffset = $('g#'+type+'GeneTrack').get(0).getBBox().height + $('g#'+type+'GeneTrack').get(0).getBBox().y;			
			if (trackOffset == 0){ // No genes to display!
				trackOffset = $('g#'+type+'YAxis').get(0).getBBox().height + $('g#'+type+'YAxis').get(0).getBBox().y;
			}

			var line = d3.svg.line()
				.interpolate("linear")
				.x(function (d) { return xRange(d.x+regionStart); })
				.y(function (d) { return yRangeB(d.y); });
			
			var blueprintTrack = svgContainer.append("g").attr("class", "track blueprint");
				
			
			for (var sample in data.blueprint){
				if (data.blueprint[sample].length == 0)
					continue;
				
				trackOffset += margin.top;
				
				var blueprint = blueprintTrack.append("g").attr("class", sample).selectAll(".blueprint")
					.data(data.blueprint[sample])
					.enter(); 
				
				/*var blueprint = svgContainer.append("g").attr("class", "track blueprint "+sample).selectAll(".blueprint")
					.data(data.blueprint[sample])
					.enter(); //.append("g");
					//.attr("class", "blueprint");*/
				
				blueprint.append("path")
					.attr("class", "line")
					.attr("d", function (d) {
							return line([ { x: d.start, y: trackOffset}, { x: d.end, y: trackOffset }]);
					})
					.attr("stroke", function (d) { return "rgb("+d.color+")"; })
					.attr("stroke-width", "6px")
					.on("mouseover", function (d, i) {
							div.transition()
								.duration(200)
								.style("opacity", 0.9);
							div.html("<strong>"+d.sample+"</strong><br/>"+d.name)
								.style("left", (d3.event.pageX + 10) + "px")
								.style("top", (d3.event.pageY - 18) + "px");
							d3.select(this).style("opacity", 0.3);
					})
					.on("mouseout", function (d) {
							div.transition()
								.duration(500)
								.style("opacity", 0);
							d3.select(this).style("opacity", 1);
					});
			}
			$("#panel-" + type).isLoading( "hide" ); 
	});	
}

function resetPage(term, tissue, breadcrumb) {
    d3.selectAll("svg").remove();
    resetVis();
    $("#search_term").val(term);
    $("#page_header").html(term + " in " + tissue.replace(/_/g, " ") + " Tissues");
    if (breadcrumb) $("#breadcrumb").append('<li id="BC-' + term + '"><a href="#" onclick=\'javascript:d3.selectAll("svg").remove(); $("#BC-' + term + '").remove(); renderHic("' + term + '", $("input:radio[name=tissue]:checked").val(), '+diameter+', 1)\'>' + term + '</a></li>');
}

function resetVis() {
	d3.select("#message").remove();	
	d3.select("#svg-container").selectAll(".deleteClick").remove();
	d3.select("#svg-container").selectAll(".updateClick").classed('updateClick', false);
	d3.select("#bait-svg").remove();
	d3.select("#target-svg").remove();
	$("#footer-bait").html("&nbsp;");
	$("#footer-target").html("&nbsp;");
}

$(document).ready(function () {
    $("#pushme").bind("click", function () {
    		var tissue = $("input:radio[name=tissue]:checked").val();
    		var term = $("#search_term").val();
    		renderHic(term, tissue, diameter, 1)
    		return (false);
    });

    $("input:radio[name=tissue]").bind("click", function () {
    		var tissue = $("input:radio[name=tissue]:checked").val();
    		var gene = $("#search_term").val();
    		$("#page_header").html(gene + " in " + tissue.replace(/_/g, " ") + " Tissues");
    		
    		resetVis();
    		pathDetails(d3.select("#svg-container").selectAll("path.interaction"));
    });
});

var termParam = getQueryVariable("term");
if (termParam == undefined){ termParam = 'IL2RA'; }
renderHic(termParam, 'Total_CD4_Activated', diameter, 1)