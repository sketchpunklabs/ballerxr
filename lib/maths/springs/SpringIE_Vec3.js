import SpringBase_ImplicitEuler from './SpringBase_ImplicitEuler.js';

// function vec3_isZero( v ){
//     return ( v[0] === 0 && v[1] === 0 && v[2] === 0 );
// }

// function vec3_lenSqr2( a, b ){
//     return (a[0] - b[0])**2 + 
//            (a[1] - b[1])**2 + 
//            (a[2] - b[2])**2;
// }

// function vec3_lenSqr( a ){
//     return a[0]**2 + a[1]**2 + a[2]**2;
// }

// function vec3_set( a, x, y, z ){
//     a[0] = x;
//     a[1] = y;
//     a[2] = z;
// }

// function vec3_copy( a, b ){
//     a[0] = b[0];
//     a[1] = b[1];
//     a[2] = b[2];
// }


export default class SpringVec3_ImplicitEuler extends SpringBase_ImplicitEuler {
    // #region MAIN
    vel     = [0,0,0]; // Velocity
    val     = [0,0,0]; // Current Value
    tar     = [0,0,0]; // Target Value
    epsilon = 0.000001;
    // #endregion

    // #region ABSTRACT OVERRIDES
    setTarget( v ){ 
        vec3_copy( this.tar, v );
        return this;
    }
    
    update( dt ){
        // If there is no velocity & distance to target is zero, nothing to update.
        if( vec3_isZero( this.vel ) && vec3_lenSqr2( this.tar, this.val ) === 0 ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if ( Math.abs( this.vel ) < this.epsilon && Math.abs( this.tar - this.val ) < this.epsilon ) {
            this.vel = 0;
            this.val = this.tar;
            return true;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Near the end, reset
        if ( vec3_lenSqr( this.vel ) < this.epsilon && vec3_lenSqr2( this.tar, this.val ) < this.epsilon ) {
            vec3_set( this.vel, 0, 0, 0 );
            vec3_copy( this.val, this.tar );
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
        vec3_set( this.vel, 0, 0 ,0 );

        if( v ){
            vec3_copy( this.val, v );
            vec3_copy( this.tar, v );
        }else{
            vec3_set( this.val, 0, 0 ,0 );
            vec3_set( this.tar, 0, 0 ,0 );
        }
        return this;
    }
}
