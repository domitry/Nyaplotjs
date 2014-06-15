(function (root, initialize){
    root.Ecoli = initialize();
}(this, function(){
    //modules here
/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../contrib/almond/almond", function(){});

//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

define('core/manager',[
    "underscore"
], function(_){
    var Manager = {data_frames: {}, panes: []};

    Manager.addData = function(name, df){
	entry = {};
	entry[name] = df;
	_.extend(this.data_frames, entry);
    };

    Manager.getData = function(name){
	return this.data_frames[name];
    };

    Manager.addPane = function(pane){
	this.panes.push(pane);
    };

    Manager.selected = function(data_id, rows){
	_.each(this.panes, function(entry){
	    entry.pane.selected(data_id, rows);
	});
    };

    Manager.update = function(){
	_.each(this.panes, function(entry){
	    entry.pane.update();
	});
    };

    Manager.updateData = function(data_id, column_name, value){

    };

    return Manager;
});

//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(require) == 'function') {
    try {
      var _rb = require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define('node-uuid',[],function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

define('view/diagrams/bar',[
    'underscore',
    'core/manager'
],function(_, Manager){
    function Bar(parent, scales, df_id, _options){
	var options = {
	    value: null,
	    x: null,
	    y: null,
	    width: 0.9,
	    color: null,
	    hover: true
	};
	if(arguments.length>3)_.extend(options, _options);

	var df = Manager.getData(df_id);

	var color_scale;
	if(options.color == null) color_scale = d3.scale.category20b();
	else color_scale = d3.scale.ordinal().range(options.color);
	this.color_scale = color_scale;

	var model = parent.append("g");

	var legends = [], labels;

	if(options.value !== null){
	    var column_value = df.column(options.value);
	    labels = _.uniq(column_value);
	}else
	    labels = df.column(options.value);
	
	_.each(labels, function(label){
	    legends.push({label: label, color:color_scale(label)});
	});

	this.model = model;
	this.scales = scales;
	this.options = options;
	this.legends = legends;
	this.df = df;
	this.df_id = df_id;
	this.uuid = options.uuid;

	this.update();

	return this;
    }

    Bar.prototype.update = function(){
	var data;
	if(this.options.value !== null){
	    var column_value = this.df.columnWithFilters(this.uuid, this.options.value);
	    var raw = this.countData(column_value);
	    data = this.proceedData(raw.x, raw.y, this.options);
	}else{
	    var column_x = this.df.columnWithFilters(this.uuid, this.options.x);
	    var column_y = this.df.columnWithFilters(this.uuid, this.options.y);
	    data = this.proceedData(column_x, column_y, this.options);
	}

	var rects = this.model.selectAll("rect").data(data);
	if(rects[0][0]==undefined){
	    rects.enter()
		.append("rect")
		.attr("height", 0)
		.attr("y", this.scales.y(0));
	}

	this.updateModels(rects, this.scales, this.options);
    };
    
    Bar.prototype.proceedData = function(x, y, options){
	return _.map(
	    _.zip(x,y),
	    function(d, i){return {x:d[0], y:d[1]};}
	);
    };

    Bar.prototype.updateModels = function(selector, scales, options){
	var color_scale = this.color_scale;

	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", function(d){return d3.rgb(color_scale(d.x)).darker(1);});
	};

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", function(d){return color_scale(d.x);});
	};

	var width = scales.x.rangeBand()*options.width;
	var padding = scales.x.rangeBand()*((1-options.width)/2);

	selector
	    .attr("x",function(d){return scales.x(d.x) + padding;})
	    .attr("width", width)
	    .attr("fill", function(d){return color_scale(d.x);})
	    .transition().duration(200)
	    .attr("y", function(d){return scales.y(d.y);})
	    .attr("height", function(d){return scales.y(0) - scales.y(d.y);});

	if(options.hover)selector
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);
    };

    Bar.prototype.countData = function(values){
	var hash = {};
	_.each(values, function(val){
	    hash[val] = hash[val] || 0;
	    hash[val] += 1;
	});
	return {x: _.keys(hash), y: _.values(hash)};
    };

    Bar.prototype.checkSelectedData = function(ranges){
	return;
    };

    return Bar;
});

define('view/components/filter',[
    'underscore',
    'core/manager'
],function(_, Manager){

    function Filter(parent, scales, callback, _options){
	var options = {
	    opacity: 0.125,
	    color: 'gray'
	};
	if(arguments.length>2)_.extend(options, _options);

	var brushed = function(){
	    var ranges = {
		x: (brush.empty() ? scales.x.domain() : brush.extent()),
		y: scales.y.domain()
	    };
	    callback(ranges);
	};

	var brush = d3.svg.brush()
	    .x(scales.x)
	    .on("brushend", brushed);

	var model = parent.append("g");
	var height = d3.max(scales.y.range()) - d3.min(scales.y.range());
	var y = d3.min(scales.y.range());

	model.call(brush)
	    .selectAll("rect")
	    .attr("y", y)
	    .attr("height", height)
	    .style("fill-opacity", options.opacity)
	    .style("fill", options.color)
	    .style("shape-rendering", "crispEdges");
	
	return this;
    }

    return Filter;
});

define('view/diagrams/histogram',[
    'underscore',
    'core/manager',
    'view/components/filter'
],function(_, Manager, Filter){
    function Histogram(parent, scales, df_id, _options){
	var options = {
	    title: 'histogram',
	    value: null,
	    bin_num: 20,
	    width: 0.9,
	    color:'steelblue',
	    stroke_color: 'black',
	    stroke_width: 1,
	    hover: false
	};
	if(arguments.length>3)_.extend(options, _options);

	var df = Manager.getData(df_id);
	var model = parent.append("g");

	this.scales = scales;
	this.legends = [{label: options.title, color:options.color}];
	this.options = options;
	this.model = model;
	this.df = df;
	this.df_id = df_id;
	this.uuid = options.uuid;

	this.update();
	
	return this;
    }

    Histogram.prototype.update = function(){
	var column_value = this.df.columnWithFilters(this.uuid, this.options.value);
	var data = this.proceedData(column_value, this.options);

	var models = this.model.selectAll("rect").data(data);
	if(models[0][0]==undefined){
	    models = models.enter()
		.append("rect")
		.attr("height", 0)
		.attr("y", this.scales.y(0));
	}

	this.updateModels(models,  this.scales, this.options);
    };

    Histogram.prototype.proceedData = function(column, options){
	return d3.layout.histogram()
	    .bins(this.scales.x.ticks(options.bin_num))(column);
    };

    Histogram.prototype.updateModels = function(selector, scales, options){
	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", d3.rgb(options.color).darker(1));
	};

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", options.color);
	};

	selector
	    .attr("x",function(d){return scales.x(d.x);})
	    .attr("width", function(d){return scales.x(d.dx) - scales.x(0);})
	    .attr("fill", options.color)
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("clip-path","url(#clip_context)")
	    .transition().duration(200)
	    .attr("y", function(d){return scales.y(d.y);})
	    .attr("height", function(d){return scales.y(0) - scales.y(d.y);});

	if(options.hover)selector
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);
    };

    Histogram.prototype.checkSelectedData = function(ranges){
	var label_value = this.options.value;
	var filter = function(row){
	    var val = row[label_value];
	    if(val > ranges.x[0] && val < ranges.x[1])return true;
	    else return false;
	};
	this.df.addFilter(this.uuid, filter, ['self']);
	Manager.update();
    };

    return Histogram;
});

