import Profiles from './GamepadProfiles.js';

export default class GamepadInput{
    // #region MAIN
    items           = [];
    onControlReady  = null;
    constructor(){
		window.addEventListener( 'gamepadconnected',    this.onConnect );
		window.addEventListener( 'gamepaddisconnected', this.onDisconnect );
    }
    // #endregion

    // #region EVENTS
    onConnect = (e)=>{
        // console.log( 'Index : %d, ID: %s', e.gamepad.index, e.gamepad.id );
        const id = e.gamepad.id;
        for( const p of Profiles ){
            if( id.indexOf( p.key ) !== -1 ){
                this.items.push( new InputProfile( e.gamepad.index, p ) );
                console.log( '[ Loading Controller ]', p.id );
                if( this.onControlReady ) this.onControlReady( p );
                return;
            }
        }
    };

    onDisconnect = (e)=>{ console.log( 'Dis', e ); };
    // #endregion

    poll(){
        if( this.items.length === 0 ) return;

        const gamepads = navigator.getGamepads();
        for( const ip of this.items ){
            ip.update( gamepads[ ip.index ] );
        }
    }
}


class InputProfile{
    constructor( gamepadIdx, profile ){
        this.index      = gamepadIdx;
        this.deadZone   = 0.1;
        this.mapAxes    = new Map();
        this.mapButtons = new Map();

        if( profile?.axes ){
            for( const [ k, v ] of Object.entries( profile.axes ) ){
                switch( v.type ){
                    case 'single': this.mapAxes.set( k, new AxesSingle( v ) ); break;
                    case 'array' : this.mapAxes.set( k, new AxesArray( v ) ); break;
                    default      : this.mapAxes.set( k, new Axes( v ) ); break;
                }
            }
        }

        if( profile?.buttons ){
            for( const [ k, v ] of Object.entries( profile.buttons ) ){
                this.mapButtons.set( k, new Button( v ) );
            }
        }
    }

    update( pad ){
        for( const [k,v] of this.mapAxes.entries() ){
            v.update( pad, this.deadZone );
            //if( v.active ) console.log( k, v.getValue() );
        }

        for( const [k,v] of this.mapButtons.entries() ){
            v.update( pad, this.deadZone );
            //if( v.updated ) console.log( k, v.isDown, v.value );
        }
    }

    getAxesValue( k ){
        const a = this.mapAxes.get( k );
        return ( a )? a.getValue() : null;
    }
}

// #region AXES INPUT
class Axes{
    constructor( props ){
        this._xIdx      = ( props.xIdx    !== undefined )? props.xIdx    : -1;
        this._yIdx      = ( props.yIdx    !== undefined )? props.yIdx    : -1;

        this.x          = 0;
        this.y          = 0;
        this.active     = false;
    }

    update( pad, deadZone ){
        let x = 0;
        let y = 0;

        if( this._xIdx !== -1 ){
            x = pad.axes[ this._xIdx ];
            if( Math.abs( x ) <= deadZone ) x = 0;
            this.x = x;
        }
        
        if( this._yIdx !== -1 ){
            y = pad.axes[ this._yIdx ];
            if( Math.abs( y ) <= deadZone ) y = 0;
            this.y = y;
        }

        this.active = ( x !== 0 || y !== 0 );
    }

    getValue(){ return [ this.x, this.y ]; }
}

class AxesSingle{
    constructor( props ){
        this._idx      = props.idx;
        this.value     = 0;
        this.active    = false;
    }

    update( pad, deadZone ){
        let v = pad.axes[ this._idx ];
        if( Math.abs( v ) <= deadZone ) v = 0;
        
        this.value  = v;
        this.active = ( v !== 0 );
    }

    getValue(){ return this.value; }
}

class AxesArray{
    constructor( props ){
        this._idx      = props.idx;
        this.array     = props.array;
        this.value     = -1;
        this.active    = false;
    }

    update( pad, deadZone ){
        let v = pad.axes[ this._idx ];
        v = this.array.indexOf( v );
        this.value  = v;
        this.active = ( v !== -1 );
    }

    getValue(){ return this.value; }
}
// #endregion

// #region BUTTON INPUT
class Button{
    constructor( props ){
        this._idx    = props.idx;
        this.value   = 0;
        this.isDown  = false;
        this.updated = false;
    }

    update( pad, deadZone ){
        let v = pad.buttons[ this._idx ].value;  

        if( Math.abs( v ) <= deadZone )        v = 0;

        if( this.value === 0 && v !== 0 )      this.isDown = true;
        else if( this.value !== 0 && v === 0 ) this.isDown = false;
        
        this.updated = ( this.value !== v );
        this.value   = v;
    }
}
// #endregion