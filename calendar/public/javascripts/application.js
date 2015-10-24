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
        href: "/events/" + calendar._id + "?auth_token=" + getAuthToken(),
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
          end: event.ends_at,
          location: event.place
        };
      });
      console.log(events);
      $('#calendar').fullCalendar(
        {
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,basicDay'
          },
          editable: true,
          events: events,
          eventClick: function(calEvent, jsEvent, view) {
            set_event(calEvent);
          }
        });
    });
}

function processEvent() {
  var calendar_id = $('#calendar').data('calendar-id');
  var event_id = $("#event-form input[name='event_id'").val()
  $.post('/api/calendars/'+calendar_id+'/events/'+event_id+'?auth_token='+getAuthToken(),
         getEventData(),
         function(){ clearEvent(); window.location.reload()});
}

function getEventData() {
  var event = {
    name: $("#event-form input[name='name'").val(),
    place: $("#event-form input[name='location'").val(),
    starts_at: $("#event-form input[name='starts'").val(),
    ends_at: $("#event-form input[name='ends'").val(),
  };
  return event;
}

function set_event(event) {
  $("#event_id").text(event.id);

  $("#event-form input[name='name']").val(event.title);
  $("#event-form input[name='location']").val(event.location);
  $("#event-form input[name='starts']").val(event.start);
  $("#event-form input[name='ends']").val(event.end);

  $("#event_name").text(event.title);
  $("#event_location").text(event.location);
  $("#event_starts").text(event.start);
  $("#event_ends").text(event.end);

  window.scrollTo(1000,1000);
}

function clearEvent() {
  $("#event_id").val("")

  $("#event-form input[name='name'").val("")
  $("#event-form input[name='location'").val("")
  $("#event-form input[name='starts'").val("")
  $("#event-form input[name='ends'").val("")
  $("#event_name").text("");
  $("#event_location").text("");
  $("#event_starts").text("");
  $("#event_ends").text("");
  return false;
}