define('view/diagrams/scatter',[
    'underscore',
    'core/manager',
    'view/components/filter'
],function(_, Manager, Filter){
    function Scatter(parent, scales, df_id, _options){
	var options = {
	    title: 'scatter',
	    x: null,
	    y: null,
	    r: 5,
	    shape:'circle',
	    color:'steelblue',
	    stroke_color: 'black',
	    stroke_width: 1,
	    hover: true
	};
	if(arguments.length>3)_.extend(options, _options);

	this.scales = scales;
	var df = Manager.getData(df_id);
	var data = this.proceedData(df.column(options.x), df.column(options.y), options);

	var model = parent.append("g");
	var circles = model.selectAll("circle")
	    .data(data)
	    .enter()
	    .append("circle")
	    .attr("r", 0)

	this.updateModels(circles, scales, options);

	this.legends = [{label: options.title, color:options.color,on:function(){}, off:function(){}}];
	this.options = options;
	this.model = model;
	this.df = df;
	this.df_id = df_id;

	return this;
    }

    Scatter.prototype.proceedData = function(x_arr, y_arr, options){
	return _.map(_.zip(x_arr, y_arr), function(d){return {x:d[0], y:d[1]}});
    }

    Scatter.prototype.updateModels = function(selector, scales, options){
	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", d3.rgb(options.color).darker(1));
	}

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", options.color);
	}

	selector
	    .attr("cx",function(d){return scales.x(d.x)})
	    .attr("cy", function(d){return scales.y(d.y)})
	    .attr("fill", options.color)
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("clip-path","url(#clip_context)")
	    .transition().duration(200)
	    .attr("r", options.r);

	if(options.hover)selector
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);
    }

    Scatter.prototype.selected = function(data, row_nums){
	var selected_cells = this.df.pickUpCells(this.options.value, row_nums)
	var data = this.proceedData(selected_cells, this.options);
	var models = this.model.selectAll("rect").data(data);
	this.updateModels(models, this.scales, this.options);
    }

    Scatter.prototype.updateData = function(){
	this.df = Manager.getData(df_id);
	var data = this.proceedData(df.column(options.value), options);
	var models = this.model.selectAll("circle").data(data);
	this.updateModels(models,  this.scales, this.options);
    }

    Scatter.prototype.checkSelectedData = function(ranges){
	var rows = [];
	var column = this.df.column(this.options.value);
	_.each(column, function(val, i){
	    if(val > ranges.x[0] && val < ranges.x[1])rows.push(i);
	});
	Manager.selected(this.df_id, rows);
    }

    return Scatter;
});

define('view/diagrams/line',[
    'underscore',
    'core/manager',
    'view/components/filter'
],function(_, Manager, Filter){
    function Line(parent, scales, df_id, _options){
	var options = {
	    x: null,
	    y: null,
	    title: 'line',
	    color:'steelblue',
	    stroke_width: 2
	};
	if(arguments.length>3)_.extend(options, _options);

	this.scales = scales;
	var df = Manager.getData(df_id);
	var data = this.proceedData(df.column(options.x), df.column(options.y), options);

	var model = parent.append("g");
	var path = model.append("path")
	    .datum(data);
	
	this.updateModels(path, scales, options);

	this.legends = [{label: options.title, color:options.color, on:function(){}, off:function(){}}];
	this.options = options;
	this.model = model;
	this.df = df;
	this.df_id = df_id;

	return this;
    }

    Line.prototype.proceedData = function(x_arr, y_arr, options){
	return _.map(_.zip(x_arr, y_arr), function(d){return {x:d[0], y:d[1]};});
    };

    Line.prototype.updateModels = function(selector, scales, options){
	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", d3.rgb(options.color).darker(1));
	};

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", options.color);
	};

	var line = d3.svg.line()
	    .x(function(d){return scales.x(d.x);})
	    .y(function(d){return scales.y(d.y);});

	selector
	    .attr("d", line)
	    .attr("stroke", options.color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("fill", "none");
    };

    Line.prototype.selected = function(data, row_nums){
	var selected_cells = this.df.pickUpCells(this.options.value, row_nums);
	var data = this.proceedData(selected_cells, this.options);
	var models = this.model.selectAll("path").datum(data);
	this.updateModels(models, this.scales, this.options);
    };

    Line.prototype.updateData = function(){
	this.df = Manager.getData(this.df_id);
	var data = this.proceedData(this.df.column(this.options.value), this.options);
	var models = this.model.selectAll("path").datum(data);
	this.updateModels(models,  this.scales, this.options);
    };

    Line.prototype.checkSelectedData = function(ranges){
	var rows = [];
	var column = this.df.column(this.options.value);
	_.each(column, function(val, i){
	    if(val > ranges.x[0] && val < ranges.x[1])rows.push(i);
	});
	Manager.selected(this.df_id, rows);
    };

    return Line;
});

