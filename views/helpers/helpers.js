var hbs = require('hbs');

hbs.registerHelper("navActivate", function(a, b) { return a == b; });
hbs.registerHelper("post_status", function(status) {
    return {
        'lost': 'Lost',
        'found': 'Found',
        'stolen': 'Stolen'
    }[status] || status;
});
hbs.registerHelper("post_campus", function(campus) {
    return {
        'burnaby': 'Burnaby Campus',
        'vancouver': 'Vancouver Campus',
        'surrey': 'Surrey Campus',
    }[campus] || campus;
});
hbs.registerHelper("post_date", function(date) {
    const formatter = new Intl.DateTimeFormat(undefined, {
        year:'numeric', 
        month:'short', 
        day:'numeric', 
        hour:'2-digit', 
        minute:'2-digit', 
        second:'2-digit'
    });
    return formatter.format(date);
});

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('commaList', function(arr) {
    return arr.join(', ');
});