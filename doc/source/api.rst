=============
API Reference
=============

External API
============



Plot
----

.. code-block:: javascript

   new Nyaplot.Plot(options)

Base class for general 2D plots.


Charts
------

.. code-block:: javascript

   new Nyaplot.Scatter(xarr, yarr, options)

.. code-block:: javascript

   new Nyaplot.Histogram(arr, options)

.. code-block:: javascript

   new Nyaplot.Line(xarr, yarr, options)


Internal API
============

These functions are only for developers.

   
Nyaplot.core
------------

.. code-block:: javascript

    Nyaplot.core.register_parser(name, args, optional_args, parser)
  
Register parser.
ex: `stage2d <https://github.com/domitry/Nyaplotjs/blob/4e5e61becde6ee8be12f625b3218907e1b253e06/src/parser/stage2d.js>`_

Nyaplot.glyph_manager
---------------------

.. code-block:: javascript

    Nyaplot.glyph_manager.register_glyph(name, args, optional_args, parser)
  

Nyaplot.sheet_manager
---------------------

.. code-block:: javascript

    Nyaplot.sheet_manager.register_sheet(name, args, optional_args, parser)
  