define('utils/simplex',['underscore'], function(_){
    // constant values
    var l_1 = 0.7, l_2 = 1.5;
    var EPS = 1.0e-20;
    var count = 0, COUNT_LIMIT=2000;

    function calcCenter(vector){
	center = [];
	_.each(_.zip.apply(null, vector), function(arr, i){
            center[i] = 0
            _.each(arr, function(val){
		center[i] += val;
            });
            center[i] = center[i]/arr.length;
	});
	return center;
    }

    function rec(params, func){
	params = _.sortBy(params, function(p){return func(p);});
	var n = params.length;
	var val_num = params[0].length;
	var p_h = params[n-1];
	var p_g = params[n-2];
	var p_l = params[0];
	var p_c = calcCenter(params.concat().splice(0, n-1));
	var p_r = [];
	for(var i=0; i<val_num; i++)p_r[i]=2*p_c[i] - p_h[i];

	if(func(p_r) >= func(p_h)){
            // reduction
            for(var i=0;i<val_num;i++)
		params[n-1][i] = (1 - l_1)*p_h[i] + l_1 * p_r[i];
	}else if(func(p_r) < (func(p_l)+(l_2 - 1)*func(p_h))/l_2){
            // expand
            p_e = [];
            for(var i=0;i<val_num;i++)p_e[i] = l_2*p_r[i] - (l_2 -1)*p_h[i];
            if(func(p_e) <= func(p_r))params[n-1] = p_e;
            else params[n-1] = p_r;
	}else{
            params[n-1] = p_r;
	}

	if(func(params[n-1]) >=  func(p_g)){
            // reduction all
	    _.each(params, function(p, i){
		for(var j=0;j<val_num;j++){
		    params[i][j] = 0.5*(p[j] + p_l[j]);
		}
	    });
	}
	var sum = 0;
	_.each(params, function(p){sum += Math.pow(func(p) - func(p_l),2)});

	if(sum < EPS)return params[n-1];
	else{
	    count++;
	    if(count > COUNT_LIMIT)return params[n-1];
	    return rec(params, func);
	}
    }

    function simplex(params, func){
	var k = 1;
	var n = params.length;
	var p_default = [params];
	_.each(_.range(n), function(i){
            var p = params.concat();
            p[i] += k;
            p_default.push(p);
	});
	return rec(p_default, func);
    }

    return simplex;
});

