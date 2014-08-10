define(function(require, exports, module){
    var Nyaplot = {};

    Nyaplot.core = {};
    Nyaplot.core.parse = require('core/parse');

    Nyaplot.STL = require('core/stl');
    Nyaplot.Manager = require('core/manager');
    Nyaplot.uuid = require('node-uuid');
    Nyaplot._ = require('underscore');

    return Nyaplot;
});
