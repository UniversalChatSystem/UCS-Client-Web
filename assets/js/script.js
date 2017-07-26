function inputChange(input){
	if(input.value.length > 0){
		sendButton.enable();
	}else{
		sendButton.disable();
	}
}
function sendMessage(form){
	connection.sendMessage(element.getById("message").value);
	form.reset(); sendButton.disable();
}

var sendButton = {
	element: document.getElementById("send"),
	disable: function(){
		this.element.style.background = "#eee";
		this.element.style.border = "1px solid #ccc";
		this.element.style.color = "#999";
		this.element.setAttribute("disabled", "");
	},
	enable: function(){
		this.element.style.background = "#717bff";
		this.element.style.border = "1px solid #5a66ff";
		this.element.style.color = "#fff";
		this.element.removeAttribute("disabled");
	}
};