define('view/diagrams/venn',[
    'underscore',
    'core/manager',
    'view/components/filter',
    'utils/simplex'
],function(_, Manager, Filter, simplex){
    function Venn(parent, scales, df_id, _options){
	var options = {
	    category: null,
	    count: null,
	    color:null,
	    stroke_color:'#000',
	    stroke_width: 1,
	    opacity: 0.7,
	    hover: false,
	    area_names:['VENN1','VENN2','VENN3'],
	    filter_control:false
	};
	if(arguments.length>3)_.extend(options, _options);

	var df = Manager.getData(df_id);
	var model = parent.append("g");

	var column_category = df.column(options.category);
	var categories = _.uniq(column_category);
	var color_scale;

	if(options.color == null)color_scale = d3.scale.category20().domain(options.area_names);
	else color_scale = d3.scale.ordinal().range(options.color).domain(options.area_names);
	this.color_scale = color_scale;

	var legends = [];
	var selected_category = [[categories[0]], [categories[1]], [categories[2]]];

	var update = this.update, tellUpdate = this.tellUpdate;
	var thisObj = this;

	for(var i=0;i<3;i++){
	    legends.push({label: options.area_names[i], color:color_scale(options.area_names[i])});
	    _.each(categories, function(category){
		var venn_id = i;
		var on = function(){
		    selected_category[venn_id].push(category);
		    update.call(thisObj);
		    tellUpdate.call(thisObj);
		};
		var off = function(){
		    var pos = selected_category[venn_id].indexOf(category);
		    selected_category[venn_id].splice(pos, 1);
		    update.call(thisObj);
		    tellUpdate.call(thisObj);
		};
		var mode = (category == selected_category[i] ? 'on' : 'off');
		legends.push({label: category, color:'black', mode:mode, on:on, off:off});
	    });
	    legends.push({label:''});
	}

	var filter_mode = 'all';
	if(options.filter_control){
	    legends.push({label:'Filter', color:'gray'});
	    var modes = ['all', 'overlapping', 'non-overlapping'];
	    var default_mode = filter_mode;
	    _.each(modes, function(mode){
		var on = function(){
		    thisObj.filter_mode = mode;
		    update.call(thisObj);
		    tellUpdate.call(thisObj);
		};
		var on_off = (mode==default_mode?'on':'off');
		legends.push({label:mode, color:'black', on:on, off:function(){},mode:on_off});
	    });
	}

	this.selected_category = selected_category;
	this.filter_mode = filter_mode;
	this.legends = legends;
	this.options = options;
	this.scales = scales;
	this.model = model;
	this.df_id = df_id;
	this.df = df;
	this.uuid = options.uuid;

	this.update();
	this.tellUpdate();

	return this;
    }

    Venn.prototype.getScales = function(data, scales){
	var r_w = _.max(scales.x.range()) - _.min(scales.x.range());
	var r_h = _.max(scales.y.range()) - _.min(scales.y.range());
	var d_x = {
	    min: (function(){var min_d = _.min(data.pos, function(d){return d.x - d.r;}); return min_d.x - min_d.r;})(),
	    max: (function(){var max_d = _.max(data.pos, function(d){return d.x + d.r;}); return max_d.x + max_d.r;})()
	};
	var d_y = {
	    min: (function(){var min_d = _.min(data.pos, function(d){return d.y - d.r;}); return min_d.y - min_d.r;})(),
	    max: (function(){var max_d = _.max(data.pos, function(d){return d.y + d.r;}); return max_d.y + max_d.r;})()
	};
	var d_w = d_x.max-d_x.min;
	var d_h = d_y.max-d_y.min;

	var scale = 0;
	if(r_w/r_h > d_w/d_h){
	    scale = d_h/r_h;
	    var new_d_w = scale*r_w;
	    d_x.min -= (new_d_w - d_w)/2;
	    d_x.max += (new_d_w - d_w)/2;
	}
	else{
	    scale = d_w/r_w;
	    var new_d_h = scale*r_h;
	    d_h.min -= (new_d_h - d_h)/2;
	    d_h.max += (new_d_h - d_h)/2;
	}
	var new_scales = {};
	new_scales.x = d3.scale.linear().range(scales.x.range()).domain([d_x.min, d_x.max]);
	new_scales.y = d3.scale.linear().range(scales.y.range()).domain([d_y.min, d_y.max]);
	new_scales.r = d3.scale.linear().range([0,100]).domain([0,100*scale]);
	return new_scales;
    };

    Venn.prototype.update = function(){
	var column_count = this.df.columnWithFilters(this.uuid, this.options.count);
	var column_category = this.df.columnWithFilters(this.uuid, this.options.category);

	var data = this.proceedData(column_category, column_count, this.selected_category);
	var scales = this.getScales(data, this.scales);
	var circles = this.model.selectAll("circle").data(data.pos);
	var texts = this.model.selectAll("text").data(data.labels);

	if(circles[0][0]==undefined)circles = circles.enter().append("circle");
	if(texts[0][0]==undefined)texts = texts.enter().append("text");

	this.counted_items = data.counted_items;
	this.updateModels(circles, scales, this.options);
	this.updateLabels(texts, scales, this.options);
    };

    Venn.prototype.proceedData = function(category_column, count_column, selected_category){
	// decide overlapping areas
	var items = (function(){
	    var table = [];
	    var counted_items = (function(){
		var hash={};
		_.each(_.zip(category_column, count_column), function(arr){
		    if(hash[arr[1]]==undefined)hash[arr[1]]={};
		    _.each(selected_category, function(category, i){
			if(category.indexOf(arr[0])!=-1)hash[arr[1]][i] = true;
		    });
		});
		return hash;
	    })();

	    var count_common = function(items){
		var cnt=0;
		_.each(_.values(counted_items), function(values, key){
		    if(!_.some(items, function(item){return !(item in values);}))cnt++;
		});
		return cnt;
	    };
	    
	    for(var i = 0; i<3; i++){
		table[i] = [];
		table[i][i] = count_common([i]);
		for(var j=i+1; j<3; j++){
		    var num = count_common([i, j]);
		    table[i][j] = num;
		}
	    }
	    return {table:table,counted_items:counted_items};
	})();
	var table=items.table;
	var counted_items=items.counted_items;

	// decide radius of each circle
	var r = _.map(table, function(row, i){
	    return Math.sqrt(table[i][i]/(2*Math.PI));
	});

	// function for minimizing loss of overlapping (values: x1,y1,x1,y1...)
	var evaluation = function(values){
	    var loss = 0;
	    for(var i=0;i<values.length;i+=2){
		for(var j=i+2;j<values.length;j+=2){
		    var x1=values[i], y1=values[i+1], x2=values[j], y2=values[j+1];
		    var r1=r[i/2], r2=r[j/2];
		    var d = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
		    var S = 0;
		    if(d > r1+r2)S = 0;
		    else{
			_.each([[r1, r2],[r2, r1]], function(r_arr){
			    var theta = Math.acos((r_arr[1]*r_arr[1] - r_arr[0]*r_arr[0] + d*d)/(2*r_arr[1]*d));
			    var s = r_arr[i]*r_arr[i]*theta - (1/2)*r_arr[1]*r_arr[1]*Math.sin(theta*2);
			    S += s;
			});
		    }
		    loss += Math.pow(table[i/2][j/2]-S,2);
		}
	    }
	    return loss;
	};

	// decide initial paramaters
	var init_params = (function(){
	    var params = [];
	    var set_num = table[0].length;
	    var max_area = _.max(table, function(arr, i){
		// calc the sum of overlapping area
		var result=0;
		for(var j=0;j<i;j++)result+=table[j][i];
		for(var j=i+1;j<arr.length;j++)result+=table[i][j];
		return result;
	    });
	    var center_i = set_num - max_area.length;
	    params[center_i*2] = 0; // x
	    params[center_i*2+1] = 0; // y
	    var rad=0, rad_interval=Math.PI/(1.5*(set_num-1));
	    for(var i=0;i<set_num;i++){
		if(i!=center_i){
		    var d = r[center_i] + r[i]/2;
		    params[i*2] = d*Math.sin(rad);
		    params[i*2+1] = d*Math.cos(rad);
		    rad += rad_interval;
		}
	    }
	    return params;
	})();

	// decide coordinates using Simplex method
	var params = simplex(init_params, evaluation);
	var pos=[], labels=[];
	for(var i=0;i<params.length;i+=2)
	    pos.push({x:params[i] ,y:params[i+1], r:r[i/2], id:i});

	for(var i=0;i<3;i++){
	    labels.push({x: params[i*2], y: params[i*2+1], val: table[i][i]});
	    for(var j=i+1;j<3;j++){
		var x = (params[i*2] + params[j*2])/2;
		var y = (params[i*2+1] + params[j*2+1])/2;
		labels.push({x: x, y: y, val: table[i][j]});
	    }
	}

	return {pos:pos, labels:labels, counted_items:counted_items};
    };

    Venn.prototype.updateModels = function(selector, scales, options){
	var color_scale = this.color_scale;
	var area_names = this.options.area_names;

	selector
	    .attr("cx", function(d){return scales.x(d.x);})
	    .attr("cy", function(d){return scales.y(d.y);})
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("fill", function(d){return color_scale(area_names[d.id]);})
	    .attr("fill-opacity", options.opacity)
	    .transition()
	    .duration(500)
	    .attr("r", function(d){return scales.r(d.r);});

	if(options.hover){
	    var onMouse = function(){
		d3.select(this).transition()
		    .duration(200)
		    .attr("fill", function(d){return d3.rgb(color_scale(area_names[d.id])).darker(1);});
	    };

	    var outMouse = function(){
		d3.select(this).transition()
		    .duration(200)
		    .attr("fill", function(d){return color_scale(area_names[d.id]);});
	    };
	    
	    selector
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);
	}
    };

    Venn.prototype.updateLabels = function(selector, scales, options){
	selector
	    .attr("x", function(d){return scales.x(d.x);})
	    .attr("y", function(d){return scales.y(d.y);})
	    .attr("text-anchor", "middle")
	    .text(function(d){return String(d.val);});
    };

    Venn.prototype.tellUpdate = function(){
	var rows=[], selected_category = this.selected_category;
	var counted_items = this.counted_items;
	var filter_mode = this.filter_mode;
	var category_num = this.options.category;
	var count_num = this.options.count;
	var filter = {
	    'all':function(row){
		// check if this row in in any area (VENN1, VENN2, VENN3,...)
		return _.some(selected_category, function(categories){
		    if(categories.indexOf(row[category_num])!=-1)return true;
		    else return false;
		});
	    },
	    'overlapping':function(row){
		if(!_.some(selected_category, function(categories){
		     if(categories.indexOf(row[category_num])!=-1)return true;
		     else return false;
		 }))return false;

		for(var i=0;i<3;i++){
		    for(var j=i+1;j<3;j++){
			if( 
			    counted_items[row[count_num]][i]
			   && counted_items[row[count_num]][j]
			  )return true;
		    }
		}
		return false;
	    },
	    'non-overlapping':function(row){
		if(!_.some(selected_category, function(categories){
		     if(categories.indexOf(row[category_num])!=-1)return true;
		     else return false;
		 }))return false;

		for(var i=0;i<3;i++){
		    for(var j=i+1;j<3;j++){
			if(counted_items[row[count_num]][i]
			   && counted_items[row[count_num]][j]
			  )return false;
		    }
		}
		return true;
	    }
	}[filter_mode];
	this.df.addFilter(this.uuid, filter, ['self']);
	Manager.update();
    };

    return Venn;
});

