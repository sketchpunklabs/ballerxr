import * as THREE        from 'three';
import { vec3 }          from 'gl-matrix';

// #region NOTES
/*
    Mouse Drag              : Free Orbit Target
    Scroll Wheel            : Zoom Target
    Scroll Wheel + Shift    : Zoom Target Faster
    Scroll Wheel + Alt      : Lon Orbit Target

    ArrowUp/Down            : Move Target from Camera's Forward Direction
    ArrowLeft/Right         : Pan's targets from camera's Right Direction

    ArrowUp/Down + Shift    : Moves Target from Camera's Up Direction

    ArrowUp/Down + Ctrl     : Lat Orbit Target
    ArrowLeft/Right + Ctrl  : Lon Orbit Target
*/
// #endregion

// #region CONSTANTS & HELPER FUNCTIONS
const STEP_SCALE        = 6.0;  // Scale Up Step of Movement Target
const ORBIT_SCALE       = 0.2;  // Scale the Delta Mouse Movements when applied to Orbit rotation
const WHEEL_SCALE       = 0.01; // Scale mouse wheel input used for zoom
const ZOOM_MIN_DISTANCE = 0.4;  // Minimum distance to travel while zooming
const TARGET_STEP       = 0.2;  // Distance to travel for each step of movement for the target

const UP              = [0, 1, 0];
const RIGHT           = [1, 0, 0];
const FORWARD         = [0, 0, 1];

function polar2cartesian( lon, lat, radius ){
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const sPhi = Math.sin(phi);

    return [
        -( radius * sPhi * Math.sin(theta) ),
        radius * Math.cos(phi),
        -( radius * sPhi * Math.cos(theta) ),
    ];
}

function cartesian2polar( v ){
    const len = Math.sqrt(v[0] ** 2 + v[2] ** 2);
    return [
        Math.atan2( v[0], v[2] ) * (180 / Math.PI), // lon
        Math.atan2( v[1], len )  * (180 / Math.PI), // lat
    ];
}

// Same concept of Matrix4 lookAt function to generate a ViewMatrix
// gl-matrix doesn't have a function like this for quaternions, but written like if it was
function quatLook( out, viewDir, upDir ){
    const zAxis = vec3.copy( [0, 0, 0], viewDir);
    const xAxis = vec3.cross([0, 0, 0], upDir, zAxis);
    const yAxis = vec3.cross([0, 0, 0], zAxis, xAxis);

    vec3.normalize(xAxis, xAxis);
    vec3.normalize(yAxis, yAxis);
    vec3.normalize(zAxis, zAxis);

    // Mat3 to Quat
    const m00 = xAxis[0];
    const m01 = xAxis[1];
    const m02 = xAxis[2];
    const m10 = yAxis[0];
    const m11 = yAxis[1];
    const m12 = yAxis[2];
    const m20 = zAxis[0];
    const m21 = zAxis[1];
    const m22 = zAxis[2];
    const t = m00 + m11 + m22;

    let x = 0;
    let y = 0;
    let z = 0;
    let w = 0;
    let s = 0;

    if (t > 0.0) {
        s = Math.sqrt(t + 1.0);
        w = s * 0.5; // |w| >= 0.5
        s = 0.5 / s;
        x = (m12 - m21) * s;
        y = (m20 - m02) * s;
        z = (m01 - m10) * s;
    } else if (m00 >= m11 && m00 >= m22) {
        s = Math.sqrt(1.0 + m00 - m11 - m22);
        x = 0.5 * s; // |x| >= 0.5
        s = 0.5 / s;
        y = (m01 + m10) * s;
        z = (m02 + m20) * s;
        w = (m12 - m21) * s;
    } else if (m11 > m22) {
        s = Math.sqrt(1.0 + m11 - m00 - m22);
        y = 0.5 * s; // |y| >= 0.5
        s = 0.5 / s;
        x = (m10 + m01) * s;
        z = (m21 + m12) * s;
        w = (m20 - m02) * s;
    } else {
        s = Math.sqrt(1.0 + m22 - m00 - m11);
        z = 0.5 * s; // |z| >= 0.5
        s = 0.5 / s;
        x = (m20 + m02) * s;
        y = (m21 + m12) * s;
        w = (m01 - m10) * s;
    }

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
}

// #endregion

// Replacement for THREEJs OrbitControls
// This performs Orbit Rotation around a target position while adding FPS movement
// on the target to make it easier for the user to traverse the 3D space
export default class OrbitCam {

