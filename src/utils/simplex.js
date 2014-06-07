define(['underscore'], function(_){
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
