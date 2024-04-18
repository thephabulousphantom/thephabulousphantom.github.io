function register() {

    window.Handlebars.registerHelper('select', function(selected, options) {
        return options.fn(this).replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"');
    });

    window.Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });
}

export default register;