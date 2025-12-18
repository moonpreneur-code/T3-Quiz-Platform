const robot = document.getElementById("robot-car");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const questionText = document.getElementById("question-text");
const questionCode = document.getElementById("question-code");
const optionsContainer = document.getElementById("options");
const obstacleWall = document.getElementById("obstacle-wall");

let currentQuestionIndex = 0;

const questions = [
    // Question 1------------------------------------
    {
    question: "If we want the robot to turn RIGHT, which of the following function calls should we use?",
    code: `void control_robot(int in1, int in2, int in3, int in4, int mspeed) {
    analogWrite(EN1, mspeed); // Speed of Motor 1
    analogWrite(EN2, mspeed); // Speed of Motor 2

    digitalWrite(IN1, in1);  // Motor 1 direction
    digitalWrite(IN2, in2);  // Motor 1 direction
    digitalWrite(IN3, in3);  // Motor 2 direction
    digitalWrite(IN4, in4);  // Motor 2 direction
}`,
    options: [
        { text: "control_robot(1, 0, 1, 0, 128)", value: "A" },
        { text: "control_robot(1, 0, 0, 1, 128)", value: "B" },
        { text: "control_robot(0, 1, 1, 0, 128)", value: "C", correct: true },
        { text: "control_robot(0, 1, 0, 1, 128", value: "D" }
    ],
    correctAnswer: "C",
    animation: {
        A: () => moveForward(),
        B: () => turnLeft(),
        C: () => turnRight(),
        D: () => moveBackward()
    },
    obstacles: { A: [], B: [], C: [], D: [] }
    },
    // Question 2------------------------------------
    {
    question: "The robot uses two limit switches (LS1 and LS2) to detect obstacles. Which condition should we add to the code so that the robot stops and moves backward in the shown scenario? ",
    code:`void loop() {
  digitalWrite(M1P, HIGH);
  digitalWrite(M1N, LOW);
  digitalWrite(M2P, HIGH);
  digitalWrite(M2N, LOW);

  int s1 = digitalRead(LS1);
  int s2 = digitalRead(LS2);

  <span class="highlight">if (___________________) {</span>
    digitalWrite(M1P, LOW);
    digitalWrite(M1N, LOW);
    digitalWrite(M2P, LOW);
    digitalWrite(M2N, LOW);
    delay(200);

    digitalWrite(M1P, LOW);
    digitalWrite(M1N, HIGH);
    digitalWrite(M2P, LOW);
    digitalWrite(M2N, HIGH);
    delay(2000);

    digitalWrite(M1P, LOW);
    digitalWrite(M1N, LOW);
    digitalWrite(M2P, LOW);
    digitalWrite(M2N, LOW);
  }
  delay(10);
}
`,
    options: [
        { text: "if (s1 == LOW) && (s2 == LOW):", value: "A" },
        { text: "if (s1 == LOW) || (s2 == LOW):", value: "B", correct: true },
        { text: "if (s1 == HIGH) || (s2 == HIGH):", value: "C" },
        { text: "if (s1 == HIGH) && (s2 == HIGH):", value: "D" }
    ],
    correctAnswer: "B",
    animation: {
        A: () => obstacleSequenceForward(),
        B: () => obstacleSequenceBackward(),
        C: () => obstacleSequenceStopThenBack(),
        D: () => obstacleSequenceStopThenBack()
    },
    obstacles: { A: ['wall'], B: ['wall'], C: ['wall'], D: ['wall'] }
    },
    // Question 4------------------------------------
    {
    question: `The robot is powered on. Button A is pressed for 1 second, then Button C is pressed immediately after. According to the code, what will happen to the robot?`,
    code: `void loop() {
    int A = digitalRead(rf_A);
    int B = digitalRead(rf_B);
    int C = digitalRead(rf_C);
    int D = digitalRead(rf_D);

    if (A == HIGH) {
        move_forward();
    }
    else if (B == HIGH) {
        turn_left();
    }
    else if (C == HIGH) {
        turn_right();
    }
    else if (D == HIGH) {
        move_backward();
    }
    else {
        stop_robot();
    }
    delay(100);  
}
`,
    options: [
        { text: "The robot will move forward for 1 second, then turn right and stop.", value: "A", correct: true },
        { text: "The robot will move forward for 1 second, then turn left and stop.", value: "B" },
        { text: "The robot will move forward for 1 second, then move backward.", value: "C" },
        { text: "The robot will turn right and move forward.", value: "D" }
    ],
    correctAnswer: "A",
    animation: {
        A: () => animateForwardThenRightStop(),
        B: () => animateForwardThenLeftStop(),
        C: () => animateForwardThenBackward(),
        D: () => animateRightThenForward()
    },
    obstacles: { A: [], B: [], C: [], D: [] }
    },
    // Question 5------------------------------------
    {
    question: `In this line-following code, the condition to stop the robot when all three IR sensors detect the black line is missing.`,
    code: `void loop() {
    int left = digitalRead(left_ir);
    int center = digitalRead(center_ir);
    int right = digitalRead(right_ir);

    <span class="highlight">if (____________________________________) {</span>
        stop_robot();
        return;  
    } 
    else {
        if (center == LOW) {       
            move_forward();
        }
        else if (left == LOW) {    
            turn_left();
        }
        else if (right == LOW) {   
            turn_right();
        }
        else {
            stop_robot();          
        }
    }
    delay(70);  
}
`,
    options: [
        { text: "left == HIGH && center == HIGH && right == HIGH", value: "A", correct: true },
        { text: "left == HIGH && center == HIGH && right == HIGH", value: "B" },
        { text: "center == LOW", value: "C" },
        { text: "left == LOW && center == LOW && right == LOW", value: "D" }
    ],
    correctAnswer: "A",
    animation: {
        A: () => moveForward(),
        B: () => moveForwardCrossblack(),
        C: () => animateForwardThenBackward(),
        D: () => animateRightThenForward()
    },
    obstacles: { A: [], B: [], C: [], D: [] }
    }
];

