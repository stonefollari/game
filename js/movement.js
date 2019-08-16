




THREE.MovementControls = function( camera, domElement ){

    this.domElement = domElement || document.body;
	this.isLocked = false;
	var scope = this;

    console.log("MovementControls");

    // base
    let pos = camera.position;
    let vel = new THREE.Vector3();
    let acc = new THREE.Vector3();
    let fric = new THREE.Vector3();

    // modifier
    let accel = 1.5;
    let friction = -1;
    let gravity = -.23;
    let max_speed = 7;
    let min_speed = 0.01
    let max_vec = new THREE.Vector3( max_speed, Number.MAX_SAFE_INTEGER, max_speed );
    let max_vec_n = new THREE.Vector3( -max_speed, Number.MIN_SAFE_INTEGER, -max_speed );

    let bound_min = new THREE.Vector3( -10000,0,-10000 );
    let bound_max = new THREE.Vector3( 10000,10000,10000 );

    let moveForward = false;
    let moveLeft = false;
    let moveBackward = false;
    let moveRight = false;
    let moveJump = false;
    let canJump = true;
    let jumpForce = 9;
    let isWalking = false;
    let moveKeyPress = false;

    let lookDir,lookDirNorm, faceDir, faceDirNorm, velDir;
    let zeroVector = new THREE.Vector3();
    let upVector = new THREE.Vector3(0,1,0);


    this.update = function(){

        /* Looking vectors */
        lookDir = camera.getWorldDirection( new THREE.Vector3() );
        lookDirNorm = lookDir.clone().cross( new THREE.Vector3(0,1,0) );
        
        /* Facing vectors */
        faceDir = lookDir.projectOnPlane( new THREE.Vector3( 0,1,0 ) ).normalize();
        faceDirNorm = lookDirNorm.projectOnPlane( new THREE.Vector3( 0,1,0 ) ).normalize();
        velDir = vel.clone().normalize().setY(0);
        

        /* Reset acceleration */
        acc.copy( zeroVector );


        // Add move forces to acc            
        if( moveForward ){
            acc.addScaledVector( faceDir, accel );
        }
        if( moveBackward ){
            acc.addScaledVector( faceDir, -accel );
        }
        if( moveLeft ){
            acc.addScaledVector( faceDirNorm, -accel );
        }
        if( moveRight ){
            acc.addScaledVector( faceDirNorm, accel );
        }
        if( moveJump && canJump && onGround() ){
            vel.addScaledVector( upVector, jumpForce );
            canJump = false;
        }

        // Calculate friction force
        fric = velDir.multiplyScalar(friction);
        // Add friction to acc
        acc.add( fric );


        if( !onGround() ){
            vel.addScaledVector( upVector, gravity );
        }else{
            vel.setY( Math.max( vel.y, 0 ));
        }
        
        /* Add net acceleration to velocity */
        vel.add( acc );

        // If fric force is enough to halt
        if( vel.length() < fric.length() ){
            vel.copy( zeroVector ); // halt
        }

        vel.clamp( max_vec_n, max_vec ); // clamp max speed

        /* Add velocity to position */
        pos.add( vel );

        pos.clamp( bound_min, bound_max ); // clamp position




    }


    function onGround(){
        return pos.y == 0;
    }




    function onKeyDown( event ){

		if ( scope.isLocked === false ) return;

        moveKeyPress = true;
        switch ( event.keyCode ) {

            case 87: // w
                moveForward = true;
                break;
    
            case 65: // a
                moveLeft = true;
                break;
    
            case 83: // s
                moveBackward = true;
                break;
    
            case 68: // d
                moveRight = true;
                break;
    
            case 32: // space
                event.preventDefault();
                moveJump = true;
                break;

            case 16: // shift
                isWalking = true;
                break;
            
        }
    }

    function onKeyUp( event ){

        moveKeyPress = false;
        switch ( event.keyCode ) {

            case 87: // w
                moveForward = false;
                break;
    
            case 65: // a
                moveLeft = false;
                break;
    
            case 83: // s
                moveBackward = false;
                break;
    
            case 68: // d
                moveRight = false;
                break;
            
            case 32: // space
                moveJump = false;
                canJump = true;
                break;

            case 16: // shift
                isWalking = false;
                break;
    
        }
    }

	function onPointerlockChange() {

		if ( document.pointerLockElement === scope.domElement ) {
			//scope.dispatchEvent( lockEvent );
			scope.isLocked = true;

		} else {
			//scope.dispatchEvent( unlockEvent );
			scope.isLocked = false;
		}

	}

	this.connect = function () {

		document.addEventListener( 'keydown', onKeyDown, false );
        document.addEventListener( 'keyup', onKeyUp, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
        
	};

	this.disconnect = function () {

		document.addEventListener( 'keydown', onKeyDown, false );        
        document.removeEventListener( 'keyup', onKeyUp, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );

    };
    
    this.dispose = function () {
		this.disconnect();
    };
    
    this.connect();

}
THREE.MovementControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.MovementControls.prototype.constructor = THREE.MovementControls;




/*
// This can register the function as other THREE constructors / functions, if within three.js files ?

THREE.MovementControls = function( camera ){

    console.log("MovementControls constructed");
}

THREE.MovementControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.MovementControls.prototype.constructor = THREE.MovementControls;
*/

/*
// Class implementation. Not favorable since the way three.js is layed out (function based)

class MovementControls{

    constructor( camera ){
    }
    onKeyPress(){
    }
}
*/


var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true;
            break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;

        case 32: // space
            if ( canJump === true ) velocity.y += 350;
            canJump = false;
            break;

    }

};

var onKeyUp = function ( event ) {

    switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = false;
            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;

    }

};







