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
            'd3': 'test/d3',
            'logger/log' : "test/log",
            'underscore' : 'test/underscore-min'
        }, 
        shim : {
            sinon: { exports: 'sinon' }
        ,   d3: { exports: 'd3' }        
        ,   underscore: { exports: 'underscore'  }
        }
    }
);

require(tests, function() {
    window.__karma__.start();
})