function resetSimulation() {
    robot.style.transition = 'none';
    robot.style.transform = 'translate(0px, 0px) rotate(0deg)';
    obstacleWall.style.display = 'none';
    obstacleWall.style.opacity = '1';
}

function applyObstacles(option) {
  // Always hide all walls first
  if (document.getElementById('obstacle-wall')) {
    document.getElementById('obstacle-wall').style.display = 'none';
  }
  if (document.getElementById('wall-front')) {
    document.getElementById('wall-front').style.display = 'none';
  }
  if (document.getElementById('wall-left')) {
    document.getElementById('wall-left').style.display = 'none';
  }
  if (document.getElementById('wall-right')) {
    document.getElementById('wall-right').style.display = 'none';
  }

  // Then show only the appropriate wall(s) for the current question
  if (currentQuestionIndex === 1 && document.getElementById('obstacle-wall')) {
    document.getElementById('obstacle-wall').style.display = 'block';
  }
}


// Simple robot moves
function moveForward() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-120px)";
}

function moveBackward() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(120px)";
}

function turnLeft() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "rotate(-90deg)";
}

function turnRight() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "rotate(90deg)";
}

function stopRobot() {
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translate(0, 0) rotate(0deg)";
}

// Obstacle sequence animations for 3rd question

function obstacleSequenceBackward() {
    // 1. Move forward hitting obstacle
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
    // simulate stop at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
        // move backward
        robot.style.transition = 'transform 1.5s ease';
        robot.style.transform = "translateY(50px)";
    }, 500);
    }, 1000);
}

function obstacleSequenceForward() {
    // Move forward, hits obstacle, then moves forward again (simulate ignoring)
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
    // slight pause at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
        // move forward further
        robot.style.transition = 'transform 1.5s ease';
        robot.style.transform = "translateY(-220px)";
    }, 500);
    }, 1000);
}

function obstacleSequenceTurnRight() {
    // Move forward hitting obstacle, then stop, then turn right
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = "translateY(-50px)";
    setTimeout(() => {
    // stop at obstacle
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translateY(-50px) rotate(0deg)";
    setTimeout(() => {
        // turn right
        robot.style.transition = 'transform 1s ease';
        robot.style.transform = "translateY(-50px) rotate(90deg)";
    }, 500);
    }, 1000);
}

