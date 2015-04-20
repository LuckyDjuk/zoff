var old_input="";
var timer = 0;
/*jshint multistr: true */

$(document).ready(function()
{
	$( "#results" ).hover( function() { $("div.result").removeClass("hoverResults"); i = 0; }, function() { });


	$("#search").focus();

	$('#base').bind("keyup keypress", function(e) {
		var code = e.keyCode || e.which;
		if (code  == 13) {
			e.preventDefault();
			return false;
		}
	});

	$(".search_input").focus();
	$(".search_input").keyup(function(event) {
		var search_input = $(this).val();
		if(event.keyCode == 13 && search_input == "fireplace")
		{
			if(!peis)
			{
				peis = true;
				loadjsfile("js/jazzscript.js");

			}else
			{
				peis = false;
				document.getElementsByClassName("jp")[0].style.display = "none";
				document.getElementsByClassName("ytplayer")[0].style.display = "inline";
				pauseJazz();
			}
		}

		if (event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 13 && event.keyCode != 39 && event.keyCode != 37) {
			if(search_input.length < 3){$("#results").html("");}
			if(event.keyCode == 13){
			 	search(search_input);
			}else if(event.keyCode == 27){
				$("#results").html("");
				$(".main").removeClass("blurT");
				$("#controls").removeClass("blurT");
				$(".main").removeClass("clickthrough");
				showSearch();
			}else{
				i = 0;
				timer=100;
			}
		}else if(event.keyCode == 13)
		{
			//console.log(search_input);
			//console.log(search_input.split("list=")[1]);
			pId = search_input.split("list=");
			if(pId.length > 1)
			{
				pListUrl = "http://gdata.youtube.com/feeds/api/playlists/"+pId[1]+"/?format=5&max-results=50&v=2&alt=jsonc";
				$.ajax({
					type: "GET",
					url: pListUrl,
					dataType:"jsonp",
					success: function(response)
					{
						$.each(response.data.items, function(i,data)
						{
							submit(data.video.id, data.video.title, true, data.video.duration);
						});
					}
				});
			}
		}


	});

	setInterval(function(){
		timer--;
		if(timer===0){
			search($(".search_input").val());
		}
	}, 1);
});

$(document).keyup(function(e) {
	if ($("div.result").length > 2){
	    if (e.keyCode == 40) {
	    	if(i < $("div.result").length -2)
	    		i++;
	    	$("div.result:nth-child("+(i-1)+")").removeClass("hoverResults");
	    	$("div.result:nth-child("+i+")").addClass("hoverResults");
	    } else if (e.keyCode == 38) {
	    	$("div.result:nth-child("+i+")").removeClass("hoverResults");
	    	$("div.result:nth-child("+(i-1)+")").addClass("hoverResults");
	    	if(i > 1)
	    		i--;
	    } else if(e.keyCode == 13) {
	    	i = 0;
	    	var elem = document.getElementsByClassName("hoverResults")[0];
			if (typeof elem.onclick == "function") {
			    elem.onclick.apply(elem);
			}
	    	$("div.hoverResults").removeClass("hoverResults");
	    	$("#results").html('');
	    	document.getElementById("search").value = "";
	    	$(".main").removeClass("blurT");
			$("#controls").removeClass("blurT");
			$(".main").removeClass("clickthrough");
	    }
	}
});

function showSearch(){
	$("#search-wrapper").toggleClass("hide");
	$("#song-title").toggleClass("hide");
	$("#search").focus();
}

function search(search_input){


		$("#results").html('');
		if(search_input !== ""){
			var keyword= encodeURIComponent(search_input);

			var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+keyword+'&format=5&orderby=relevance&max-results=30&v=2&alt=jsonc';

			$.ajax({
				type: "GET",
				url: yt_url,
				dataType:"jsonp",
				success: function(response)
				{
					if(response.data.items)
					{
						var wrapper = "";
						z = 0;
						$.each(response.data.items, function(i,data)
						{
							if(data.duration > 720 && longsongs == true){return;}
							if(data.category == "Music" || music == false){
								var video_title=encodeURIComponent(data.title).replace(/'/g, "\\\'");
								var views=data.viewCount;
								var video_thumb = "http://i.ytimg.com/vi/"+data.id+"/default.jpg";
								var length = Math.floor(data.duration/60)+":"+(data.duration-Math.floor(data.duration / 60)*60);
								var finalhtml="\
								<div id='result' class='result' onclick=\"submitAndClose('"+data.id+"','"+video_title+"', "+data.duration+");\">\
									<img src='"+video_thumb+"' class='thumb'>\
									<div id='title'>"+data.title+"\
										<div class='result_info'>"+views+" views • "+length+"</div>\
										</div>\
								</div>";
								//<input id='add' title='Add several songs' type='button' class='button' value='+' onclick=\"submit('"+data.id+"','"+video_title+"', false);\">\
								//+data.uploader+" • "+
								//$("#results").append(finalhtml);
								wrapper += finalhtml;
								z++;
							}
							return (z !== 6);
						});
						//console.log(wrapper);
						//$("#results").append(wrapper).show("slow");
						if(wrapper.length > 0)
						{
							$(".main").addClass("blurT");
							$("#controls").addClass("blurT");
							$(".main").addClass("clickthrough");
						}

						$("<div id='r' style='display:none;'>"+wrapper+"</div>").appendTo('#results').slideDown('slow');

					}
					else{ $("#video").html("<div id='no'>No Video</div>");}
				}

			});
		}else{
			$(".main").removeClass("blurT");
			$("#controls").removeClass("blurT");
			$(".main").removeClass("clickthrough");
		}

}

function submitAndClose(id,title,duration){
	submit(id,title, true, duration);
	$("#results").html('');
	showSearch();
	console.log("sub&closed");

}

function submit(id,title,type, duration){

	socket.emit("add", [id, decodeURIComponent(title), adminpass, duration]);
	if(type){
		document.getElementById("search").value = "";
		$("#results").html = "";
		$(".main").removeClass("blurT");
		$("#controls").removeClass("blurT");
		$(".main").removeClass("clickthrough");
	}
}
