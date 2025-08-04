// Game constants
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const TILE_SIZE = 40;
const TARGET_FPS = 60;
const TIME_STEP = 1000 / TARGET_FPS; // milliseconds per frame at 60 FPS

// Player settings
const PLAYER_SIZE = 36; // Square player
const PLAYER_WIDTH = PLAYER_SIZE;
const PLAYER_HEIGHT = PLAYER_SIZE;
const PLAYER_ACC = 0.5; // Base acceleration
const PLAYER_FRICTION = -0.12; // Base friction
const PLAYER_GRAVITY = 0.8; // Base gravity
const PLAYER_JUMP = -16; // Base jump strength

// Game states
const GAME_RUNNING = 0;
const GAME_WIN = 1;
const GAME_OVER = 2;
const GAME_LEVEL_COMPLETE = 3;

// Level states
const LEVEL_TRANSITION_TIME = 3000; // 3 seconds for level transition
const GAME_DEATH_TIMEOUT = 1000; // 1.5 seconds before respawning in current level

// Colors
const COLORS = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#FF0000",
    green: "#00FF00",
    blue: "#0000FF",
    skyBlue: "#87CEEB",
    platformGreen: "#3CB371",
    platformTopGreen: "#3CEC71",
    spikeRed: "#DC3545",
    goalYellow: "#F0D030",
    flagPole: "#B48E20"
};

