function ModalActive(title, body) {
		$("#myModal .modal-title").html(title);
		$("#myModal .modal-body").html(body);
		$("#myModal").modal();
}

$("#Grant").on('click',function(){
	$.get('open_door/1234567', function(data){
		$("#myModal").modal('hide');
		console.log(data);
	});
});

$(document).ready(function() {	

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
			else if(data==2){
				$('#state').html('Deny');
			}
			else{
				$('#state').html('Recognition');
			}
		});
		socket.on('modal.active', function(data) {
			console.log("modal.active: "+data);
			header_string="Recognition";
			body_string='<div class=text-center><img src="images/'+data+'"></div>';
			ModalActive(header_string,body_string);	
		});
	});
});
