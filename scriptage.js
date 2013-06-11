var current_group;
var dbg;
var cb; /* Codebird object */

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
    return hashtag.replace(/-/gi, '');
}

function clog(message) {
    console.log("Twitter Scout ~> " + message);
}

function hashtag_search(hashtag) {

    cb.__call(
        'search_tweets',
        'q=' + encodeURIComponent(hashtag),
        function(response) {
            console.log(response);
            default_parser(response);
        },
        true /* This bit makes it an app-only request. */
    );

}

function default_parser(data) {
    decommission_splash();
    $('#messagebox').hide();
    (data.statuses.length == 0) ? render_empty_feed() : render_results(data);
}

function decommission_splash() {
    $('#splash').css('display', 'none');
    $('#content').css('display', 'block');
}

function render_empty_feed() {
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
    console.log(data.statuses.length);
    $('#feed').empty();
    for (var i = 0; i < data.statuses.length; i++) {
        v = data.statuses[i];
        var ne = $('.clone-model').clone(true); // new entry
        ne.appendTo($('#feed'));
        ne.removeClass('clone-model');
        ne.find('img').attr('src', v.user.profile_image_url_https);
        ne.find('.author-username').text(v.user.name);

        hc = '<a class="twitter_handle" target="_blank" href="https://twitter.com/';
        hc += v.user.screen_name;
        hc += '">@';
        hc += v.user.screen_name;
        hc += '</a>';

        ne.find('.author-handle').html(hc) ;
        ne.find('.post-content').html(magic_spell(v.text));
        ne.find('#pa-st')
            .attr('href', 'https://twitter.com/' + v.user.screen_name + '/status/' + v.id_str)
            .attr('target', '_blank');
        dbg = ne.find('img');
    };
    $('#feed').show();
}

function conjure_tweet_button(ht) {
    var proto_1 = "<a href='https://twitter.com/intent/tweet?button_hashtag=";
    var proto_2 = "' class='twitter-hashtag-button' data-size='large'>Tweet ";
    var proto_3 = "</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";

    var btn = proto_1 + ht.substr(1) + proto_2 + ht + proto_3;
    $('#twitterbutton').empty();
    $('#twitterbutton').append($(btn));
}

function entry() {
    /* Initialize codebird with client id & secret. Not so secret, though. */
    cb = new Codebird;
    cb.setConsumerKey('dxehhzPeHv5fa0kF0TWg', 'p2WnJFYxMEupZSyXsVmoDiV4hLB29LNxVukdY5P4Xo0');

    /* enlarge your widget. satisfy your user. */
    gadgets.window.adjustHeight(295);

    /* Set up a postMessage listener to get/request current group from container. */
    window.addEventListener("message", function(ev) {
        if (!ev.data) {
            messagebox('No group selected.', 'Weird, I couldn\'t get your current group.');
        } else if (ev.data != current_group) {
            current_group = ev.data;
            var group_name = ev.data.split(":");
            var hashtag = "#" + group_name[group_name.length-1]; 
            hashtag = hashtag.replace(/-/g, ''); 
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

    /* Post any message at all to get group info from container. */
    top.postMessage("let's go!", top.location.origin);
}

