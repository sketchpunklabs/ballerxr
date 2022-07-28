// Based On
// http://allenchou.net/2015/04/game-math-more-on-numeric-springing/
// http://allenchou.net/2015/04/game-math-precise-control-over-numeric-springing/

export default class SpringIE_Base{
    // #region MAIN
    osc_ps  = Math.PI * 2;  // Oscillation per Second : How many Cycles (Pi*2) per second.	
    damping = 1;            // How much to slow down : Value between 0 and 1. 1 creates critical damping.
    epsilon = 0.01;
    // #endregion

    // #region SETTERS / GETTERS
    setOscPs( sec ){    this.osc_ps = Math.PI * 2 * sec; return this; }
    setDamp( damping ){ this.damping = damping; return this; }
    
    // Damp Time, in seconds to damp. So damp 0.5 for every 2 seconds.
    // With the idea that for every 2 seconds, about 0.5 damping has been applied
    setDampRatio( damping, dampTimeSec ){ this.damping = Math.log( damping ) / ( -this.osc_ps * dampTimeSec ); return this; }
    
    // Reduce oscillation by half in X amount of seconds
    setDampHalflife( dampTimeSec ){
        this.damping = 0.6931472 / ( this.osc_ps * dampTimeSec ); // float zeta = -ln(0.5f) / ( omega * lambda );
        return this;
    }

    // Critical Damping with a speed control of how fast the cycle to run
    setDampExpo( dampTimeSec ){
        this.osc_ps  = 0.6931472 / dampTimeSec; // -Log(0.5) but in terms of OCS its 39.7 degrees over time
        this.damping = 1;
        return this
    }
    // #endregion

    // #region ABSTRACT OVERRIDES
    setTarget( v ){ console.log( "SET_TARGET NOT IMPLEMENTED"); return this; }
    update( dt ){ console.log( "UPDATE NOT IMPLEMENTED"); return false; }
    // #endregion
}
