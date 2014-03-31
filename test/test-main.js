var tests = 
    Object.keys(window.__karma__.files)
        .filter(
            function (file) {
                return /\.test\.js$/.test(file);
            }
    );

requirejs.config(
    {
        // Karma serves files from '/base'
        baseUrl: '/base',

        paths: {
            'Squire': 'test/Squire',
            'jquery': 'test/jquery',
            'sinon': 'test/sinon',
            'logger/log' : "test/log"
        }, 
        shim : {
            sinon: {
                exports: 'sinon'
            }
        }
    }
);

require(tests, function() {
    window.__karma__.start();
})