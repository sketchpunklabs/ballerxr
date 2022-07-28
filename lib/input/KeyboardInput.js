
export default class KeyboardInput{
    // #region MAIN
    keys = new Map();
    constructor(){
        document.body.addEventListener( 'keydown', this.onKeyDown );
        document.body.addEventListener( 'keyup', this.onKeyUp );
    }
    // #endregion
    
    // #region METHODS
    isDown( key ){ return (this.keys.get( key ) === true); }

    getArrowState(){
        return {
            up    : ( this.keys.get( 'ArrowUp' )    === true ),
            left  : ( this.keys.get( 'ArrowLeft' )  === true ),
            down  : ( this.keys.get( 'ArrowDown' )  === true ),
            right : ( this.keys.get( 'ArrowRight' ) === true ),
        };
    }
    // #endregion

    // #region EVENTS
    onKeyDown = ( e )=>{
        //console.log( 'down', e );
        this.keys.set( e.key, true );
    };

    onKeyUp = ( e )=>{
        //console.log( 'up', e );
        this.keys.set( e.key, false );
    };
    // #endregion
}