/*
This creates a global function 'jsScriptLoader' that will load and run a javascript file
*/
if (jsScriptLoader === undefined) {
    const jsScriptLoader = function(url) {
        var s = document.createElement('script');
        s.type='text/javascript';
        document.body.appendChild(s);
        s.src=url;
        void(0);
    };
}
