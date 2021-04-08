function getQueryParameter(url, name) {
    var regex = new RegExp("[\\?&]" + name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]") + "=([^&#]*)");
    return regex.exec(url)[1];
}
var gdata = function(){};
gdata.io = function(){};
gdata.io.handleScriptLoaded = function(data) {
    $.each(data.feed.link, function(i) {
        if (this.rel == "self") {
            var callbackFunctionName = getQueryParameter(this.href, "callback");
            eval(callbackFunctionName)(data);
        }
    });
}
