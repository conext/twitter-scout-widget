var current_group;
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

function conjure_tweet_button(ht) {
    console.log(ht);
    var proto_1 = "<a href='https://twitter.com/intent/tweet?button_hashtag=";
    var proto_2 = "' class='twitter-hashtag-button' data-size='large'>Tweet ";
    var proto_3 = "</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";

    var btn = proto_1 + ht.substr(1) + proto_2 + ht + proto_3;
    $('#twitterbutton').empty();
    $('#twitterbutton').append($(btn));
}

function entry() {
    window.addEventListener("message", function(ev) {
        console.log(ev.data);
        if (ev.data != current_group) {
            var group_name = ev.data.split(":");
            var hashtag = "#" + group_name[group_name.length-1]; 
            /* insert twitter button */
            conjure_tweet_button(hashtag);
            hashtag_search(hashtag);
        } else {
            clog("no changes required, same group.");
        }
    });

    top.postMessage("let's go!", "http://portaldev.cloud.jiscadvance.biz"); 
}

