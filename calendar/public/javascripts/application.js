function login() {
  var username = $("#login input[name='username']").val();
  var password = $("#login input[name='password']").val();
  $.post("/api/users/login",
     {
       username: username,
       password: password
     },
     function(data){
       localStorage.setItem("login_token", data.token)
     }
  ).fail(function(){
    $("#notification").text("Login failed please try again");
  });
}

function register() {
  var username = $("#register input[name='username']").val();
  var password = $("#register input[name='password']").val();
  $.post("/api/users",
     {
       username: username,
       password: password
     },
     function(data){
       window.location.replace("/");
     }
  ).fail(function(){
    $("#notification").text("Login failed please try again");
  });
}

function getAuthToken() {
  return localStorage.getItem('login_token');
}

function display_calendar() {
  var calendar_id = $('#calendar').data('calendar-id');
  $.get('/api/calendars/'+calendar_id+'/events?auth_token='+getAuthToken(),
    function(data) {
      console.log(data)
      events = data.map(function(event) {
        return {
          id: event._id,
          title: event.name,
          start: event.starts_at,
          end: event.ends_at
        };
      });
      $('#calendar').fullCalendar(
        {
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,basicDay'
          },
          editable: true,
          events: events
        });
    });
}
