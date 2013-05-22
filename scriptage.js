var response;
var dbg;

function magic_spell(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1'>$1</a>"); 
}

function get_hashtag() {
    return "#startupweekend";
}

function clog(message) {
    console.log("Twitter Scout ~> " + message);
}

function hashtag_search(hashtag) {
    var url = 'https://search.twitter.com/search.json?q=' + encodeURIComponent(hashtag);
    /* X-Origin */
    url += "&callback=?";

    $.ajax(url, {
        dataType: "json",
        success: function(data) {
            clog("API call succeeded.");
            console.log(data);
            default_parser(data);
        },
        error: function(data) {
            clog("Oops. API call borked.");
            console.log(data);
            default_parser(data);
        },
    });
}

function default_parser(data) {
    decommission_splash();
    response = data;
    clog("in default_parser()");
    if (data.results.length == 0) {
        clog("no results.");
        render_empty_feed();
    } else {
        clog("> 0 results");
        render_results(data);
    }
}

function decommission_splash() {
    $('#splash').css('display', 'none');
    $('#content').css('display', 'block');
}

function render_empty_feed() {
    clog("in render_empty_feed()");
    messagebox(
        "No one tweeted.", 
        "There doesn't seem to be anything happening for <span id='ht'>" + get_hashtag() + "</span>."
    ); 
}

function messagebox(message, description) {
    $('#feed').hide();
    $('#messagebox').show();
    $('#mbox_title').text(message);
    $('#mbox_description').html(description);
}

function render_results(data) {
    clog("in render_results()");
    console.log(data.results.length);
    for (var i = 0; i < data.results.length; i++) {
        var ne = $('.clone-model').clone(true); // new entry
        ne.appendTo($('#feed'));
        ne.removeClass('clone-model');
        ne.find('img').attr('src', data.results[i].profile_image_url_https);
        ne.find('.author-username').text(data.results[i].from_user_name);
        ne.find('.author-handle').text('@' + data.results[i].from_user);
        ne.find('.post-content').html(magic_spell(data.results[i].text));
        dbg = ne.find('img');
    }
    $('#feed').show();
    clog("exiting redner_results()");
}

function entry() {
    var hashtag = get_hashtag();    
    hashtag_search(hashtag);
}

