define(function(require, exports, module){
    var Nyaplot = {};

    Nyaplot.core = {};
    Nyaplot.core.parse = require('core/parse');

    Nyaplot.Manager = require('core/manager');
    Nyaplot.uuid = require('node-uuid');

    return Nyaplot;
});