function obstacleSequenceStopThenBack() {
    // Stop in place for 2 seconds
    robot.style.transition = 'transform 0.5s ease';
    robot.style.transform = "translate(0, 0) rotate(0deg)";
    setTimeout(() => {
        // Move backward for 1 second
        robot.style.transition = 'transform 2s ease';
        robot.style.transform = "translateY(100px)";
    }, 500);
}

function loadQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.question;
  questionCode.innerHTML = question.code;

  // Remove old option buttons
  optionsContainer.querySelectorAll("button.option").forEach(btn => btn.remove());

  // Add new option buttons
  question.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option.text;
    button.classList.add("option");
    button.dataset.option = option.value;
    button.disabled = false;
    button.style.backgroundColor = '#4a90e2';
    button.addEventListener("click", () => handlePick(option));
    optionsContainer.insertBefore(button, optionsContainer.querySelector(".actions"));
  });

  feedback.textContent = "";
  feedback.style.color = "#2a9d8f";
  nextBtn.disabled = true;
  resetBtn.disabled = false;
  resetSimulation();
  // Hide remote by default
  document.getElementById('rf-remote-img').style.display = "none";

  // --- WALL CONTROL: Hide ALL walls first ---
  if (document.getElementById('obstacle-wall')) {
    document.getElementById('obstacle-wall').style.display = 'none';
  }
  if (document.getElementById('wall-front')) {
    document.getElementById('wall-front').style.display = 'none';
  }
  if (document.getElementById('wall-left')) {
    document.getElementById('wall-left').style.display = 'none';
  }
  if (document.getElementById('wall-right')) {
    document.getElementById('wall-right').style.display = 'none';
  }
  if (document.getElementById('line-center')) {
    document.getElementById('line-center').style.display = 'none';
  }
  // --- WALL CONTROL: Show walls for current question ---
  if (currentQuestionIndex === 1 && document.getElementById('obstacle-wall')) { // Question 3
    document.getElementById('obstacle-wall').style.display = 'block';
  }
  if(currentQuestionIndex === 2) {
    document.getElementById('rf-remote-img').style.display = "block";
  }
  if (currentQuestionIndex === 3) {
    if (document.getElementById('line-center')) {
        document.getElementById('line-center').style.display = 'block';
    }
  }
}

function handlePick(selectedOption) {
    const question = questions[currentQuestionIndex];
    const selectedLetter = selectedOption.value;
    const correct = question.correctAnswer;
    const optionButtons = optionsContainer.querySelectorAll(".option");
    optionButtons.forEach(btn => btn.disabled = true);

    resetSimulation();
    applyObstacles(selectedLetter);

    setTimeout(() => {
    question.animation[selectedLetter]();

    setTimeout(() => {
        if (selectedLetter === correct) {
        feedback.style.color = "#2a9d8f";
        feedback.textContent = "🎉 Correct!";
        triggerConfetti();
        nextBtn.disabled = false;
        } else {
        feedback.style.color = "#e76f51";
        feedback.textContent = "❌ Incorrect!";
        nextBtn.disabled = true;
        }
    }, 2200); // Adjust delay to fit full obstacle sequences
    }, 50);
}

function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    loadQuestion();
}

function triggerConfetti() {
    confetti({
    particleCount: 150,
    spread: 150,
    origin: { y: 0.7 },
    colors: ['#e76f51', '#2a9d8f', '#264653', '#f4a261', '#e9c46a'],
    disableForReducedMotion: true
    });
}

function resetUI() {
  feedback.textContent = "";
  resetSimulation();
  const optionButtons = optionsContainer.querySelectorAll(".option");
  optionButtons.forEach(btn => {
    btn.disabled = false;
    btn.style.backgroundColor = '#4a90e2';
  });
  nextBtn.disabled = true;
  resetBtn.disabled = false;

  document.getElementById('rf-remote-img').style.display = "none";

  // --- WALL CONTROL: Hide ALL walls first ---
  if (document.getElementById('obstacle-wall')) {
    document.getElementById('obstacle-wall').style.display = 'none';
  }
  if (document.getElementById('wall-front')) {
    document.getElementById('wall-front').style.display = 'none';
  }
  if (document.getElementById('wall-left')) {
    document.getElementById('wall-left').style.display = 'none';
  }
  if (document.getElementById('wall-right')) {
    document.getElementById('wall-right').style.display = 'none';
  }
  if (document.getElementById('line-center')) {
    document.getElementById('line-center').style.display = 'none';
  }
  // --- WALL CONTROL: Show walls for current question ---
  if (currentQuestionIndex === 1 && document.getElementById('obstacle-wall')) { // Question 3
    document.getElementById('obstacle-wall').style.display = 'block';
  }
  if(currentQuestionIndex === 2) {
    document.getElementById('rf-remote-img').style.display = "block";
  }
  if (currentQuestionIndex === 3) {
    if (document.getElementById('line-center')) {
        document.getElementById('line-center').style.display = 'block';
    }
  }
}

