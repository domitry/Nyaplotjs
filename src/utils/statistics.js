define(['underscore'], function(_){
    var getMed = function(arr){
        arr.sort();
        var n = arr.length;
        return (n%2==1 ? arr[Math.floor(n/2)] : (arr[n/2]+arr[n/2+1])/2);
    };
    
    var q1 = function(arr){
        arr.sort();
        return getMed(arr.slice(0,arr.length/2-1));
    };
    
    var q3 = function(arr){
        arr.sort();
        return getMed(arr.slice((arr.length%2==0?arr.length/2:arr.length/2+1),arr.length-1));
    };
    
    return {
        med: getMed,
        q1:q1,
        q3:q3
    };
});