define('view/diagrams/multiple_venn',[
    'underscore',
    'core/manager',
    'view/components/filter',
    'utils/simplex'
],function(_, Manager, Filter, simplex){
    function Venn(parent, scales, df_id, _options){
	var options = {
	    category: null,
	    count: null,
	    color:null,
	    stroke_color:'#000',
	    stroke_width: 1,
	    opacity: 0.7,
	    hover: false
	};
	if(arguments.length>3)_.extend(options, _options);

	this.getScales = function(data, scales){
	    var r_w = _.max(scales.x.range()) - _.min(scales.x.range());
	    var r_h = _.max(scales.y.range()) - _.min(scales.y.range());
	    var d_x = {
		min: (function(){var min_d = _.min(data.pos, function(d){return d.x - d.r}); return min_d.x - min_d.r})(),
		max: (function(){var max_d = _.max(data.pos, function(d){return d.x + d.r}); return max_d.x + max_d.r})()
	    };
	    var d_y = {
		min: (function(){var min_d = _.min(data.pos, function(d){return d.y - d.r}); return min_d.y - min_d.r})(),
		max: (function(){var max_d = _.max(data.pos, function(d){return d.y + d.r}); return max_d.y + max_d.r})()
	    };
	    var d_w = d_x.max-d_x.min;
	    var d_h = d_y.max-d_y.min;

	    var scale = 0;
	    if(r_w/r_h > d_w/d_h){
		scale = d_h/r_h;
		var new_d_w = scale*r_w;
		d_x.min -= (new_d_w - d_w)/2;
		d_x.max += (new_d_w - d_w)/2;
	    }
	    else{
		scale = d_w/r_w;
		var new_d_h = scale*r_h;
		d_h.min -= (new_d_h - d_h)/2;
		d_h.max += (new_d_h - d_h)/2;
	    }
	    var new_scales = {};
	    new_scales.x = d3.scale.linear().range(scales.x.range()).domain([d_x.min, d_x.max]);
	    new_scales.y = d3.scale.linear().range(scales.y.range()).domain([d_y.min, d_y.max]);
	    new_scales.r = d3.scale.linear().range([0,100]).domain([0,100*scale]);
	    return new_scales;
	};

	var df = Manager.getData(df_id);
	var data = this.proceedData(df.column(options.category), df.column(options.count));
	var new_scales = this.getScales(data, scales);

	var model = parent.append("g");

	var circles = model
	    .selectAll("circle")
	    .data(data.pos)
	    .enter()
	    .append("circle");

	var texts = model
	    .selectAll("text")
	    .data(data.labels)
	    .enter()
	    .append("text");

	if(options.color == null)this.color_scale = d3.scale.category20();
	else this.color_scale = d3.scale.ordinal().range(options.color);
	var color_scale = this.color_scale;

	this.updateModels(circles, new_scales, options);
	this.updateLabels(texts, new_scales, options);

	var legends = [];
	_.each(data.pos, function(d){
	    legends.push({label: d.name, color:color_scale(d.name)});
	});

	this.legends = legends;
	this.scales = scales;
	this.options = options;
	this.model = model;
	this.df = df;
	this.df_id = df_id;

	return this;
    }

    Venn.prototype.proceedData = function(category_column, count_column){
	var categories = _.uniq(category_column);

	// decide overlapping areas
	var table = (function(){
	    var table = [];
	    var counted_items = (function(){
		var hash={};
		_.each(_.zip(category_column, count_column), function(arr){
		    if(hash[arr[1]]==undefined)hash[arr[1]]={};
		    hash[arr[1]][arr[0]] = true;
		});
		return _.values(hash);
	    })();

	    var count_common = function(items){
		var cnt=0;
		_.each(counted_items, function(values, key){
		    if(!_.some(items, function(item){return !(item in values)}))cnt++;
		});
		return cnt;
	    }
	    
	    for(var i = 0; i<categories.length; i++){
		table[i] = [];
		table[i][i] = count_common([categories[i]]);
		for(var j=i+1; j<categories.length; j++){
		    var num = count_common([categories[i], categories[j]]);
		    table[i][j] = num;
		}
	    }
	    return table;
	})();

	// decide radius of each circle
	var r = _.map(table, function(row, i){
	    return Math.sqrt(table[i][i]/(2*Math.PI));
	});

	// function for minimizing loss of overlapping (values: x1,y1,x1,y1...)
	var evaluation = function(values){
	    var loss = 0;
	    for(var i=0;i<values.length;i+=2){
		for(var j=i+2;j<values.length;j+=2){
		    var x1=values[i], y1=values[i+1], x2=values[j], y2=values[j+1];
		    var r1=r[i/2], r2=r[j/2];
		    var d = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
		    var S = 0;
		    if(d > r1+r2)S = 0;
		    else{
			_.each([[r1, r2],[r2, r1]], function(r_arr){
			    var theta = Math.acos((r_arr[1]*r_arr[1] - r_arr[0]*r_arr[0] + d*d)/(2*r_arr[1]*d));
			    var s = r_arr[i]*r_arr[i]*theta - (1/2)*r_arr[1]*r_arr[1]*Math.sin(theta*2);
			    S += s;
			});
		    }
		    loss += Math.pow(table[i/2][j/2]-S,2);
		}
	    }
	    return loss;
	}

	// decide initial paramaters
	var init_params = (function(){
	    var params = [];
	    var set_num = table[0].length;
	    var max_area = _.max(table, function(arr, i){
		// calc the sum of overlapping area
		var result=0;
		for(var j=0;j<i;j++)result+=table[j][i];
		for(var j=i+1;j<arr.length;j++)result+=table[i][j];
		return result;
	    });
	    var center_i = set_num - max_area.length;
	    params[center_i*2] = 0; // x
	    params[center_i*2+1] = 0; // y
	    var rad=0, rad_interval=Math.PI/(1.5*(set_num-1));
	    for(var i=0;i<set_num;i++){
		if(i!=center_i){
		    var d = r[center_i] + r[i]/2;
		    params[i*2] = d*Math.sin(rad);
		    params[i*2+1] = d*Math.cos(rad);
		    rad += rad_interval;
		}
	    }
	    return params;
	})();

	// decide coordinates using Simplex method
	var params = simplex(init_params, evaluation);
	var pos=[], labels=[];
	for(var i=0;i<params.length;i+=2)
	    pos.push({x:params[i] ,y:params[i+1], r:r[i/2], name:categories[i/2]});

	for(var i=0;i<categories.length;i++){
	    labels.push({x: params[i*2], y: params[i*2+1], val: table[i][i]});
	    for(var j=i+1;j<categories.length;j++){
		var x = (params[i*2] + params[j*2])/2;
		var y = (params[i*2+1] + params[j*2+1])/2;
		labels.push({x: x, y: y, val: table[i][j]});
	    }
	}

	return {pos:pos, labels:labels};
    }

    Venn.prototype.updateModels = function(selector, scales, options){
	var color_scale = this.color_scale;
	var onMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", function(d){return d3.rgb(color_scale(d.name)).darker(1)});
	}

	var outMouse = function(){
	    d3.select(this).transition()
		.duration(200)
		.attr("fill", function(d){return color_scale(d.name)});
	}

	selector
	    .attr("cx", function(d){return scales.x(d.x)})
	    .attr("cy", function(d){return scales.y(d.y)})
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width)
	    .attr("fill", function(d){return color_scale(d.name)})
	    .attr("fill-opacity", options.opacity)
	    .transition()
	    .duration(500)
	    .attr("r", function(d){return scales.r(d.r)});

	if(options.hover)selector
	    .on("mouseover", onMouse)
	    .on("mouseout", outMouse);
    }

    Venn.prototype.updateLabels = function(selector, scales, options){
	selector
	    .attr("x", function(d){return scales.x(d.x)})
	    .attr("y", function(d){return scales.y(d.y)})
	    .attr("text-anchor", "middle")
	    .text(function(d){return String(d.val)})
    }

    Venn.prototype.selected = function(data, row_nums){
	var selected_count = this.df.pickUpCells(this.options.count, row_nums);
	var selected_category = this.df.pickUpCells(this.options.category, row_nums);
	var data = this.proceedData(selected_category, selected_count, this.options);
	var scales = this.getScales(data, this.scales);

	var circles = this.model.selectAll("circle").data(data.pos);
	var texts = this.model.selectAll("text").data(data.labels);
	this.updateModels(circles, scales, this.options);
	this.updateLabels(texts, scales, this.options);
    }

    Venn.prototype.update = function(){
    }

    Venn.prototype.checkSelectedData = function(ranges){
    }

    return Venn;
});