// Get the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game class
class PlatformerGame {
    constructor() {
        // Game state
        this.running = true;
        this.gameState = GAME_RUNNING;

        // Level management
        this.currentLevel = 1;
        this.totalLevels = 3; // Increased to 3 levels
        this.levelTransitionTimer = 0;
        this.deathTimer = 0;

        // Player properties
        this.player = {
            x: 100,
            y: 300,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            velX: 0,
            velY: 0,
            onGround: false
        };

        // Camera offset
        this.camera = {
            x: 0,
            y: 0
        };

        // Level objects
        this.platforms = [];
        this.movingPlatforms = [];
        this.spikes = [];
        this.goals = [];

        // Collision detection visualization
        this.collisionCheckPoints = [];
        this.activeCollisionPoints = [];

        // Load level
        this.loadLevel(this.currentLevel);

        // Input handling
        this.keys = {};
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));

        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    loadLevel(levelNumber) {
        // Clear existing objects
        this.platforms = [];
        this.movingPlatforms = [];
        this.spikes = [];
        this.goals = [];

        // Set the current level
        this.currentLevel = levelNumber;

        if (levelNumber === 1) {
            this.loadLevel1();
        } else if (levelNumber === 2) {
            this.loadLevel2();
        } else if (levelNumber === 3) {
            this.loadLevel3();
        }

        // Reset player
        this.resetPlayer();
    }

    loadLevel3() {
        // Level 3 - The Hardest Challenge

        // Ground with more challenging gaps - shortened for a more compact level
        const groundSegments = [
            [0, SCREEN_HEIGHT - TILE_SIZE, 250, TILE_SIZE],
            [400, SCREEN_HEIGHT - TILE_SIZE, 150, TILE_SIZE],
            [650, SCREEN_HEIGHT - TILE_SIZE, 150, TILE_SIZE],
            [900, SCREEN_HEIGHT - TILE_SIZE, 100, TILE_SIZE],
            [1100, SCREEN_HEIGHT - TILE_SIZE, 100, TILE_SIZE],
            [1300, SCREEN_HEIGHT - TILE_SIZE, 100, TILE_SIZE],
            [1500, SCREEN_HEIGHT - TILE_SIZE, 200, TILE_SIZE],
            [1800, SCREEN_HEIGHT - TILE_SIZE, 300, TILE_SIZE]
        ];

        for (const segment of groundSegments) {
            this.platforms.push({
                x: segment[0],
                y: segment[1],
                width: segment[2],
                height: segment[3]
            });
        }

        // Starting area - safe zone
        this.platforms.push({
            x: 50,
            y: SCREEN_HEIGHT - TILE_SIZE * 3,
            width: 150,
            height: TILE_SIZE
        });

        // Main platforms with adjusted arrangement for easier gameplay - shortened layout
        const platforms = [
            // Initial climbing section - wider platforms
            [250, 480, 90, TILE_SIZE],  // Increased width from 80 to 90
            [350, 420, 80, TILE_SIZE],  // Increased width from 70 to 80
            [450, 360, 70, TILE_SIZE],  // Increased width from 60 to 70
            [550, 300, 60, TILE_SIZE],  // Increased width from 50 to 60

            // First major challenge - adjusted widths and heights
            [650, 250, 50, TILE_SIZE],  // Increased width from 40 to 50, adjusted height
            [750, 200, 45, TILE_SIZE],  // Increased width from 30 to 45, adjusted height
            [850, 210, 40, TILE_SIZE],  // Increased width from 30 to 40, adjusted height

            // New intermediate platforms for easier traversal
            [900, 220, 40, TILE_SIZE],  // Increased width from 30 to 40
            [925, 235, 30, TILE_SIZE],  // New stepping stone platform

            // Middle section - condensed for shorter level
            [950, 250, 50, TILE_SIZE],  // Increased width from 40 to 50
            [1050, 280, 50, TILE_SIZE], // Increased width from 40 to 50, adjusted height
            [1150, 250, 50, TILE_SIZE], // Increased width from 40 to 50
            [1250, 220, 50, TILE_SIZE], // Increased width from 40 to 50, adjusted height

            // Upper section - condensed and adjusted for better playability
            [1350, 190, 50, TILE_SIZE], // Increased width from 40 to 50, adjusted height
            [1450, 220, 45, TILE_SIZE], // Adjusted position

            // Final section - descending with adjusted widths
            [1550, 250, 70, TILE_SIZE], // Repositioned
            [1650, 300, 60, TILE_SIZE], // Repositioned
            [1750, 350, 50, TILE_SIZE], // Repositioned

            // Goal platform and landing platforms - moved closer
            [1850, 400, 50, TILE_SIZE],  // New position
            [1900, 380, 150, TILE_SIZE]  // Goal platform
        ];

        for (const plat of platforms) {
            this.platforms.push({
                x: plat[0],
                y: plat[1],
                width: plat[2],
                height: plat[3]
            });
        }

        // Moving platforms - adjusted for better assistance and shorter level
        const movingPlatforms = [
            // New moving platform to help with difficult gap
            [875, 190, 40, TILE_SIZE, 850, 950, 3],  // Reduced from 4 to 3

            // Vertical rising platform
            [350, 250, 40, TILE_SIZE, 250, 450, 4],  // Reduced from 5 to 4

            // Horizontal platforms with adjusted speeds
            [700, 120, 40, TILE_SIZE, 650, 850, 5],  // Reduced from 7 to 5
            [1000, 150, 40, TILE_SIZE, 950, 1300, 6],  // Reduced from 8 to 6

            // Additional support platforms - condensed for shorter level
            [1400, 100, 40, TILE_SIZE, 1350, 1500, 5],  // Adjusted range
            [1500, 150, 40, TILE_SIZE, 1450, 1600, 5],  // Repositioned
            [1600, 300, 40, TILE_SIZE, 1550, 1700, 4]   // Repositioned to help with final jumps
        ];

        for (const platform of movingPlatforms) {
            this.movingPlatforms.push({
                x: platform[0],
                y: platform[1],
                width: platform[2],
                height: platform[3],
                startX: platform[4],
                endX: platform[5],
                velocity: platform[6]
            });
        }

        // Add goal at the end - moved closer for shorter level
        this.goals.push({
            x: 1950,
            y: 320,
            width: 40,
            height: 80
        });

        // Add strategic spikes to maintain some challenge - adjusted for shorter level
        const spikes = [
            [1150, 300, TILE_SIZE, TILE_SIZE],
            // Repositioned spikes for the shorter level
            [1700, 400, TILE_SIZE, TILE_SIZE]
        ];

        for (const spike of spikes) {
            this.spikes.push({
                x: spike[0],
                y: spike[1],
                width: spike[2],
                height: spike[3]
            });
        }
    }

    loadLevel1() {
        // Level 1 - Introduction to game mechanics without spikes

        // Ground with gaps
        const groundSegments = [
            [0, SCREEN_HEIGHT - TILE_SIZE, 400, TILE_SIZE],
            [500, SCREEN_HEIGHT - TILE_SIZE, 300, TILE_SIZE],
            [900, SCREEN_HEIGHT - TILE_SIZE, 400, TILE_SIZE],
            [1400, SCREEN_HEIGHT - TILE_SIZE, 600, TILE_SIZE]
        ];

        for (const segment of groundSegments) {
            this.platforms.push({
                x: segment[0],
                y: segment[1],
                width: segment[2],
                height: segment[3]
            });
        }

        // Starting area - safe zone
        this.platforms.push({
            x: 50,
            y: SCREEN_HEIGHT - TILE_SIZE * 3,
            width: 150,
            height: TILE_SIZE
        });

        // Main platforms with interesting arrangement
        const platforms = [
            // First challenge - jumping up
            [300, 500, 120, TILE_SIZE],
            [450, 420, 100, TILE_SIZE],
            [600, 350, 80, TILE_SIZE],

            // Second challenge - descending platforms with risk
            [750, 280, 100, TILE_SIZE],
            [900, 350, 120, TILE_SIZE],
            [1100, 400, 100, TILE_SIZE],

            // Third challenge - precision jumps
            [1250, 350, 60, TILE_SIZE],
            [1350, 300, 50, TILE_SIZE],
            [1450, 250, 40, TILE_SIZE],

            // Final stretch to goal - improved path
            [1550, 300, 100, TILE_SIZE],
            [1700, 350, 180, TILE_SIZE], // Extended this platform to reach the goal flag
            // Add stepping platform to help reach the goal
            [1780, 300, 40, TILE_SIZE]
        ];

        for (const plat of platforms) {
            this.platforms.push({
                x: plat[0],
                y: plat[1],
                width: plat[2],
                height: plat[3]
            });
        }

        // Moving platforms - timed challenges
        // [x, y, width, height, start_x, end_x, speed]
        const movingPlatforms = [
            // Vertical moving platform (helpful)
            [380, 350, 80, TILE_SIZE, 350, 550, 2],

            // Horizontal moving platform (across gap)
            [950, 200, 100, TILE_SIZE, 850, 1050, 3],

            // Fast moving platform (timing challenge)
            [1200, 320, 60, TILE_SIZE, 1150, 1300, 5],

            // Final moving platform to reach goal
            [1600, 230, 70, TILE_SIZE, 1550, 1750, 2]
        ];

        for (const mp of movingPlatforms) {
            this.movingPlatforms.push({
                x: mp[0],
                y: mp[1],
                width: mp[2],
                height: mp[3],
                startX: mp[4],
                endX: mp[5],
                speed: mp[6],
                velocity: mp[6]
            });
        }

        // Goal flag at end of level - made easier to reach and more visible
        this.goals.push({
            x: 1780,
            y: 350 - TILE_SIZE * 1.5, // Positioned directly on the platform
            width: TILE_SIZE * 1.5, // Made wider
            height: TILE_SIZE * 2.5  // Made taller for better visibility
        });
    }

    loadLevel2() {
        // Level 2 - Harder level with spikes

        // Ground with gaps
        const groundSegments = [
            [0, SCREEN_HEIGHT - TILE_SIZE, 350, TILE_SIZE],
            [450, SCREEN_HEIGHT - TILE_SIZE, 250, TILE_SIZE],
            [800, SCREEN_HEIGHT - TILE_SIZE, 300, TILE_SIZE],
            [1200, SCREEN_HEIGHT - TILE_SIZE, 200, TILE_SIZE],
            [1500, SCREEN_HEIGHT - TILE_SIZE, 300, TILE_SIZE]
        ];

        for (const segment of groundSegments) {
            this.platforms.push({
                x: segment[0],
                y: segment[1],
                width: segment[2],
                height: segment[3]
            });
        }

        // Starting area - safe zone
        this.platforms.push({
            x: 50,
            y: SCREEN_HEIGHT - TILE_SIZE * 3,
            width: 150,
            height: TILE_SIZE
        });

        // Main platforms with challenging arrangement
        const platforms = [
            // First challenge - jumping up with spikes below
            [300, 480, 120, TILE_SIZE],
            [450, 400, 100, TILE_SIZE],
            [600, 320, 80, TILE_SIZE],

            // Second challenge - higher platforms with spikes below
            [750, 260, 80, TILE_SIZE],
            [900, 320, 100, TILE_SIZE],
            [1050, 380, 80, TILE_SIZE],

            // Third challenge - more precision jumps
            [1200, 300, 50, TILE_SIZE],
            [1300, 250, 40, TILE_SIZE],
            [1400, 200, 30, TILE_SIZE],

            // Final stretch to goal with spikes in between
            [1500, 250, 80, TILE_SIZE],
            [1650, 300, 60, TILE_SIZE],
            [1750, 350, 50, TILE_SIZE]
        ];

        for (const plat of platforms) {
            this.platforms.push({
                x: plat[0],
                y: plat[1],
                width: plat[2],
                height: plat[3]
            });
        }

        // Moving platforms - faster and more challenging
        // [x, y, width, height, start_x, end_x, speed]
        const movingPlatforms = [
            // Vertical moving platform (faster)
            [380, 350, 70, TILE_SIZE, 320, 500, 3],

            // Horizontal moving platform (faster)
            [900, 180, 80, TILE_SIZE, 800, 1000, 4],

            // Fast moving platform (extra challenge)
            [1200, 280, 50, TILE_SIZE, 1150, 1330, 6],

            // Final moving platform to reach goal
            [1600, 200, 60, TILE_SIZE, 1550, 1750, 3]
        ];

        for (const mp of movingPlatforms) {
            this.movingPlatforms.push({
                x: mp[0],
                y: mp[1],
                width: mp[2],
                height: mp[3],
                startX: mp[4],
                endX: mp[5],
                speed: mp[6],
                velocity: mp[6]
            });
        }

        // Add spikes to make the level more challenging
        // [x, y, width, height]
        const spikes = [
            // Spikes in the gaps between ground segments
            [350, SCREEN_HEIGHT - TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE],
            [700, SCREEN_HEIGHT - TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE],
            [1100, SCREEN_HEIGHT - TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE],
            [1400, SCREEN_HEIGHT - TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE],

            // Spikes under some platforms to punish falls
            [320, 520, TILE_SIZE * 2, TILE_SIZE],
            [800, 360, TILE_SIZE * 2, TILE_SIZE],
            [1250, 350, TILE_SIZE * 1.5, TILE_SIZE],

            // Spikes to make jumps more precise
            [1050, 180, TILE_SIZE, TILE_SIZE],
            [1350, 150, TILE_SIZE, TILE_SIZE],
            [1550, 320, TILE_SIZE, TILE_SIZE],
            [1700, 300, TILE_SIZE, TILE_SIZE]
        ];

        for (const spike of spikes) {
            this.spikes.push({
                x: spike[0],
                y: spike[1],
                width: spike[2],
                height: spike[3]
            });
        }

        // Goal flag at end of level
        this.goals.push({
            x: 1750,
            y: 350 - TILE_SIZE * 1.5, // Positioned directly on the platform
            width: TILE_SIZE * 1.5, // Made wider
            height: TILE_SIZE * 2.5  // Made taller for better visibility
        });
    }

    resetPlayer() {
        this.player.x = 100;
        this.player.y = 300;
        this.player.velX = 0;
        this.player.velY = 0;
        this.player.onGround = false;
        this.gameState = GAME_RUNNING;
        this.camera.x = 0;
        this.camera.y = 0;
        this.levelTransitionTimer = 0;
        this.deathTimer = 0;
    }

    handleKeyDown(event) {
        this.keys[event.code] = true;

        // Reset game on R key - go back to level 1
        if (event.code === "KeyR") {
            this.currentLevel = 1;
            this.loadLevel(1);
        }

        // Handle space key for level progression when level is complete
        if (event.code === "Space") {
            // If level complete, proceed to next level
            if (this.gameState === GAME_LEVEL_COMPLETE) {
                // If there's another level, load it
                if (this.currentLevel < this.totalLevels) {
                    this.currentLevel++;
                    this.loadLevel(this.currentLevel);
                } else {
                    // If it was the final level, show the win screen
                    this.gameState = GAME_WIN;
                }
            }
            // Jump if on ground and game is running
            else if (this.player.onGround && this.gameState === GAME_RUNNING) {
                // Apply jump force directly, not affected by delta time
                this.player.velY = PLAYER_JUMP;
                this.player.onGround = false;

                // Add a small vertical adjustment to immediately clear the platform
                this.player.y -= 1;
            }
        }
    }

    handleKeyUp(event) {
        this.keys[event.code] = false;
    }

    update(deltaTime) {
        // Handle level transition if needed
        if (this.gameState === GAME_LEVEL_COMPLETE) {
            this.levelTransitionTimer += deltaTime;

            // If transition time has passed, move to next level
            if (this.levelTransitionTimer >= LEVEL_TRANSITION_TIME) {
                if (this.currentLevel < this.totalLevels) {
                    this.currentLevel++;
                    this.loadLevel(this.currentLevel);
                } else {
                    // If it was the final level, show the win screen
                    this.gameState = GAME_WIN;
                }
            }
            return;
        }

        // Handle death with respawn timer
        if (this.gameState === GAME_OVER) {
            this.deathTimer += deltaTime;

            // After death timeout, respawn in the current level
            if (this.deathTimer >= GAME_DEATH_TIMEOUT) {
                // Reset timer
                this.deathTimer = 0;

                // Reload the current level without changing level number
                this.loadLevel(this.currentLevel);
            }
            return;
        }

        // Skip other updates if game is not running
        if (this.gameState !== GAME_RUNNING) {
            return;
        }

        // Calculate time factor to adjust speeds based on frame time
        // This normalizes movement to match our target 60 FPS regardless of actual frame rate
        const timeScale = deltaTime / TIME_STEP;

        // Calculate player acceleration
        let accX = 0;
        if (this.keys["ArrowLeft"] || this.keys["KeyA"]) {
            accX = -PLAYER_ACC;
        }
        if (this.keys["ArrowRight"] || this.keys["KeyD"]) {
            accX = PLAYER_ACC;
        }

        // Apply friction
        accX += this.player.velX * PLAYER_FRICTION;

        // Update velocity with time scaling
        this.player.velX += accX * timeScale;
        this.player.velY += PLAYER_GRAVITY * timeScale;

        // Add handling for jump key held down
        if ((this.keys["Space"] || this.keys["KeyW"] || this.keys["ArrowUp"]) &&
             this.player.onGround && this.gameState === GAME_RUNNING) {
            this.player.velY = PLAYER_JUMP;
            this.player.onGround = false;
            this.player.y -= 1; // Small adjustment to clear platform
        }

        // Limit horizontal velocity
        if (Math.abs(this.player.velX) < 0.1) {
            this.player.velX = 0;
        }

        // Maximum falling speed
        const maxFallSpeed = 20;
        if (this.player.velY > maxFallSpeed) {
            this.player.velY = maxFallSpeed;
        }

        // Update position with time scaling
        this.player.x += this.player.velX * timeScale;

        // Check for horizontal collisions
        this.checkHorizontalCollisions();

        // Update vertical position with time scaling
        this.player.y += this.player.velY * timeScale;

        // Check for vertical collisions
        this.checkVerticalCollisions();

        // Update moving platforms with time scaling
        for (const platform of this.movingPlatforms) {
            // Move the platform
            platform.x += platform.velocity * timeScale;

            // Change direction if reached bounds
            if (platform.x <= platform.startX || platform.x >= platform.endX) {
                platform.velocity *= -1;
            }
        }

        // Check for spike collisions (death)
        for (const spike of this.spikes) {
            if (this.checkCollision(this.player, spike)) {
                this.gameState = GAME_OVER;
                break;
            }
        }

        // Check for goal collisions (level complete)
        // Enhanced collision detection with debugging
        for (const goal of this.goals) {
            if (this.checkCollision(this.player, goal)) {
                if (this.currentLevel < this.totalLevels) {
                    // Level complete - set timer for transition
                    console.log(`LEVEL ${this.currentLevel} COMPLETED!`);
                    this.gameState = GAME_LEVEL_COMPLETE;
                    this.levelTransitionTimer = 0;
                } else {
                    // Final level completed - game win
                    console.log("FINAL LEVEL COMPLETED! Game won!");
                    this.gameState = GAME_WIN;
                }

                // Force a visual update to show message
                this.render();
                break;
            }
        }

        // Check for falling off the level
        if (this.player.y > SCREEN_HEIGHT) {
            this.gameState = GAME_OVER;
        }

        // Update camera
        this.updateCamera();
    }

    checkHorizontalCollisions() {
        // Reset onGround flag
        this.player.onGround = false;

        // Check static platforms
        for (const platform of this.platforms) {
            if (this.checkCollision(this.player, platform)) {
                // Get the direction of collision for more precise handling
                const direction = this.getCollisionDirection(this.player, platform);

                // Only handle horizontal collisions here
                if (direction === 'left' || direction === 'right') {
                    // Fix for teleporting - 'left' means player is on left side of platform
                    if (direction === 'left') {
                        this.player.x = platform.x - this.player.width - 1; // Place player to the left of platform
                    } else { // direction === 'right', player is on right side of platform
                        this.player.x = platform.x + platform.width + 1; // Place player to the right of platform
                    }
                    this.player.velX = 0;
                }
            }
        }

        // Check moving platforms
        for (const platform of this.movingPlatforms) {
            if (this.checkCollision(this.player, platform)) {
                // Get the direction of collision for more precise handling
                const direction = this.getCollisionDirection(this.player, platform);

                // Only handle horizontal collisions here
                if (direction === 'left' || direction === 'right') {
                    // Fix for teleporting - 'left' means player is on left side of platform
                    if (direction === 'left') {
                        this.player.x = platform.x - this.player.width - 1; // Place player to the left of platform
                    } else { // direction === 'right', player is on right side of platform
                        this.player.x = platform.x + platform.width + 1; // Place player to the right of platform
                    }
                    this.player.velX = 0;
                }
            }
        }
    }

    checkVerticalCollisions() {
        // Store the time scale for movement with platforms
        const deltaTime = this.lastTime ? performance.now() - this.lastTime : TIME_STEP;
        const timeScale = deltaTime / TIME_STEP;

        // Check static platforms
        for (const platform of this.platforms) {
            if (this.checkCollision(this.player, platform)) {
                // Get the direction of collision for more precise handling
                const direction = this.getCollisionDirection(this.player, platform);

                // Only handle vertical collisions here
                if (direction === 'top' || direction === 'bottom') {
                    if (direction === 'top') { // Player on top of platform
                        this.player.y = platform.y - this.player.height - 1; // Add 1px buffer
                        this.player.velY = 0;
                        this.player.onGround = true;
                    } else if (direction === 'bottom') { // Player hit bottom of platform
                        this.player.y = platform.y + platform.height + 1; // Add 1px buffer
                        this.player.velY = 0;
                    }
                }
            }
        }

        // Check moving platforms
        for (const platform of this.movingPlatforms) {
            if (this.checkCollision(this.player, platform)) {
                // Get the direction of collision for more precise handling
                const direction = this.getCollisionDirection(this.player, platform);

                // Only handle vertical collisions here
                if (direction === 'top' || direction === 'bottom') {
                    if (direction === 'top') { // Player on top of platform
                        this.player.y = platform.y - this.player.height - 1; // Add 1px buffer
                        this.player.velY = 0;
                        this.player.onGround = true;

                        // Move with the platform horizontally
                        this.player.x += platform.velocity * timeScale;
                    } else if (direction === 'bottom') { // Player hit bottom of platform
                        this.player.y = platform.y + platform.height + 1; // Add 1px buffer
                        this.player.velY = 0;
                    }
                }
            }
        }

        // Additional check to improve "on ground" detection
        // Cast a small ray below the player if not already on ground
        if (!this.player.onGround) {
            const rayLength = 2; // Very short distance check
            const rayX = this.player.x + this.player.width / 2;
            const rayY = this.player.y + this.player.height;
            const rayEndY = rayY + rayLength;

            // Check static platforms
            for (const platform of this.platforms) {
                if (rayX >= platform.x && rayX <= platform.x + platform.width &&
                    rayY <= platform.y && rayEndY >= platform.y) {
                    this.player.onGround = true;
                    break;
                }
            }

            // Check moving platforms
            if (!this.player.onGround) {
                for (const platform of this.movingPlatforms) {
                    if (rayX >= platform.x && rayX <= platform.x + platform.width &&
                        rayY <= platform.y && rayEndY >= platform.y) {
                        this.player.onGround = true;
                        break;
                    }
                }
            }
        }
    }

    // More accurate collision detection system with enhanced point-based detection
    checkCollision(a, b) {
        // Store collision points for debug visualization
        this.collisionCheckPoints = [];
        this.activeCollisionPoints = [];

        // First do a quick AABB test to see if objects are even close (for performance)
        if (!(a.x < b.x + b.width &&
              a.x + a.width > b.x &&
              a.y < b.y + b.height &&
              a.y + a.height > b.y)) {
            return false;
        }

        // For more precise collision, divide the player into a grid of points
        const precision = 4; // Higher number = more precise but more intensive
        const horizontalPoints = Math.ceil(a.width / precision);
        const verticalPoints = Math.ceil(a.height / precision);

        // Threshold for how many points need to collide for it to count
        // Using a lower threshold makes for "softer" collisions
        const threshold = 1; // Just one point needs to collide
        let collisionPoints = 0;

        // Check a grid of points across the player's body
        for (let i = 0; i <= horizontalPoints; i++) {
            for (let j = 0; j <= verticalPoints; j++) {
                const pointX = a.x + (i * (a.width / horizontalPoints));
                const pointY = a.y + (j * (a.height / verticalPoints));

                // Store all check points for visualization
                this.collisionCheckPoints.push({x: pointX, y: pointY});

                // See if this point is inside the platform
                if (pointX >= b.x && pointX <= b.x + b.width &&
                    pointY >= b.y && pointY <= b.y + b.height) {

                    // Store active collision points for visualization
                    this.activeCollisionPoints.push({x: pointX, y: pointY});

                    collisionPoints++;

                    // Early exit if we've passed the threshold
                    if (collisionPoints >= threshold) {
                        return true;
                    }
                }
            }
        }

        return collisionPoints >= threshold;
    }

    // Helper method to check which side the collision occurred on
    getCollisionDirection(a, b) {
        const aCenterX = a.x + a.width / 2;
        const aCenterY = a.y + a.height / 2;
        const bCenterX = b.x + b.width / 2;
        const bCenterY = b.y + b.height / 2;

        // Calculate the overlap on both axes
        const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

        // If the overlap is greater on the Y axis, it's a top/bottom collision
        if (overlapX >= overlapY) {
            return (aCenterY < bCenterY) ? 'top' : 'bottom';
        } else {
            return (aCenterX < bCenterX) ? 'left' : 'right';
        }
    }

    updateCamera() {
        // Fixed smooth camera movement with consistent smoothing
        // Use a fixed smoothing factor to ensure consistent camera movement
        const baseSmooth = 0.1; // Constant camera smoothing factor

        // Camera position calculation
        // Center the camera on the player horizontally
        const targetX = Math.round(SCREEN_WIDTH / 2 - this.player.x - this.player.width / 2);

        // Camera follows player vertically with some limits
        const targetY = Math.round(SCREEN_HEIGHT / 2 - this.player.y - this.player.height / 2);
        const limitedTargetY = Math.min(0, targetY); // Don't show above the level

        // Apply smooth camera movement with fixed smoothing
        this.camera.x = Math.round(this.camera.x + (targetX - this.camera.x) * baseSmooth);
        this.camera.y = Math.round(this.camera.y + (limitedTargetY - this.camera.y) * baseSmooth);
    }

    render() {
        // Clear canvas
        ctx.fillStyle = COLORS.skyBlue;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Draw a simple background with some decoration
        ctx.fillStyle = "#64B5F6"; // Light blue for sky
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 3);

        // Draw some clouds for background
        const cloudPositions = [[100, 50], [300, 80], [500, 30], [700, 70]];
        for (const pos of cloudPositions) {
            const x = pos[0];
            const y = pos[1];
            // Draw cloud with parallax effect (multiplier 0.3)
            ctx.fillStyle = COLORS.white;
            ctx.beginPath();
            ctx.arc(x + this.camera.x * 0.3, y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 15 + this.camera.x * 0.3, y - 10, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 15 + this.camera.x * 0.3, y - 10, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw static platforms
        for (const platform of this.platforms) {
            // Draw the platform with camera offset
            const drawX = platform.x + this.camera.x;
            const drawY = platform.y + this.camera.y;

            // Draw platform base
            ctx.fillStyle = COLORS.platformGreen;
            ctx.fillRect(drawX, drawY, platform.width, platform.height);

            // Draw platform top edge
            ctx.fillStyle = COLORS.platformTopGreen;
            ctx.fillRect(drawX, drawY, platform.width, platform.height / 4);
        }

        // Draw moving platforms
        for (const platform of this.movingPlatforms) {
            // Draw the platform with camera offset
            const drawX = platform.x + this.camera.x;
            const drawY = platform.y + this.camera.y;

            // Draw platform base
            ctx.fillStyle = COLORS.blue;
            ctx.fillRect(drawX, drawY, platform.width, platform.height);

            // Draw platform details (lines)
            ctx.strokeStyle = "#9BBDF9";
            ctx.lineWidth = 3;
            for (let i = 1; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(drawX + i * platform.width / 5, drawY + platform.height / 2);
                ctx.lineTo(drawX + i * platform.width / 5 + platform.width / 10, drawY + platform.height / 2);
                ctx.stroke();
            }
        }

        // Draw spikes
        for (const spike of this.spikes) {
            const drawX = spike.x + this.camera.x;
            const drawY = spike.y + this.camera.y;

            // Draw spike
            ctx.fillStyle = COLORS.spikeRed;
            ctx.beginPath();
            ctx.moveTo(drawX, drawY + spike.height);
            ctx.lineTo(drawX + spike.width / 2, drawY);
            ctx.lineTo(drawX + spike.width, drawY + spike.height);
            ctx.closePath();
            ctx.fill();

            // Draw spike detail line
            ctx.strokeStyle = "#FF6B70";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drawX + spike.width / 2, drawY);
            ctx.lineTo(drawX + spike.width / 2, drawY + spike.height);
            ctx.stroke();
        }

        // Draw goals (flags)
        for (const goal of this.goals) {
            const drawX = goal.x + this.camera.x;
            const drawY = goal.y + this.camera.y;

            // Draw a glow effect around the goal
            const time = performance.now() / 1000;
            const pulseSize = Math.sin(time * 3) * 5 + 10; // Pulsing effect between 5 and 15

            // Draw glowing outer area
            ctx.fillStyle = "rgba(255, 255, 0, 0.3)"; // Semi-transparent yellow
            ctx.beginPath();
            ctx.roundRect(
                drawX - pulseSize,
                drawY - pulseSize,
                goal.width + pulseSize * 2,
                goal.height + pulseSize * 2,
                pulseSize
            );
            ctx.fill();

            // Draw flag base
            ctx.fillStyle = "#FFD700"; // Gold color for the flag base
            ctx.fillRect(drawX, drawY, goal.width, goal.height);

            // Draw flag pole
            ctx.strokeStyle = "#8B4513"; // Brown color for pole
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(drawX + goal.width / 6, drawY);
            ctx.lineTo(drawX + goal.width / 6, drawY + goal.height);
            ctx.stroke();

            // Draw flag with checkered pattern
            ctx.fillStyle = "#FF0000"; // Red color for flag

            // Draw flag as a checkered pattern for better visibility
            const squareSize = 10;
            const flagWidth = goal.width / 1.5;
            const flagHeight = goal.height / 3;

            for (let i = 0; i < flagHeight / squareSize; i++) {
                for (let j = 0; j < flagWidth / squareSize; j++) {
                    if ((i + j) % 2 === 0) {
                        ctx.fillRect(
                            drawX + goal.width / 6,
                            drawY + 10 + i * squareSize,
                            squareSize,
                            squareSize
                        );
                    }
                }
            }

            // Draw "GOAL" text on the flag
            ctx.font = "bold 18px Arial";
            ctx.fillStyle = "#000000";
            ctx.fillText("GOAL", drawX + goal.width / 4, drawY + goal.height / 2);
        }

        // Draw player character
        const drawX = this.player.x + this.camera.x;
        const drawY = this.player.y + this.camera.y;

        // Calculate animation effects
        const time = performance.now() / 1000;
        const isMoving = Math.abs(this.player.velX) > 0.5;
        const isJumping = this.player.velY < 0;
        const isFalling = this.player.velY > 5;

        // Animation effects
        let squishY = 0;
        let squishX = 0;
        let rotation = 0;

        if (isJumping) {
            // Stretch upward when jumping
            squishY = -2;
            squishX = 1;
            rotation = -0.1;
        } else if (isFalling) {
            // Stretch downward when falling
            squishY = 2;
            squishX = -1;
            rotation = 0.1;
        } else if (isMoving && this.player.onGround) {
            // Bouncing effect when running
            const bounce = Math.sin(time * 10) * 2;
            squishY = bounce / 2;
            squishX = -bounce / 4;
            rotation = Math.sin(time * 10) * 0.05;
        }

        // Save context for rotation
        ctx.save();
        ctx.translate(drawX + this.player.width / 2, drawY + this.player.height / 2);
        ctx.rotate(rotation);

        // Draw player body - black square with slight deformation based on movement
        ctx.fillStyle = COLORS.black;

        // Draw with dynamic squishing effect
        ctx.fillRect(
            -this.player.width / 2 - squishX,
            -this.player.height / 2 - squishY,
            this.player.width + squishX * 2,
            this.player.height + squishY * 2
        );

        // Add visual flair - eyes that change based on state
        const eyeSize = 6;
        const eyeSpacing = 10;

        // Eye whites
        ctx.fillStyle = COLORS.white;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, -5, eyeSize, 0, Math.PI * 2); // Left eye
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing, -5, eyeSize, 0, Math.PI * 2); // Right eye
        ctx.fill();

        // Eye pupils with movement
        const pupilOffset = Math.min(2, Math.max(-2, this.player.velX / 2));
        const pupilYOffset = isFalling ? 1 : (isJumping ? -1 : 0);

        ctx.fillStyle = COLORS.black;
        ctx.beginPath();
        ctx.arc(-eyeSpacing + pupilOffset, -5 + pupilYOffset, eyeSize / 2, 0, Math.PI * 2); // Left pupil
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing + pupilOffset, -5 + pupilYOffset, eyeSize / 2, 0, Math.PI * 2); // Right pupil
        ctx.fill();

        // Draw mouth based on state
        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (isJumping) {
            // Excited mouth when jumping
            ctx.arc(0, 8, 6, 0, Math.PI, false); // Smile
        } else if (isFalling) {
            // Worried mouth when falling
            ctx.arc(0, 12, 6, Math.PI, 0, false); // Frown
        } else if (isMoving) {
            // Happy mouth when moving
            ctx.arc(0, 8, 6, 0, Math.PI, false); // Smile
        } else {
            // Neutral mouth when idle
            ctx.moveTo(-6, 8);
            ctx.lineTo(6, 8);
        }

        ctx.stroke();

        // Restore context
        ctx.restore();

        // Add motion trail effect when moving fast
        if ((isMoving || isJumping || isFalling) && Math.abs(this.player.velX) > 3) {
            const trailCount = 3;
            const trailOpacity = 0.4;

            for (let i = 1; i <= trailCount; i++) {
                const trailX = drawX - (this.player.velX > 0 ? i * 5 : -i * 5);
                const trailSize = this.player.width - i * 2;

                ctx.globalAlpha = trailOpacity - (i * 0.1);
                ctx.fillStyle = COLORS.black;
                ctx.fillRect(
                    trailX,
                    drawY + i * 2,
                    trailSize,
                    trailSize
                );
            }

            ctx.globalAlpha = 1; // Reset opacity
        }

        // Draw collision detection visualization
        // Only draw collision points when there are any (after a collision check)
        if (this.collisionCheckPoints && this.collisionCheckPoints.length > 0) {
            // Draw all check points in light color
            for (const point of this.collisionCheckPoints) {
                ctx.fillStyle = "rgba(255, 255, 0, 0.3)"; // Semi-transparent yellow
                ctx.beginPath();
                ctx.arc(
                    point.x + this.camera.x,
                    point.y + this.camera.y,
                    2, // Small dot
                    0, Math.PI * 2
                );
                ctx.fill();
            }

            // Draw active collision points in brighter color
            if (this.activeCollisionPoints && this.activeCollisionPoints.length > 0) {
                for (const point of this.activeCollisionPoints) {
                    ctx.fillStyle = "rgba(255, 0, 0, 0.8)"; // Bright red
                    ctx.beginPath();
                    ctx.arc(
                        point.x + this.camera.x,
                        point.y + this.camera.y,
                        3, // Slightly larger dot
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }

        // Game state text
        ctx.textAlign = "center";

        // Draw a shadow effect for better visibility
        if (this.gameState === GAME_WIN) {
            ctx.font = "40px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("YOU WIN!", SCREEN_WIDTH / 2 + 2, SCREEN_HEIGHT / 2 - 20 + 2);
            ctx.fillStyle = "#22DD22"; // Green
            ctx.fillText("YOU WIN!", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);

            ctx.font = "24px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("Press R to play again", SCREEN_WIDTH / 2 + 1, SCREEN_HEIGHT / 2 + 20 + 1);
            ctx.fillStyle = COLORS.white;
            ctx.fillText("Press R to play again", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);
        } else if (this.gameState === GAME_OVER) {
            ctx.font = "40px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("GAME OVER", SCREEN_WIDTH / 2 + 2, SCREEN_HEIGHT / 2 - 20 + 2);
            ctx.fillStyle = "#FF5252"; // Red
            ctx.fillText("GAME OVER", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);

            // Add respawn timer message
            const respawnTime = Math.ceil((GAME_DEATH_TIMEOUT - this.deathTimer) / 1000);

            ctx.font = "24px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(`Respawning in level ${this.currentLevel} in ${respawnTime}...`, SCREEN_WIDTH / 2 + 1, SCREEN_HEIGHT / 2 + 20 + 1);
            ctx.fillStyle = COLORS.white;
            ctx.fillText(`Respawning in level ${this.currentLevel} in ${respawnTime}...`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);

            ctx.font = "18px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("Press R to restart from level 1", SCREEN_WIDTH / 2 + 1, SCREEN_HEIGHT / 2 + 60 + 1);
            ctx.fillStyle = COLORS.white;
            ctx.fillText("Press R to restart from level 1", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 60);
        } else if (this.gameState === GAME_LEVEL_COMPLETE) {
            ctx.font = "40px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(`LEVEL ${this.currentLevel} COMPLETE!`, SCREEN_WIDTH / 2 + 2, SCREEN_HEIGHT / 2 - 20 + 2);
            ctx.fillStyle = "#FFA500"; // Orange
            ctx.fillText(`LEVEL ${this.currentLevel} COMPLETE!`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);

            // Add a countdown display
            const timeLeft = Math.ceil((LEVEL_TRANSITION_TIME - this.levelTransitionTimer) / 1000);

            ctx.font = "24px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(`Next level in ${timeLeft}...`, SCREEN_WIDTH / 2 + 1, SCREEN_HEIGHT / 2 + 20 + 1);
            ctx.fillStyle = COLORS.white;
            ctx.fillText(`Next level in ${timeLeft}...`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);

            ctx.font = "18px Arial";
            ctx.fillStyle = COLORS.white;
            ctx.fillText("Or press SPACE to continue now", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 60);
        }
    }

    gameLoop(timestamp) {
        // Calculate time delta
        if (!this.lastTime) {
            this.lastTime = timestamp;
            requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Limit delta time to 100ms to prevent large jumps after tab becomes active again
        const limitedDelta = Math.min(deltaTime, 100);

        // Update game state
        this.update(limitedDelta);

        // Render game
        this.render();

        // Continue game loop if game is still running
        if (this.running) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
}

// Create and start the game
const game = new PlatformerGame();