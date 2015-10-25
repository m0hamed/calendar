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
          start: event.starts_at,
          end: event.ends_at,
          location: event.place
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
  var event_id = $("#event-form input[name='event_id'").val()
  $.post('/api/calendars/'+calendar_id+'/events/'+event_id+'?auth_token='+getAuthToken(),
         getEventData(),
         function(){ clearEvent(); window.location.reload()});
}

// gets the event form data as a json object.
function getEventData() {
  var event = {
    name: $("#event-form input[name='name'").val(),
    place: $("#event-form input[name='location'").val(),
    starts_at: new Date($("#event-form input[name='starts'").val()),
    ends_at: new Date($("#event-form input[name='ends'").val()),
  };
  alert(event);
  return event;
}

// sets the event form data to the supplied event and also fills the display with the info
function set_event(event) {
  $("#event_id").val(event.id);

  $("#event-form input[name='name']").val(event.title);
  $("#event-form input[name='location']").val(event.location);
  $("#event-form input[name='starts']").val(event.start);
  $("#event-form input[name='ends']").val(event.end);

  $("#event_name").text(event.title);
  $("#event_location").text(event.location);
  $("#event_starts").text(event.start);
  $("#event_ends").text(event.end);
}

// clears the currently selected event from display and form
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

// deletes the currently selected event
function deleteEvent() {
  var event_id = $("#event-form input[name='event_id'").val()
  var calendar_id = $('#calendar').data('calendar-id');
  console.log(event_id);
  $.ajax('/api/calendars/'+calendar_id+'/events/'+event_id+'?auth_token='+getAuthToken(),
         {type: "DELETE"}).
           done(function(){ clearEvent(); window.location.reload()});
}
