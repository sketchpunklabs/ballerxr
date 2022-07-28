function getType( url ){
    const i = url.lastIndexOf( '.' );
    const ext = url.substring( i+1 ).toLowerCase();
    switch( ext ){
        case 'jpg': case 'png': case 'gif': return 'blob';
        default: return 'text';
    }
}

export default function XhrFetch( url, type=null ){
    return new Promise(( resolve, reject )=>{
        const xhr = new XMLHttpRequest();
        xhr.open( 'GET', url );
        xhr.responseType = type || getType( url );
        
        //xhr.onabort
    	//xhr.ontimeout
        xhr.onerror = ()=>{ reject( 'network error' ); }
        xhr.onload  = ()=>{
            if( xhr.status === 200 ){
                
                if( xhr.responseType === 'blob' && xhr.response.type.indexOf( 'image') >= 0  ){
                    const img = new Image();
                    img.crossOrigin	= 'anonymous';
                    img.src 		= window.URL.createObjectURL( xhr.response );
                    img.onload	    = ()=>resolve( img );
                    img.onerror     = ()=>reject( 'Problem putting blob into an image' );
                }else{
                    resolve( xhr.response );
                }

            }else{
                reject( xhr.statusText ); 
            }
        };

        xhr.send();
    });
};