// uses an ajax call to get a login token and stores it
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
    setNotification("Login failed please try again");
  });
}

// sets a message to the notification div
function setNotification(message) {
    $("#notification").text(message);
}

// uses an ajax call to register the user
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
    setNotification("Registeration failed! please try again.");
  });
}

// uses an ajax call to get a list of calendars
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
    setNotification(err);
  });
}

// uses an ajax call to create a calendar
function createCalendar() {
  var title = $("#new-calendar input[name='title'").val();
  $.post('/api/calendars?auth_token=' + getAuthToken(), {
    "name": title
  }, function(data) {
    window.location.replace(window.location);
  }).fail(function(err) {
    console.log(err);
    setNotification(err);
  });
}

// returns the login token
function getAuthToken() {
  return localStorage.getItem('login_token');
}

// displays the current calendar in the calendar page
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

// Creates a new event or updates an existing one based on the form data
function processEvent() {
  var calendar_id = $('#calendar').data('calendar-id');
  var event_id = $("#event_id").val();
  $.post('/api/calendars/'+calendar_id+'/events/'+event_id+'?auth_token='+getAuthToken(),
         getEventData(),
         function(){ clearEvent(); 
           window.location.replace('/events/' + calendar_id + '?auth_token=' + getAuthToken())});
}

// gets the event form data as a json object.
function getEventData() {
  var event = {
    name: $("#event-form input[name='name'").val(),
    place: $("#event-form input[name='location'").val(),
    starts_at: new Date($("#event-form input[name='starts'").val()),
    ends_at: new Date($("#event-form input[name='ends'").val()),
    google_id: $("#google_id").val(),
  };
  console.log(event);
  return event;
}

// sets the event form data to the supplied event and also fills the display with the info
function set_event(event) {
  $("#event_id").val(event.id);
  $("#google_id").val(event.google_id);

  $("#event-form input[name='name']").val(event.title); $("#event-form input[name='location']").val(event.location);
  $("#event-form input[name='starts']").val(event.start);
  $("#event-form input[name='ends']").val(event.end);

  $("#event_name").text(event.title);
  $("#event_location").text(event.location);
  $("#event_starts").text(event.start);
  $("#event_ends").text(event.end);

  window.scrollTo(0,1000);
}

// clears the currently selected event from display and form
function clearEvent() {
  $("#event_id").val("")
  $("#google_id").val("")

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

// syncs from remote google calendar. requests authorization if not provided
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

// syncs to remote google calendar. requests authorization if not provided
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

// deletes the currently selected event
function deleteEvent() {
  var event_id = $("#event_id").val()
  var calendar_id = $('#calendar').data('calendar-id');
  console.log(event_id);
  $.ajax('/api/calendars/'+calendar_id+'/events/'+event_id+'?auth_token='+getAuthToken(),
         {type: "DELETE"}).
           done(function(){ clearEvent(); window.location.reload()});
}
