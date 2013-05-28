var current_group;
var response;
var dbg;

function magic_spell(text) {
    /* Pieces commented out because I wasn't able to test it. */
    var hashtag_exp = /#([a-zA-Z0-9]+)/g;
    var mention_exp = /@([a-zA-Z0-9]+)/g;
    var href_exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    text = text.replace(href_exp, "<a href='$1' target='_blank'>$1</a>"); 
    text = text.replace(hashtag_exp, '<a href="https://twitter.com/search?q=%23$1" target="_blank">#$1</a>');
    text = text.replace(mention_exp, '<a href="https://twitter.com/$1" target="_blank">@$1</a>');
    return text;
}

function get_hashtag() {
    var group_name = current_group.split(":");
    var hashtag = "#" + group_name[group_name.length-1]; 
    return hashtag;
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
    decommission_splash();
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
        ne.find('.author-handle').html('<a class="twitter_handle" target="_blank" href="https://twitter.com/' + data.results[i].from_user + '">@' + data.results[i].from_user + '</a>') ;
        ne.find('.post-content').html(magic_spell(data.results[i].text));
        dbg = ne.find('img');
    }
    $('#feed').show();
    clog("exiting render_results()");
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
    /* enlarge your widget. satisfy your user. */
    gadgets.window.adjustHeight(295);
    window.addEventListener("message", function(ev) {
        console.log(ev.data);
        if (!ev.data) {
            clog("No group.");
            messagebox('No group selected.', 'Weird, I couldn\'t get your current group.');
        } else if (ev.data != current_group) {
            current_group = ev.data;
            var group_name = ev.data.split(":");
            var hashtag = "#" + group_name[group_name.length-1]; 
            /* insert twitter button */
            conjure_tweet_button(hashtag);
            hashtag_search(hashtag);
            setInterval(function() {
                clog("15 seconds up. Updating feed.");
                hashtag_search(hashtag);
            }, 15000);        
        } else {
            clog("no changes required, same group.");
        }
    });

    top.postMessage("let's go!", "http://portaldev.cloud.jiscadvance.biz"); 
}

