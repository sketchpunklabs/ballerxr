import  SpringIE_Base   from './SpringIE_Base.js';
import { vec3 }         from 'gl-matrix';

function vec3_isZero( v ){
    return ( v[0] === 0 && v[1] === 0 && v[2] === 0 );
}

export default class SpringIE_Vec3 extends SpringIE_Base {
    // #region MAIN
    vel     = [0,0,0]; // Velocity
    val     = [0,0,0]; // Current Value
    tar     = [0,0,0]; // Target Value
    epsilon = 0.000001;
    // #endregion

    // #region ABSTRACT OVERRIDES
    setTarget( v ){ 
        vec3.copy( this.tar, v );
        return this;
    }
    
    update( dt, target=null ){
        if( target ) vec3.copy( this.tar, target );

        // If there is no velocity & distance to target is zero, nothing to update.
        if( vec3_isZero( this.vel ) && vec3.sqrDist( this.tar, this.val ) === 0 ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Near the end, reset
        if ( vec3.sqrLen( this.vel ) < this.epsilon && vec3.sqrDist( this.tar, this.val ) < this.epsilon ) {
            vec3.set( this.vel, 0, 0, 0 );
            vec3.copy( this.val, this.tar );
            return true;
        }
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const friction = 1.0 + 2.0 * dt * this.damping * this.osc_ps,
              dt_osc   = dt * this.osc_ps**2,
              dt2_osc  = dt * dt_osc,
              det_inv  = 1.0 / ( friction + dt2_osc );

        this.vel[0] = ( this.vel[0] + dt_osc * ( this.tar[0] - this.val[0] ) ) * det_inv;
        this.vel[1] = ( this.vel[1] + dt_osc * ( this.tar[1] - this.val[1] ) ) * det_inv;
        this.vel[2] = ( this.vel[2] + dt_osc * ( this.tar[2] - this.val[2] ) ) * det_inv;

        this.val[0] = ( friction * this.val[0] + dt * this.vel[0] + dt2_osc * this.tar[0] ) * det_inv;
        this.val[1] = ( friction * this.val[1] + dt * this.vel[1] + dt2_osc * this.tar[1] ) * det_inv;
        this.val[2] = ( friction * this.val[2] + dt * this.vel[2] + dt2_osc * this.tar[2] ) * det_inv;
        
        return true;
    }
    // #endregion

    reset( v=null ){
        vec3.set( this.vel, 0, 0 ,0 );

        if( v ){
            vec3.copy( this.val, v );
            vec3.copy( this.tar, v );
        }else{
            vec3.set( this.val, 0, 0 ,0 );
            vec3.set( this.tar, 0, 0 ,0 );
        }
        return this;
    }
}
