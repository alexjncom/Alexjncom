document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    let donkey = document.getElementById('donkey');
    let scoreDisplay = document.getElementById('score');
    let score = 0;
    let gameSpeed = 5;
    let isJumping = false;
    let jumpCount = 0;
    let maxJumpCount = 3;
    let initialBottom = 50;
    let obstacleInterval;
    let gameInterval;
    let gameOver = false;
    let lastSpeedIncreaseScore = 0;
    let obstacleFrequency = 2000;

    // Audio elements
    const backgroundMusic = new Audio('background-music.mp3');
    const jumpSound = new Audio('jump-sound.mp3');
    const gameOverSound = new Audio('game-over-sound.mp3');

    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;

    function startGame() {
        gameOver = false;
        score = 0;
        gameSpeed = 5;
        isJumping = false;
        jumpCount = 0;
        lastSpeedIncreaseScore = 0;
        obstacleFrequency = 2000;
        scoreDisplay.textContent = `Score: ${score}`;
        donkey.style.bottom = `${initialBottom}px`;
        donkey.style.left = '50px';

        if (gameInterval) clearInterval(gameInterval);
        if (obstacleInterval) clearInterval(obstacleInterval);

        createClouds();

        gameInterval = setInterval(() => {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            if (score - lastSpeedIncreaseScore >= 500) {
                gameSpeed *= 1.1; // Increase speed by 1.1x every 500 points
                obstacleFrequency /= 1.1; // Increase obstacle frequency by reducing the interval
                lastSpeedIncreaseScore = score;
                clearInterval(obstacleInterval);
                setTimeout(() => {
                    obstacleInterval = setInterval(() => {
                        createObstacle();
                    }, obstacleFrequency);
                }, 3000); // Gap of 3 seconds before obstacles start again
            }
        }, 100);

        obstacleInterval = setInterval(() => {
            createObstacle();
        }, obstacleFrequency);

        gameContainer.addEventListener('click', jump);

        // Play background music
        backgroundMusic.play();
    }

    function jump() {
        if (jumpCount >= maxJumpCount || gameOver) return;
        isJumping = true;
        jumpCount++;
        jumpSound.play(); // Play jump sound
        let currentJumpCount = 0;
        const jumpInterval = setInterval(() => {
            const currentBottom = parseInt(getComputedStyle(donkey).bottom);
            if (currentJumpCount < 20) {
                donkey.style.bottom = currentBottom + 10 + 'px';
            } else if (currentJumpCount < 40) {
                donkey.style.bottom = currentBottom - 10 + 'px';
            } else {
                clearInterval(jumpInterval);
                isJumping = false;
                if (currentBottom <= initialBottom) {
                    jumpCount = 0;
                    donkey.style.bottom = `${initialBottom}px`;
                }
            }
            currentJumpCount++;
        }, 20);
    }

    function createObstacle() {
        if (gameOver) return;
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        obstacle.style.right = '0px';

        // Set height for the obstacle to require single, double, triple, or quadruple jumps
        let heights = [60, 120, 180];
        if (score > 500) {
            heights.push(240); // Add quadruple-height hay bales once score exceeds 500
        }
        const randomHeight = heights[Math.floor(Math.random() * heights.length)];
        obstacle.style.height = `${randomHeight}px`;

        gameContainer.appendChild(obstacle);

        const moveObstacle = setInterval(() => {
            if (gameOver) {
                clearInterval(moveObstacle);
                return;
            }
            const obstacleRight = parseInt(getComputedStyle(obstacle).right);
            const donkeyBottom = parseInt(getComputedStyle(donkey).bottom);
            const obstacleHeight = parseInt(getComputedStyle(obstacle).height);
            if (obstacleRight >= gameContainer.clientWidth - 100 && obstacleRight <= gameContainer.clientWidth - 50 && donkeyBottom < obstacleHeight + 50) {
                gameOver = true;
                alert('Game Over! Your score: ' + score);
                clearInterval(moveObstacle);
                clearInterval(obstacleInterval);
                clearInterval(gameInterval);
                gameContainer.removeEventListener('click', jump);

                // Stop background music and play game over sound
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;
                gameOverSound.play();

                showRestartPrompt();
            } else if (obstacleRight > gameContainer.clientWidth) {
                clearInterval(moveObstacle);
                gameContainer.removeChild(obstacle);
            } else {
                obstacle.style.right = obstacleRight + gameSpeed + 'px';
            }
        }, 20);
    }

    function createClouds() {
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.classList.add('cloud');
            cloud.style.top = `${Math.random() * 50 + 10}px`;
            cloud.style.left = `${Math.random() * 100}vw`;
            gameContainer.appendChild(cloud);
            moveCloud(cloud);
        }
    }

    function moveCloud(cloud) {
        const moveCloudInterval = setInterval(() => {
            if (gameOver) {
                clearInterval(moveCloudInterval);
                return;
            }
            const cloudLeft = parseInt(getComputedStyle(cloud).left);
            if (cloudLeft < -100) {
                cloud.style.left = '100vw';
                cloud.style.top = `${Math.random() * 50 + 10}px`;
            } else {
                cloud.style.left = cloudLeft - gameSpeed + 'px';
            }
        }, 50);
    }

    function showRestartPrompt() {
        const restartPrompt = document.createElement('div');
        restartPrompt.id = 'restart-prompt';
        restartPrompt.textContent = 'Press any button or click anywhere to restart';
        restartPrompt.style.position = 'absolute';
        restartPrompt.style.top = '50%';
        restartPrompt.style.left = '50%';
        restartPrompt.style.transform = 'translate(-50%, -50%)';
        restartPrompt.style.fontSize = '24px';
        restartPrompt.style.color = 'white';
        restartPrompt.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        restartPrompt.style.padding = '10px';
        restartPrompt.style.borderRadius = '5px';
        gameContainer.appendChild(restartPrompt);

        document.addEventListener('keydown', restartGame);
        document.addEventListener('click', restartGame);
    }

    function restartGame() {
        document.removeEventListener('keydown', restartGame);
        document.removeEventListener('click', restartGame);
        const restartPrompt = document.getElementById('restart-prompt');
        if (restartPrompt) {
            gameContainer.removeChild(restartPrompt);
        }
        resetGame();
        startGame();
    }

    function resetGame() {
        score = 0;
        gameSpeed = 5;
        isJumping = false;
        gameOver = false;
        jumpCount = 0;
        lastSpeedIncreaseScore = 0;
        obstacleFrequency = 2000;
        scoreDisplay.textContent = `Score: ${score}`;
        gameContainer.innerHTML = '<div id="donkey"></div><div id="score">Score: 0</div>';
        donkey = document.getElementById('donkey');
        scoreDisplay = document.getElementById('score');
        donkey.style.position = 'absolute';
        donkey.style.bottom = '50px';
        donkey.style.left = '50px';
        donkey.style.width = '50px';
        donkey.style.height = '50px';
        donkey.style.background = "url('donkey.png') no-repeat center center";
        donkey.style.backgroundSize = 'cover';
        createClouds();
    }

    startGame();
});
