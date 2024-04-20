function register() {

    window.Handlebars.registerHelper('select', function(selected, options) {
        return options.fn(this).replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"');
    });

    window.Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });

    /*window.Handlebars.registerHelper('nl2br', function(text, isXhtml) {
        const breakTag = isXhtml ? '<br />' : '<br>'
        const withBr = Handlebars.escapeExpression(text).replace(
            /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
            '$1' + breakTag + '$2'
        );
        return new Handlebars.SafeString(withBr)
    });*/
    window.Handlebars.registerHelper('nl2br', function(options) {
        var nl2br = (options.fn(this) + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
        return new Handlebars.SafeString(nl2br);
    });
}

export default register;