    // #region MAIN
    camera    =  null;
    canvas    =  null;
    renderer  =  null;
    target    = [0, 0, 0]; // Position of cursor, the focal point of the orbit controls
    enabled   = true;      // Need to be able to turn off event input handling
    keys      = new Map(); // State of a key press, lets user hold down multiple buttons

    _initPolar = [0, 0]; // Init Polar Coord on Mouse Down
    _initA     = 0; // Temporary Holders on Mouse Down
    _initB     = 0;
    _initC     = 0;

    constructor( camera, renderer, useKeyboard=false ){
        this.renderer   = renderer;
        this.camera     = camera;
        this.canvas     = renderer.domElement;

        // Set keys that will be handled by KeyDown Events
        this.keys.set( 'ArrowUp', false );
        this.keys.set( 'ArrowDown', false );
        this.keys.set( 'ArrowLeft', false );
        this.keys.set( 'ArrowRight', false );

        // Assign Event Listeners
        this.canvas.addEventListener( 'wheel', this.onWheel, true );
        this.canvas.addEventListener( 'mousedown', this.onMouseDown, true );

        if( useKeyboard ){
            document.addEventListener( 'keydown', this.onKeyDown, true );
            document.addEventListener( 'keyup', this.onKeyUp, true );
        }
    }
    // #endregion

    // #region METHODS

    // Set the look at Target position for the camera as it orbits this point
    setTarget( pos ){
        const cpos = this.camera.position.toArray();
        const dir  = vec3.sub([0, 0, 0], cpos, this.target);

        vec3.copy( this.target, pos );
        this.camera.quaternion.fromArray( quatLook([0, 0, 0, 1], dir, UP ) );
        this.camera.position.fromArray( vec3.add([0, 0, 0], dir, pos ) );
        return this;
    }

    // Do Pan movement on the camera while keeping the target locked in step.
    setPan( pos ){
        const cpos = this.camera.position.toArray();
        const dir  = vec3.sub( [0, 0, 0], this.target, cpos );

        this.camera.position.fromArray( pos );
        vec3.add( this.target, pos, dir );
        return this;
    }

    // Uses Polar Coordinates to define the rotation around a target
    setOrbit( dLon, dLat, radius=null ) {
        const lat =
            dLat > 89.999999 ? 89.999999 : dLat < -89.999999 ? -89.999999 : dLat;

        const cpos  = this.camera.position.toArray();
        const polar = polar2cartesian( dLon, lat,
            ( radius !== null )? radius : vec3.len( vec3.sub([0, 0, 0], cpos, this.target ) ),
        );

        this.camera.quaternion.fromArray(quatLook([0, 0, 0, 1], polar, UP));
        this.camera.position.fromArray(vec3.add([0, 0, 0], polar, this.target));
        return this;
    }

    // Set the distance between the camera & target ( Zooming )
    setDistance( dist ){
        const cpos = this.camera.position.toArray();

        const pos = [0, 0, 0];
        vec3.sub(pos, cpos, this.target);
        vec3.normalize(pos, pos);
        vec3.scale(pos, pos, dist);
        vec3.add(pos, pos, this.target);

        this.camera.position.fromArray(pos);
        return this;
    }
    // #endregion

  // #region MOUSE EVENTS

    // Compute the Mouse position in relation the the canvas top left position
    _mouseCoord( e ){
        const rect = this.canvas.getBoundingClientRect(); // need canvas sceen location & size
        const x    = e.clientX - rect.x; // canvas x position
        const y    = e.clientY - rect.y; // canvas y position
        return [x, y];
    }

    onMouseDown = (e)=>{
        // If disabled OR Ctrl, Shift or Alt keys are down, dont allow dragging to modify camera
        if( !this.enabled || e.ctrlKey || e.shiftKey || e.altKey ) return;

        e.stopPropagation();

        const cpos  = this.camera.position.toArray(); // Current Camera Position
        const toCam = vec3.sub([0, 0, 0], cpos, this.target); // Direction from Target to Camera
        const polar = cartesian2polar(toCam); // Convert to Polar Coordinates

        const coord     = this._mouseCoord(e);
        this._initPolar = polar; // Save starting values to apply delta on mouse move
        this._initA     = coord[0];
        this._initB     = coord[1];

        // There is a slight distance drift when computing distance for each frame while orbiting
        // Fix this dift by pre computing the distance on drag start & using that as the radius for orbit.
        this._initC = vec3.len( vec3.sub([0, 0, 0], cpos, this.target ) );

        this.canvas.addEventListener( 'mousemove', this.onMouseMove, true );
        this.canvas.addEventListener( 'mouseup', this.onMouseUp, true );
    };

