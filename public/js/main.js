$(document).ready(function() {

  // Place JavaScript code here...
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
	}

	$(".fancybox").fancybox();
});
