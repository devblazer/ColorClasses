;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})

// format: ( String:moduleName, Function:thatReturnsSomethingUseful [, Array:ofRequiredModulesToLoad] )
// Note the the function will receive the loaded requirements as parameters with their stripped down names
// eg: ['js/base64.js', 'js/math.js'] becomes: function (base64, math) {} 

('insertNameHere', function () {
    return 'something';
},[]);