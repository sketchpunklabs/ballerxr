import SpringIE_Base from './SpringIE_Base.js';

export default class SpringIE_Float extends SpringIE_Base {
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
        const friction = 1.0 + 2.0 * dt * this.damping * this.osc_ps,
              dt_osc   = dt * this.osc_ps**2,
              dt2_osc  = dt * dt_osc,
              det_inv  = 1.0 / ( friction + dt2_osc );

        this.vel   = ( this.vel + dt_osc * ( this.tar - this.value ) ) * det_inv;
        this.value = ( friction * this.value + dt * this.vel + dt2_osc * this.tar ) * det_inv;
        
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
