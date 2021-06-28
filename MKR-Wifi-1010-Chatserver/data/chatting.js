var username = prompt("Please enter your name", "");

if (username && username.replace(/\s/g, "").length) {
  var date = Date.now();
  var token = username + date;

  var container = document.getElementById("msg-container");
  var input = document.getElementById("msg-input");
  var submit = document.getElementById("msg-submit");

  var connection = new WebSocket("ws://" + location.hostname + ":81/");

  connection.onopen = function () {
    container.innerHTML +=
      '<div class="msg bot"><div class="msg-txt">You are connected!</div></div>';
    connection.send(
      '{"user" : "' +
        username +
        '", "token" : "' +
        token +
        '", "payload" : "Connected to chat..."}'
    );
  };

  connection.onerror = function (error) {
    console.log("WebSocket Error ", error);
    container.innerHTML +=
      '<div class="msg bot"><div class="msg-txt">An error occured!</div></div>';
  };

  connection.onmessage = function (e) {
    var msg = e.data;



    if (isJSON(msg)) {
      var msgObj = JSON.parse(msg);
      if (msgObj.token == token) {
        container.innerHTML +=
          '<div class="msg own"><div class="msg-txt">' +
          msgObj.payload +
          '</div><div class="msg-time">' +
          formatAMPM(new Date) +
          '</div></div>';
      } else {
        container.innerHTML +=
          '<div class="msg"><div class="msg-name">' +
          msgObj.user +
          '</div><div class="msg-txt">' +
          msgObj.payload +
          '</div><div class="msg-time">' +
          formatAMPM(new Date) +
          '</div></div>';
      }
    } else {
      container.innerHTML += "<p>" + msg + "</p>";
    }

    container.scrollTop = container.scrollHeight - container.clientHeight;
  };

  connection.onclose = function () {
    console.log("WebSocket connection closed");
    container.innerHTML +=
      '<div class="msg"><div class="user">bot</div><div class="text">You are disconnected!</div></div>';
  };

  function isJSON(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  // event listeners to send the message

  submit.addEventListener("click", sendMsg);

  input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      submit.click();
    }
  });

  function sendMsg() {
    var msg = input.value;
    if (!msg.replace(/\s/g, "").length) {
      return;
    }
    connection.send(
      '{"user" : "' +
        username +
        '", "token" : "' +
        token +
        '", "payload" : "' +
        msg +
        '"}'
    );
    input.value = "";
    submit.classList.remove('filled');
  }
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
