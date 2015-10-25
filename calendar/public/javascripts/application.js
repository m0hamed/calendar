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
      events = data.map(function(event) {
        return {
          id: event._id,
          title: event.name,
          start: new Date(event.starts_at),
          end: new Date(event.ends_at),
          location: event.place,
          google_id: event.google_id
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
          events: events,
          eventClick: function(calEvent, jsEvent, view) {
            set_event(calEvent);
          }
        });
    });
}

function processEvent() {
  var calendar_id = $('#calendar').data('calendar-id');
  var event_id = $("#event_id").text();
  $.post('/api/calendars/'+calendar_id+'/events/'+event_id+'?auth_token='+getAuthToken(),
         getEventData(),
         function(){ clearEvent(); 
           window.location.replace('/events/' + calendar_id + '?auth_token=' + getAuthToken())});
}

function getEventData() {
  var event = {
    name: $("#event-form input[name='name'").val(),
    place: $("#event-form input[name='location'").val(),
    starts_at: new Date($("#event-form input[name='starts'").val()),
    ends_at: new Date($("#event-form input[name='ends'").val()),
    google_id: $("#google_id").text(),
  };
  console.log(event);
  return event;
}

function set_event(event) {
  $("#event_id").text(event.id);
  $("#google_id").text(event.google_id);

  $("#event-form input[name='name']").val(event.title);
  $("#event-form input[name='location']").val(event.location);
  $("#event-form input[name='starts']").val(event.start);
  $("#event-form input[name='ends']").val(event.end);

  $("#event_name").text(event.title);
  $("#event_location").text(event.location);
  $("#event_starts").text(event.start);
  $("#event_ends").text(event.end);

  window.scrollTo(0,1000);
}

function clearEvent() {
  $("#event_id").text("")
  $("#google_id").text("")

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

function syncFromRemote() {
  var calendar_id = $('#calendar').data('calendar-id');
  $.post('/api/calendars/' + calendar_id + '/events/syncfromremote?auth_token='
         + getAuthToken(), {}, function(data) { 
           window.location.reload();
         }).fail(function(error) { 
           if (error.status == 307)
             window.location.replace(error.responseText);
           else if (error.status == 417)
             syncFromRemote();
         });
  return false;
}

function syncToRemote() {
  var calendar_id = $('#calendar').data('calendar-id');
  $.post('/api/calendars/' + calendar_id + '/events/synctoremote?auth_token='
         + getAuthToken(), {}, function(data) { 
           window.location.reload();
         }).fail(function(error) { 
           if (error.status == 307)
             window.location.replace(error.responseText);
           else if (error.status == 417)
             syncToRemote();
         });
  return false;
}
