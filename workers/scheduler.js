function rec() {
	setTimeout(function(){ 
		console.log(new Date())
		rec()
	}, 5000)	
}
rec()