nextBtn.addEventListener("click", nextQuestion);
resetBtn.addEventListener("click", resetUI);

loadQuestion();

// for 4th question *********************************

function simulateTurnLeftForward() {
  // Robot turns left and moves forward avoiding left wall
  robot.style.transition = 'transform 1s ease';
  robot.style.transform = 'rotate(-90deg) translateY(-80px)';
  setTimeout(() => {
    robot.style.transition = 'transform 1s';
    robot.style.transform = 'rotate(-90deg) translateY(-100px)';
    showBlastEffect(95, 235);
  }, 1200);
}

function simulateStopMoveBack() {
  // Robot stops and moves back slightly
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(100px)';
}

function simulateCrashForward() {
  // Robot moves forward and then shake to simulate crash
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(-100px)';
  setTimeout(() => {
    robot.style.transition = 'transform 0.2s';
    robot.style.transform = 'translate(-5px, -100px)';
    showBlastEffect(265, 45);
    setTimeout(() => {
      robot.style.transform = 'translate(5px, -100px)';
      setTimeout(() => {
        robot.style.transform = 'translate(0px, -100px)';
      }, 100);
    }, 100);
  }, 1200);
}

function simulateTurnRightForward() {
  // Robot turns right and moves forward stopping next to right wall
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'rotate(90deg) translateY(-80px)';
  setTimeout(() => {
    robot.style.transition = 'transform 1s';
    robot.style.transform = 'rotate(90deg) translateY(-110px)';
  }, 1000);
}

function showBlastEffect(left, top) {
  const blast = document.getElementById('blast-effect');
  blast.style.left = left + "px";
  blast.style.top = top + "px";
  blast.style.display = "block";
  setTimeout(() => {
    blast.style.display = "none";
  }, 1300); // Hide after 1 second
}


// for 5th question *********************************
function animateForwardThenRightStop() {
  // Move forward for 1 second
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(-80px)';
  setTimeout(() => {
    // Turn right
    robot.style.transition = 'transform 0.8s';
    robot.style.transform = 'translateY(-80px) rotate(90deg)';
    setTimeout(() => {
      // Stop (reset transition, no movement)
      robot.style.transition = '';
    }, 800);
  }, 1000);
}

function animateForwardThenLeftStop() {
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(-80px)';
  setTimeout(() => {
    robot.style.transition = 'transform 0.8s';
    robot.style.transform = 'translateY(-80px) rotate(-90deg)';
    setTimeout(() => {
      robot.style.transition = '';
    }, 800);
  }, 1000);
}

function animateForwardThenBackward() {
  robot.style.transition = 'transform 1s';
  robot.style.transform = 'translateY(-100px)';
  setTimeout(() => {
    robot.style.transition = 'transform 2s';
    robot.style.transform = 'translateY(100px)';
    setTimeout(() => {
      robot.style.transition = '';
    }, 1000);
  }, 1000);
}

function animateRightThenForward() {
  // Turn right
  robot.style.transition = 'transform 0.8s';
  robot.style.transform = 'rotate(90deg)';
  setTimeout(() => {
    // Move forward for 1s (from right-turned orientation)
    robot.style.transition = 'transform 1s';
    robot.style.transform = 'rotate(90deg) translateY(-80px)';
    setTimeout(() => {
      robot.style.transition = '';
    }, 1000);
  }, 800);
}

// Simple robot moves
function moveForwardCrossblack() {
    robot.style.transition = 'transform 2s ease';
    robot.style.transform = "translateY(-280px)";
}