    onMouseMove = (e)=>{
        if( !this.enabled ) return;

        const coord = this._mouseCoord(e);
        const dx    = coord[0] - this._initA;
        const dy    = coord[1] - this._initB;
        const px    = this._initPolar[0] + dx * -ORBIT_SCALE;
        const py    = this._initPolar[1] + dy * ORBIT_SCALE;

        this.setOrbit( px, py, this._initC );
    };

    onMouseUp = (e)=>{
        this.canvas.removeEventListener('mousemove', this.onMouseMove, true );
        this.canvas.removeEventListener('mouseup', this.onMouseUp, true );
    };

    onWheel = (e)=>{
        if( !this.enabled ) return;

        const cpos = this.camera.position.toArray(); // Current Camera Position

        if( !e.altKey ){
            // ZOOM
            const boost = e.shiftKey ? 10 : 1;
            let dist = vec3.len( vec3.sub([0, 0, 0], cpos, this.target ) ); // Direction from Target to Camera
            dist     = Math.max( ZOOM_MIN_DISTANCE, dist + e.deltaY * WHEEL_SCALE * boost );

            this.setDistance( dist );
        }else{
            // ORBIT
            const boost = e.shiftKey ? 5 : 1;
            const toCam = vec3.sub( [0, 0, 0], cpos, this.target); // Direction from Target to Camera
            const polar = cartesian2polar(toCam); // Convert to Polar Coordinates

            polar[0] += Math.sign( e.deltaY ) * 4 * boost;

            this.setOrbit( polar[0], polar[1] );
        }
    };
    // #endregion

    // #region KEYBOARD EVENTS
    onKeyDown = (e)=>{
        // Only handle event if the key is listed to act apon
        if( !this.keys.has(e.key) ) return;

        this.keys.set( e.key, true );

        const camPos = this.camera.position.toArray();
        const camRot = this.camera.quaternion.toArray();
        const dir    = [0, 0, 0]; // Temp Dir Variable
        let x        = 0; // If not zero, defines if going left (-1) or right(1)
        let y        = 0; // If not zero, defines if going Forward(-1) or backwards(1)

        // WHICH KEYS ARE PRESSED DOWN
        if( this.keys.get('ArrowUp') )      y -= 1;
        if( this.keys.get('ArrowDown') )    y += 1;
        if( this.keys.get('ArrowLeft') )    x -= 1;
        if( this.keys.get('ArrowRight') )   x += 1;

        // HANDLE UP / DOWN KEY PRESS
        if( y ){
            if (e.shiftKey && !e.ctrlKey) {
                // Move Up & Down
                vec3.transformQuat(dir, FORWARD, camRot);
                vec3.scale(dir, dir, TARGET_STEP * -y);
                vec3.add(camPos, camPos, dir);
            } else if (e.ctrlKey && !e.shiftKey) {
                // Orbit Latitude
                const cpos = this.camera.position.toArray();
                const toCam = vec3.sub([0, 0, 0], cpos, this.target); // Direction from Target to Camera
                const polar = cartesian2polar(toCam); // Convert to Polar Coordinates
                polar[1] += -y * 4;
                this.setOrbit(polar[0], polar[1]);
                return;
            } else {
                // Move Forward/Back
                const scl = e.shiftKey && e.ctrlKey ? STEP_SCALE : 1;
                vec3.transformQuat(dir, UP, camRot);
                dir[2] = 0;
                vec3.normalize(dir, dir);
                vec3.scale(dir, dir, TARGET_STEP * y * scl);
                vec3.add(camPos, camPos, dir);
            }
        }

        // HANDLE LEFT / RIGHT KEY PRESS
        if( x ){
            if (e.ctrlKey && !e.shiftKey) {
                // Orbit Longitude
                const cpos = this.camera.position.toArray();
                const toCam = vec3.sub([0, 0, 0], cpos, this.target); // Direction from Target to Camera
                const polar = cartesian2polar(toCam); // Convert to Polar Coordinates
                polar[0] += -x * 4;
                this.setOrbit(polar[0], polar[1]);
                return;
            } else {
                // Pan left/Right
                const scl = e.shiftKey && e.ctrlKey ? STEP_SCALE : 1;

                vec3.transformQuat(dir, RIGHT, camRot);
                vec3.normalize(dir, dir);
                vec3.scale(dir, dir, TARGET_STEP * x * scl);
                vec3.add(camPos, camPos, dir);
            }
        }

        this.setPan( camPos );
    }

    onKeyUp = (e)=> {
        if (!this.keys.has(e.key)) {
        return;
        }
        this.keys.set(e.key, false);
    };
    // #endregion
}
