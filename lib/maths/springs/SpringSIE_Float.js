import SpringIE_Base from './SpringIE_Base.js';

// http://box2d.org/files/GDC2011/GDC2011_Catto_Erin_Soft_Constraints.pdf
// http://allenchou.net/2015/04/game-math-more-on-numeric-springing/
// Ocs_ps = PI * 2 * i (I should not be over 10)
// Damp_ratio = -Log(0.5) / ( osc_ps * damp_time ) :: Damp Time, in seconds to damp. So damp 0.5 for every 2 seconds.
// Damp_ratio is using half life, but can replace log(0.5) with any log value between 0 and 1.

// WARNING:: OSC PS can not be at 10 or over, the math will collapse at that point

export default class SpringSIE_Float extends SpringIE_Base {
    // #region MAIN
    vel     = 0; // Velocity
    value   = 0; // Current Value
    tar     = 0; // Target Value
    epsilon = 0.0001;
    // #endregion

    // #region ABSTRACT OVERRIDES
    setTarget( v ){ this.tar = v; return this; }
    
    update( dt ){
        if( this.vel === 0 && this.tar === this.value ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if ( Math.abs( this.vel ) < this.epsilon && Math.abs( this.tar - this.value ) < this.epsilon ) {
            this.vel   = 0;
            this.value = this.tar;
            return true;
        }
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		const friction  = -2.0 * dt * this.damping * this.osc_ps;
		const dt_osc    = dt * this.osc_ps**2;

        this.vel        = this.vel + ( friction * this.vel + dt_osc * ( this.tar - this.value ) );
		this.value      = this.value + this.vel * dt;

        return true;
    }
    // #endregion

    reset( v=null ){
        this.vel = 0;

        if( v != null ){
            this.value   = v;
            this.tar     = v;
        }else{
            this.value   = 0;
            this.tar     = 0;
        }
        return this;
    }
}
