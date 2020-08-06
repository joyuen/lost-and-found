function humanizeRelative(now, date) {
    return moment.duration(date - now, 'milliseconds').humanize(true);
}

function removeNotif(notifid, button) {
    var target = $(button).closest(".notif");
    target.css("opacity", "0.25");
    $.post("/api/notifications/remove", {notifids: notifid}, function(data) {
        target.remove();
    });
}

function removeAllNotif() {
    var allTargets = $("#notifs-table").children();
    for (let target of allTargets) {
        $(target).css("opacity", "0.25");
    }
    $.post("/api/notifications/removeAll", {}, function(data) {
        for (let target of allTargets) {
            $(target).remove();
        }
    });
}

function createNotifElement(notif) {
    return ejs.render(`
      <div class="padding-div">
      <div class="card notif" style="position: relative;">
        <p class="notif-message"><%- notif.message %></p>
        <p class="notif-sent">
          <%= humanizeRelative(now, new Date(notif.sent)) %>
          <button class="pseudo notif-remove" onclick="removeNotif('<%= notif._id %>', this);">Remove</button>
        </p>
      </div>
      </div>
    `, { 'notif': notif, 'now': new Date() });
}

$(document).ready(function () {
    $.get("/api/notifications/read", function (data) {
        for (let notif of data) {
            $("#notifs-table").append(createNotifElement(notif));
        }
    });

    $("#notif-remove-all").on('click', function (e) {
        removeAllNotif();
    });
});