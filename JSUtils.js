module.exports = {
    flatten: (array) => {
        return array.reduce((flat, toFlatten) => {
            return flat.concat(Array.isArray(toFlatten) ? module.exports.flatten(toFlatten) : toFlatten);
        }, []);
    },

    indexOfMax: (arr) => {
        if (arr.length === 0) {
            return -1;
        }
    
        var max = arr[0];
        var maxIndex = 0;
    
        for (var i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                maxIndex = i;
                max = arr[i];
            }
        }
    
        return maxIndex;
    },

    indexOfMin: (arr) => {
        if(arr.length === 0) {
            return -1;
        }

        var min = arr[0];
        var minIndex = 0;

        for(var i = 1 ; i < arr.length; i++) {
            if(arr[i] < min) {
                minIndex = i;
                min = arr[i];
            }
        }

        return minIndex;
    },

    isNullOrWhitespace: (input) => {
        return !input || !input.trim();
    },


    defaults: (configObject, defaults, required) => {


        for (var property in defaults) { 

            if(!configObject.hasOwnProperty(property)) {

                configObject[property] = defaults[property];

            }

        }

        if(required) {
            
            for(var i = 0; i < required.length; i++) {

                if(!configObject.hasOwnProperty(required[i])) {
                    throw new Error(`Tried to construct object ${defaults.__name} but
                               missing property ${required[i]}`);
                }
                
            }
        }

        return configObject;
    },

    escapeHTML: (string) => {

        let pre = document.createElement('pre');
        let text = document.createTextNode( string );
        pre.appendChild(text);
        return pre.innerHTML;

    },
    
};