/* 
 * Return UA information
 */

define(['underscore'], function(_){
    return (function(){
        var userAgent = window.navigator.userAgent.toLowerCase();
        if(userAgent.indexOf('chrome')!=-1)return 'chrome';
        if(userAgent.indexOf('firefox')!=-1)return 'firefox';
        else return 'unknown';
    });
});
