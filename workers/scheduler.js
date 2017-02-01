function rec() {
	setTimeout(function(){ 
		console.log(new Date())
		rec()
	}, 60000)	
}
rec()