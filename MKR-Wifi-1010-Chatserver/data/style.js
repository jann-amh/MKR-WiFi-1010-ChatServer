var container = document.getElementById("msg-container");
var input = document.getElementById("msg-input");
var submit = document.getElementById("msg-submit");

input.addEventListener("input", function () {
	var content = input.value;
	if(!input.value.replace(/\s/g, '').length) {
		submit.classList.remove('filled'); // not working
		console.log('no content');
	} else {
		submit.classList.add('filled');
		console.log('content');
	};
});

input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    submit.click();
  }
});