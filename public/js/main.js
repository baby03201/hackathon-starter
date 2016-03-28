$(document).ready(function() {

  // Place JavaScript code here...
	/*
	if($('#state').length){
		setInterval(function(){
			$.get( "handler/151515", function( data ) {
				  console.log(data.success);
				  if(data.success==false){
					  $('#state').html('false');
				  }
				  else{	
					  $('#state').html('true');
				  }
			});	
		},1000);
	}*/

	$(".fancybox").fancybox();

	$(function(){
		var socket = io.connect();	
		socket.on('status.updated', function(data) {
			console.log("status: "+data);
			if(data==0){
				$('#state').html('Idle');
			}
			else if(data==1){
				$('#state').html('Granted');
			}
			else{
				$('#state').html('Deny');
			}
		});
	});

});
