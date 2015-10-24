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
       window.location.replace("/calendars?auth_token=" + data.token);
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
  ).fail(function(err){
    $("#notification").text("Registeration failed! please try again.");
  });
}

function getCalendars() {
  $.get("/api/calendars?auth_token=" + getAuthToken(), function(data) {
    console.log(data);
    data.forEach(function(calendar) {
      $("#calendars").append($("<a />", {
        href: "/calendars/" + calendar._id + "/events?auth_token=" + getAuthToken(),
        text: calendar.name
      }));
      $("#calendars").append("<br/>");
    });
  }).fail(function(err) {
    console.log(err);
  });
}

function createCalendar() {
  var title = $("#new-calendar input[name='title'").val();
  $.post('/api/calendars?auth_token=' + getAuthToken(), {
    "name": title
  }, function(data) {
    window.location.replace(window.location);
  }).fail(function(err) {
    console.log(err);
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
