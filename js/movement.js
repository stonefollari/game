

THREE.MovementControls = function( camera, domElement ){

    this.domElement = domElement || document.body;
	this.isLocked = false;
	var scope = this;

    console.log("MovementControls");

    // base
    let pos = camera.position;
    let vel = new THREE.Vector3( 0,0,0 );

    let moveDirection = new THREE.Vector3();

    // modifier
    let acceleration = 2;
    let air_acceleration = 0.2;
    let friction = 1.9;
    let air_friction = -0.1;
    let gravity = -.7;
    let terminal_velocity = 100;
    let max_velocity = 20;
    let min_velocity = 0.01;
    let sneak_modifier = 0.5;

    let bound_min = new THREE.Vector3( -10000,0,-10000 );
    let bound_max = new THREE.Vector3( 10000,10000,10000 );

    let moveForward = false;
    let moveLeft = false;
    let moveBackward = false;
    let moveRight = false;
    let moveJump = false;
    let canJump = true;
    let jumpImpulse = 15;
    let isSneaking = false;
    let moveKeyPress = false;

    let lookDir,lookDirNorm, faceDir, faceDirNorm, velDir;
    let zeroVector = new THREE.Vector3();


    this.update = function(){

        /* Looking vectors */
        lookDir = camera.getWorldDirection( new THREE.Vector3() );
        lookDirNorm = lookDir.clone().cross( new THREE.Vector3(0,1,0) );
        
        /* Facing vectors */
        faceDir = lookDir.projectOnPlane( new THREE.Vector3( 0,1,0 ) ).normalize();
        faceDirNorm = lookDirNorm.projectOnPlane( new THREE.Vector3( 0,1,0 ) ).normalize();
        
        // // Reset Net Acceleration 
        // acc.copy( zeroVector );



        moveDirection = getMoveDirection();
        vel = moveAccelerate( vel, moveDirection );
        pos = updatePosition( pos, vel );

        console.log( Math.round(vel.length() ) );







    }


    function onGround(){
        return pos.y == 0;
    }

    function inAir(){
        return pos.y > 0;
    }


    function moveAccelerate( velocity, accel_dir ){
        canJump = true;
        if( onGround() && !moveJump ){
            return groundAccelerate( velocity, accel_dir );
        }else{
            return airAccelerate( velocity, accel_dir );
        }

    }
    function groundAccelerate( velocity, accel_dir ){

        /* Calculate and Apply friction */
        let speed = velocity.length();
        if( speed > min_velocity ){
            velocity.multiplyScalar( calcFriction( speed, friction ) ); // scale fric with speed
        
        /* If not moving and under velocity, halt */
        }else if( !moveKeyPress ){
            return velocity.copy(zeroVector);
        }
        if( isSneaking ){
            velocity = accelerate( velocity, accel_dir, acceleration*sneak_modifier, max_velocity * sneak_modifier );
        }else{
            velocity = accelerate( velocity, accel_dir, acceleration, max_velocity );
        }

        /* Find new velocity */
        return velocity;

    }
    function airAccelerate( velocity, accel_dir ){

        /* Find new velocity */
        if( isSneaking ){
            velocity = accelerate( velocity, accel_dir, air_acceleration*sneak_modifier, max_velocity * sneak_modifier );
        }else{
            velocity = accelerate( velocity, accel_dir, air_acceleration, max_velocity );
        }
        /* Apply Gravity */
        if( pos.y + velocity.y < 0 ){    // if going to hit ground next
            pos.setY( 0 );
            velocity.setY( 0 );

        /* Apply Jump (instant impulse) */
        }else if( onGround() && moveJump && canJump ){
            velocity.setY( velocity.y + jumpImpulse ); // add initial vel in +y direction (Impulse)
            canJump = false;
        
        /* Falling */
        }else{
            velocity.setY( calcGravity( velocity, gravity ) );
        }

        return velocity;

    }

    function calcGravity( velocity, gravity ){
        if( velocity.y + gravity < terminal_velocity ){
            return velocity.y + gravity;
        }else{
            return terminal_velocity;
        }
    }

    /**
     * Calculates Friction
     * To make 0 friction, friction must be equal to speed.
     * newVel *= speed*( 1+fric )
     */
    function calcFriction( speed, friction ){
        return Math.max( ((speed * friction) - speed)/speed, 0 );
    }


    function accelerate( velocity, accel_dir, accel_rate, max_velocity ){

        /* Source engine maximum velocity (limits accel) calculations */
        // Allows bhopping / good movement feel.
        let vel_proj = velocity.clone().setY(0).dot( accel_dir );
        if( vel_proj + accel_rate > max_velocity ){
            accel_rate = max_velocity - vel_proj ;
            console.log( accel_rate );
        }

        return velocity.addScaledVector( accel_dir, accel_rate );
    }


    function getMoveDirection(){

        /* Reset acceleration direction */
        moveDirection.copy( zeroVector );

        if( moveForward ){
            moveDirection.add( faceDir );
        }
        if( moveBackward ){
            moveDirection.addScaledVector( faceDir, -1 );
        }
        if( moveLeft ){
            moveDirection.addScaledVector( faceDirNorm, -1 );
        }
        if( moveRight ){
            moveDirection.add( faceDirNorm );
        }
        return moveDirection.normalize();   // TO-DO OPTIMIZE

    }


    function updatePosition( position, velocity ){
        /* Add velocity to position */
        position.add( velocity );

        position.clamp( bound_min, bound_max ); // clamp position
        return position;
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
                isSneaking = true;
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
                isSneaking = false;
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




