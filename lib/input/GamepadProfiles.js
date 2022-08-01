const TFlightHotas = {
    key     : 'T.Flight Hotas X',
    id      : 'T.Flight Hotas X (Vendor: 044f Product: b108)',
    axes    : {
        joyStick        : { xIdx:0, yIdx:1 },
        joyStickTwist   : { idx:5, type: "single" },
        throttle        : { idx:2, type: "single" },
        hat             : { idx:9, type: "array", array:[ -1, -0.7142857313156128, -0.4285714030265808, -0.1428571343421936, 0.14285719394683838, 0.4285714626312256, 0.7142857313156128, 1 ] },
        rocker          : { idx:6, type: "single" }
    },

    buttons : {
        L1 : { idx:1 },
		L2 : { idx:9 },
		L3 : { idx:3 },
		R1 : { idx:0 },
		R2 : { idx:8 },
		R3 : { idx:2 },
		B5 : { idx:4 },
		B6 : { idx:5 },
		B7 : { idx:6 },
		B8 : { idx:7 },
        SE : { idx:10 },
        ST : { idx:11 }
    }
};

const Xbox360 = {
    key     : 'Xbox 360',
    id      : 'Xbox 360 Controller (XInput STANDARD GAMEPAD)',
    axes    : {
        joyStickR   : { xIdx:0, yIdx:1 },
        joyStickL   : { xIdx:2, yIdx:3 },
    },

    buttons : {
        a           : { idx:0 },
        b           : { idx:1 },
        x           : { idx:2 },
        y           : { idx:3 },

        bumperL     : { idx:4 },
		bumperR     : { idx:5 },
		triggerL    : { idx:6 },
		triggerR    : { idx:7 },

        back        : { idx:8 },
		start       : { idx:9 },

        stickL      : { idx:10 },
		stickR      : { idx:11 },

		dup         : { idx:12 },
		ddown       : { idx:13 },
		dleft       : { idx:14 },
		dright      : { idx:15 } 
    }
}

const Profiles = [
    TFlightHotas,
    Xbox360,
];

export default Profiles;