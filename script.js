document.addEventListener('DOMContentLoaded', function() {
    makeElementsDraggable();
});

function makeElementsDraggable() {
    const draggables = document.querySelectorAll('.draggable');
    
    draggables.forEach(draggable => {
        let isDragging = false;
        let offsetX, offsetY;
        const header = draggable.querySelector('.window-header') || draggable;
        
        header.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('close-box')) return;
            
            isDragging = true;
            offsetX = e.clientX - draggable.getBoundingClientRect().left;
            offsetY = e.clientY - draggable.getBoundingClientRect().top;
            
            if (draggable.classList.contains('app-window')) {
                setActiveWindow(draggable);
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();
            
            let newLeft = e.clientX - offsetX - desktopRect.left;
            let newTop = e.clientY - offsetY - desktopRect.top;
            
            newLeft = Math.max(0, Math.min(newLeft, desktopRect.width - draggable.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, desktopRect.height - draggable.offsetHeight));
            
            draggable.style.left = newLeft + 'px';
            draggable.style.top = newTop + 'px';
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    });
}

function openWindow(id) {
    const window = document.getElementById(id + '-window');
    if (window) {
        window.style.display = 'block';
        setActiveWindow(window);
    }
}

function closeWindow(id) {
    const window = document.getElementById(id + '-window');
    if (window) {
        window.style.display = 'none';
    }
}

function showAboutWindow() {
    openWindow('system-about');
}

function setActiveWindow(window) {
    const windows = document.querySelectorAll('.app-window');
    windows.forEach(win => win.classList.remove('active'));
    window.classList.add('active');
}

function selectIcon(icon) {
    const icons = document.querySelectorAll('.icon');
    icons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
}

document.getElementById('desktop').addEventListener('click', function(e) {
    if (e.target === this) {
        const icons = document.querySelectorAll('.icon');
        icons.forEach(i => i.classList.remove('selected'));
    }
});

function startSnakeGame() {
    // Clear any previous game interval
    if (window.gameInterval) {
        clearInterval(window.gameInterval);
    }
    
    // Game variables
    let blockSize = 20;
    let total_row = 17;
    let total_col = 17;
    let board = document.getElementById("board");
    let context;
    let snakeX = blockSize * 5;
    let snakeY = blockSize * 5;
    let speedX = 0;
    let speedY = 0;
    let snakeBody = [];
    let foodX;
    let foodY;
    let gameOver = false;
    let score = 0;
    
    // Set board height and width
    board.height = total_row * blockSize;
    board.width = total_col * blockSize;
    context = board.getContext("2d");
    
    // Reset score and UI
    document.getElementById('snakeScore').textContent = '0';
    document.getElementById('retryButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('gameStatus').textContent = "Use arrow keys to move";
    
    function placeFood() {
        foodX = Math.floor(Math.random() * total_col) * blockSize;
        foodY = Math.floor(Math.random() * total_row) * blockSize;
        
        for (let i = 0; i < snakeBody.length; i++) {
            if (foodX === snakeBody[i][0] && foodY === snakeBody[i][1]) {
                placeFood();
                return;
            }
        }
        
        if (foodX === snakeX && foodY === snakeY) {
            placeFood();
            return;
        }
    }
    
    function changeDirection(e) {
        if (e.code == "ArrowUp" && speedY != 1) { 
            speedX = 0;
            speedY = -1;
        }
        else if (e.code == "ArrowDown" && speedY != -1) {
            speedX = 0;
            speedY = 1;
        }
        else if (e.code == "ArrowLeft" && speedX != 1) {
            speedX = -1;
            speedY = 0;
        }
        else if (e.code == "ArrowRight" && speedX != -1) { 
            speedX = 1;
            speedY = 0;
        }
    }
    
    function displayGameOver() {
        context.fillStyle = "black";
        context.font = "24px 'Chicago', 'Monaco', monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("Game Over!", board.width / 2, board.height / 2);
    }
    
    function displayRetryCountdown(count) {
        context.fillStyle = "#ccffcc";
        context.fillRect(0, 0, board.width, board.height);
        context.fillStyle = "black";
        context.font = "18px 'Chicago', 'Monaco', monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`Retry in ${count}...`, board.width / 2, board.height / 2);
    }
    
    function update() {
        if (gameOver) {
            clearInterval(window.gameInterval);
            document.getElementById('gameStatus').textContent = "Game Over!";
            displayGameOver();
            document.getElementById('retryButton').style.display = 'inline-block';
            
            // Start countdown for auto-retry
            setTimeout(() => {
                let count = 3;
                displayRetryCountdown(count);
                const countdownInterval = setInterval(() => {
                    count--;
                    if (count <= 0) {
                        clearInterval(countdownInterval);
                        startSnakeGame();
                    } else {
                        displayRetryCountdown(count);
                    }
                }, 1000);
            }, 1500);
            return;
        }
        
        // Background
        context.fillStyle = "#ccffcc";
        context.fillRect(0, 0, board.width, board.height);
        
        // Grid lines
        context.strokeStyle = "#ddffdd";
        for (let i = 0; i < total_row; i++) {
            context.beginPath();
            context.moveTo(0, i * blockSize);
            context.lineTo(board.width, i * blockSize);
            context.stroke();
        }
        for (let i = 0; i < total_col; i++) {
            context.beginPath();
            context.moveTo(i * blockSize, 0);
            context.lineTo(i * blockSize, board.height);
            context.stroke();
        }
        
        // Food
        context.fillStyle = "#666666";
        context.fillRect(foodX, foodY, blockSize, blockSize);
        
        // Snake eats food
        if (snakeX == foodX && snakeY == foodY) {
            snakeBody.push([foodX, foodY]);
            score += 10;
            document.getElementById('snakeScore').textContent = score;
            placeFood();
        }
        
        // Update snake body
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i - 1];
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY];
        }
        
        // Move snake
        snakeX += speedX * blockSize;
        snakeY += speedY * blockSize;
        
        // Draw snake head
        context.fillStyle = "black";
        context.fillRect(snakeX, snakeY, blockSize, blockSize);
        
        // Draw snake body
        for (let i = 0; i < snakeBody.length; i++) {
            context.fillStyle = i % 2 === 0 ? "#444444" : "#333333";
            context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
        }
        
        // Check collisions
        if (snakeX < 0 || snakeX >= total_col * blockSize || snakeY < 0 || snakeY >= total_row * blockSize) {
            gameOver = true;
        }
        
        for (let i = 0; i < snakeBody.length; i++) {
            if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
                gameOver = true;
            }
        }
    }
    
    // Initialize game
    placeFood();
    document.addEventListener("keyup", changeDirection);
    window.gameInterval = setInterval(update, 1000 / 8);
}

function retrySnakeGame() {
    startSnakeGame();
}