define('view/diagrams/diagrams',['require','exports','module','view/diagrams/bar','view/diagrams/histogram','view/diagrams/scatter','view/diagrams/line','view/diagrams/venn','view/diagrams/multiple_venn'],function(require, exports, module){
    diagrams = {};

    diagrams.bar = require('view/diagrams/bar');
    diagrams.histogram = require('view/diagrams/histogram');
    diagrams.scatter = require('view/diagrams/scatter');
    diagrams.line = require('view/diagrams/line');
    diagrams.venn = require('view/diagrams/venn');
    diagrams.multiple_venn = require('view/diagrams/multiple_venn');

    return diagrams;
});

define('view/components/axis',[
    'underscore'
],function(_){
    function Axis(parent, scales, _options){
	var options = {
	    width:0,
	    height:0,
	    margin: {top:0,bottom:0,left:0,right:0},
	    stroke_color:"#fff",
	    stroke_width: 1.0,
	    x_label:'X',
	    y_label:'Y',
	    grid:true
	};
	if(arguments.length>2)_.extend(options, _options);

	var xAxis = d3.svg.axis()
	    .scale(scales.x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(scales.y)
	    .orient("left");

	if(options.grid){
	    xAxis.tickSize((-1)*options.height);
	    yAxis.tickSize((-1)*options.width);
	}

	parent.append("g")
	    .attr("class", "x_axis")
	    .attr("transform", "translate(0," + options.height + ")")
	    .call(xAxis);

	parent.append("g")
	    .attr("class", "y_axis")
	    .call(yAxis);

	parent.selectAll(".x_axis, .y_axis")
	    .selectAll("path, line")
	    .style("fill","none")
	    .style("stroke",options.stroke_color)
	    .style("stroke-width",options.stroke_width);

	parent.selectAll(".x_axis")
	    .selectAll("text")
	    .attr("transform", "translate(0,4)");

	parent.selectAll(".y_axis")
	    .selectAll("text")
	    .attr("transform", "translate(-4,0)");

	parent.append("text")
	    .attr("x", options.width/2)
	    .attr("y", options.height + options.margin.bottom/1.5)
	    .attr("text-anchor", "middle")
	    .attr("fill", "black")
	    .attr("font-size", 22)
	    .text(options.x_label);

	parent.append("text")
	    .attr("x", -options.margin.left/1.5)
	    .attr("y", options.height/2)
	    .attr("text-anchor", "middle")
	    .attr("fill", "black")
	    .attr("font-size", 22)
	    .attr("transform", "rotate(-90," + -options.margin.left/1.5 + ',' + options.height/2 + ")")
	    .text(options.y_label);

	this.xAxis = xAxis;
	this.yAxis = yAxis;
	this.model = parent;

	return this;
    }

    Axis.prototype.update = function(){
	this.model.selectAll(".x_axis").call(this.xAxis);
	this.model.selectAll(".y_axis").call(this.yAxis);
    };

    return Axis;
});

define('view/components/legend',[
    'underscore',
    'core/manager'
],function(_, Manager){
    function Legend(parent, _options){
	var options = {
	    title: '',
	    width: 100,
	    height: 500,
	    fill_color: "none",
	    stroke_color: "#000",
	    stroke_width: 0,
	    title_height: 15,
	    margin: {top:18, bottom:8, right:8, left: 18},
	    middle: false
	};
	if(arguments.length>1)_.extend(options, _options);

	parent.append("rect")
	    .attr("width", options.width)
	    .attr("height", options.height)
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("fill", options.fill_color)
	    .attr("stroke", options.stroke_color)
	    .attr("stroke-width", options.stroke_width);

	var model = parent.append("g")
	    .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

	model.append("text")
	    .attr("x", 0)
	    .attr("y", 0)
	    .text(options.title);

	this.model = model;
	this.options = options;
	this.data = [];

	return this;
    }

    Legend.prototype.add = function(label, color, callback_on, callback_off, mode){
	this.data.push({label:label, color:color, on:callback_on, off:callback_off});

	var new_entry = this.model.selectAll("g")
	    .data(this.data)
	    .enter()
	    .append("g");

	var padding = this.options.title_height;
	var height = this.options.height;

	if(this.options.width/100>2){
	    new_entry.attr("transform",function(d, i){
		return "translate("+ ((Math.floor(i/8))*100) +"," + (padding + 25*(i%8)) + ")";
	    });
	}else{
	    new_entry.attr("transform",function(d, i){
		return "translate(0," + (padding + 25*i) + ")";
	    });
	}

	if(color!==undefined){
	    var circle = new_entry
	    .append("circle")
	    .attr("cx","8")
	    .attr("cy","8")
	    .attr("r","6")
	    .attr("stroke", function(d){return d.color;})
	    .attr("stroke-width","2")
	    .attr("fill",function(d){return d.color;});

	    if(mode == 'off')circle.attr("fill-opacity",0);
	    else circle.attr("fill-opacity",1);

	    if(callback_on !== undefined && callback_off !== undefined){
		circle
		    .on("click", function(d){
		    var el = d3.select(this);
		    if(el.attr("fill-opacity")==1){
			el.attr("fill-opacity", 0);
			d.off();
		    }else{
			el.attr("fill-opacity", 1);
			d.on();
		    };
		})
		    .style("cursor","pointer");
	    }
	}

	new_entry.append("text")
	    .attr("x","18")
	    .attr("y","12")
	    .attr("font-size","12")
	    .text(function(d){return d.label;});

	if(this.options.middle){
	    var height = padding + this.data.length * 25;
	    this.model.attr("transform", "translate(" + this.options.margin.left + "," + (this.options.height - height)/2 + ")");
	}
    };

    return Legend;
});

define('view/pane',[
    'underscore',
    'node-uuid',
    'view/diagrams/diagrams',
    'view/components/axis',
    'view/components/filter',
    'view/components/legend'
],function(_, uuid, diagrams, Axis, Filter, Legend){
    function Pane(parent, _options){
	var options = {
	    width: 700,
	    height: 500,
	    margin: {top: 30, bottom: 80, left: 80, right: 30},
	    xrange: [0,0],
	    yrange: [0,0],
	    x_label:'X',
	    y_label:'Y',
	    zoom: true,
	    grid: true,
	    scale: 'fixed',
	    bg_color: '#eee',
	    grid_color: '#fff',
	    legend: true,
	    legend_width: 100,
	    legend_options: {}
	};
	if(arguments.length>1)_.extend(options, _options);

	var model = parent.append("svg")
	    .attr("width", options.width)
	    .attr("height", options.height);

	var inner_width = options.width - options.margin.left - options.margin.right;
	var inner_height = options.height - options.margin.top - options.margin.bottom;
	if(options.legend){
	    inner_width -= options.legend_width;
	}
	var ranges = {x:[0,inner_width], y:[inner_height,0]};
	var scales = {};

	_.each({x:'xrange',y:'yrange'},function(val, key){
	    if(options[val].length > 2 || _.any(options[val], function(el){return !isFinite(el);}))
		scales[key] = d3.scale.ordinal().domain(options[val]).rangeBands(ranges[key]);
	    else
		scales[key] = d3.scale.linear().domain(options[val]).range(ranges[key]);
	});

	model.append("g")
	    .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
	    .append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", inner_width)
	    .attr("height", inner_height)
	    .attr("stroke", "#000000")
	    .attr("stroke_width", 2)
	    .attr("fill", options.bg_color);

	var axis = new Axis(model.select("g"), scales, {
	    width:inner_width, 
	    height:inner_height,
	    margin:options.margin,
	    grid:options.grid,
	    x_label:options.x_label,
	    y_label:options.y_label,
	    stroke_color: options.grid_color
	});

	model.select("g")
	    .append("g")
	    .attr("class", "context")
	    .append("clipPath")
	    .attr("id", "clip_context")
	    .append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", inner_width)
	    .attr("height", inner_height);

	if(options.legend){
	    var legend_space = model.select("g")
		.append("g")
		.attr("transform", "translate(" + inner_width + ",0)");

	    options.legend_options['height'] = inner_height;
	    options.legend_options['width'] = options.legend_width;
	    this.legend = new Legend(legend_space, options.legend_options);
	}

	this.diagrams = [];
	this.context = model.select(".context");
	this.scales = scales;
	this.options = options;
	this.filter = null;

	return this;
    }

    Pane.prototype.addDiagram = function(type, data, options){
	_.extend(options, {uuid: uuid.v4()});
	var diagram = new diagrams[type](this.context, this.scales, data, options);
	var legend = this.legend;
	if(this.options.legend){
	    _.each(diagram.legends, function(l){
		legend.add(l['label'], l['color'], l['on'], l['off'], l['mode']);
	    });
	}
	this.diagrams.push(diagram);
    };

    Pane.prototype.addFilter = function(target, options){
	var diagrams = this.diagrams;
	var callback = function(ranges){
	    _.each(diagrams, function(diagram){
		diagram.checkSelectedData(ranges);
	    });
	};
	this.filter = new Filter(this.context, this.scales, callback, options);
    };

    Pane.prototype.selected = function(df_id, rows){
	var diagrams = this.diagrams;
	if(this.options.scale=='fluid'){
	    _.each(diagrams, function(diagram){
		if(diagram.df_id == df_id)diagram.selected(df_id, rows);
	    });
	}
    };

    Pane.prototype.update = function(){
	_.each(this.diagrams, function(diagram){
	    diagram.update();
	});
    };

    return Pane;
});

define('utils/dataframe',[
    'underscore'
],function(_){
    function Dataframe(name, data){
	if(data instanceof String && /url(.+)/g.test(data)){
	    var url = data.match(/url\((.+)\)/)[1];
	    var df = this;
	    d3.json(url, function(error, json){
		df.raw = JSON.parse(json);
	    });
	    this.raw = {};
	}
	else this.raw = data;
	this.filters = {};
	return this;
    }
    
    Dataframe.prototype.row = function(row_num){
	return this.raw[row_num];
    };

    Dataframe.prototype.column = function(label){
	var arr = [];
	var raw = this.raw;
	_.each(raw, function(row){arr.push(row[label]);});
	return arr;
    };

    Dataframe.prototype.addFilter = function(self_uuid, func, excepts){
	this.filters[self_uuid] = {func:func, excepts:excepts};
    };

    Dataframe.prototype.columnWithFilters = function(self_uuid, label){
	var raw = this.raw.concat();
	_.each(this.filters, function(filter, uuid){
	    if(filter.excepts.indexOf('self') != -1 && uuid==self_uuid)return;
	    if(!(self_uuid in filter.excepts))
		raw = _.filter(raw, filter.func);
	});
	return _.map(raw, function(row){return row[label];});
    };

    Dataframe.prototype.pickUpCells = function(label, row_nums){
	var column = this.column(label);
	return _.map(row_nums, function(i){
	    return column[i];
	});
    };

    Dataframe.prototype.columnRange = function(label){
	var column = this.column(label);
	return {
	    max: d3.max(column, function(val){return val;}),
	    min: d3.min(column, function(val){return val;})
	};
    };

    return Dataframe;
});

define('core/parse',[
    'underscore',
    'core/manager',
    'view/pane',
    'utils/dataframe'
],function(_, Manager, Pane, Dataframe){
    function parse(model, element_name){

	element = d3.select(element_name);

	_.each(model.data, function(value, name){
	    Manager.addData(name, new Dataframe(name, value));
	    Manager.update();
	});

	_.each(model.panes, function(pane_model){
	    var pane = new Pane(element, pane_model.options);
	    var data_list = [];

	    _.each(pane_model.diagrams, function(diagram){
		pane.addDiagram(diagram.type, diagram.data, diagram.options || {});
		data_list.push(diagram.data);
	    });

	    if(pane_model['filter'] !== undefined){
		var filter = pane_model.filter;
		pane.addFilter(filter.type, filter.options || {});
	    }

	    Manager.addPane({pane:pane, data: data_list});
	});
    }

    return parse;
});

define('main',['require','exports','module','core/parse'],function(require, exports, module){
    Ecoli = {};

    Ecoli.core = {};
    Ecoli.core.parse = require('core/parse');

    return Ecoli;
});

return require('main');
}));