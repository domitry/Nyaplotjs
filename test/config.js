var tests = [];
for(var file in window.__karma__.files) {
    if(window.__karma__.files.hasOwnProperty(file)) {
        if(/(.+)_spec.js/.test(file)) {
            tests.push(file);
        }
    }
}

require.config({
    baseUrl: '/base/src/',
    paths: {
        'underscore': '/base/contrib/underscore/underscore',
        'node-uuid':'/base/contrib/node-uuid/uuid',
        'colorbrewer': '/base/contrib/colorbrewer/colorbrewer'
    },
    deps: tests,
    callback: window.__karma__.start
});
