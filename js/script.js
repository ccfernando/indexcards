const deck = document.getElementById("deck");
const shuffleBtn = document.getElementById("shuffleBtn");

const cardCount = 30;
let cards = [];
let shuffleOrder = [];
let currentPickedCard = null;
let cardNames = [];

// Audio context for sound effects (initialized on first user gesture)
let audioContext = null;

async function ensureAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
        try {
            await audioContext.resume();
        } catch (e) {
            // Ignore resume errors; audio will remain off if blocked
        }
    }
}

// Sound effect functions
function playShuffleSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    // Whoosh sound - frequency sweep down
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.2);
}

function playFlipSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    // Card flip sound - ascending beep
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
}

// Create cards
for (let i = 0; i < cardCount; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;
    
    const front = document.createElement("div");
    front.className = "card-face card-front";
    const nameEl = document.createElement("div");
    nameEl.className = "card-name";
    nameEl.innerText = "";
    front.appendChild(nameEl);
    
    const back = document.createElement("div");
    back.className = "card-face card-back";
    back.innerText = "Question " + (i + 1);
    
    card.appendChild(front);
    card.appendChild(back);
    
    deck.appendChild(card);
    cards.push(card);
    shuffleOrder.push(i);
    
    // Add hover effect
    card.addEventListener("mouseenter", function() {
        if (this === currentPickedCard) return; // Don't raise the picked card
    playShuffleSound();
        const currentTransform = this.style.transform;
        const translateMatch = currentTransform.match(/translate\([^)]+\)/);
        const translate = translateMatch ? translateMatch[0] : "translate(0px, 0px)";
        this.style.transform = `${translate} translateY(-50px)`;
    });
    
    card.addEventListener("mouseleave", function() {
        if (this === currentPickedCard) return; // Don't raise the picked card
        const currentTransform = this.style.transform;
        const translateMatch = currentTransform.match(/translate\([^)]+\)/);
        const translate = translateMatch ? translateMatch[0] : "translate(0px, 0px)";
        this.style.transform = translate;
    });
}

// Initialize card positions
updateCardPositions();

shuffleBtn.addEventListener("click", shuffleCards);
shuffleBtn.addEventListener("click", ensureAudioContext);

// Load names from JSON file
fetch("data/names.json")
    .then((res) => res.json())
    .then((names) => {
        if (Array.isArray(names)) {
            cardNames = names;
            cards.forEach((card, i) => {
                const nameEl = card.querySelector(".card-name");
                if (nameEl) {
                    nameEl.innerText = cardNames[i] || "";
                }
            });
        }
    })
    .catch(() => {
        // If loading fails (e.g., file://), leave names blank
    });

function getCardPosition(order) {
    // Fan the cards in a stack with smaller offset for 30 cards
    const offset = 2;
    return {
        x: order * offset,
        y: order * offset,
        rotate: 0,
    };
}

function updateCardPositions() {
    cards.forEach((card, visualIndex) => {
        const pos = getCardPosition(visualIndex);
        card.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`;
        card.style.zIndex = visualIndex;
    });
}

// Smooth shuffle animation
async function shuffleCards() {
    await ensureAudioContext();
    const duration = 1500; // Total animation time in ms
    const steps = 15;
    let step = 0;

    const intervalDuration = duration / steps;

    const shuffleInterval = setInterval(() => {
        // Play a soft shuffle sound each step
        playShuffleSound();
        // Shuffle the order array
        for (let i = shuffleOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffleOrder[i], shuffleOrder[j]] = [shuffleOrder[j], shuffleOrder[i]];
        }

        // Reorder the DOM to match shuffle
        shuffleOrder.forEach((cardIndex, position) => {
            const card = cards[cardIndex];
            const pos = getCardPosition(position);
            card.style.transition = "transform 0.3s ease";
            card.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`;
            card.style.zIndex = position;
        });

        step++;
        if (step >= steps) {
            clearInterval(shuffleInterval);
            pickRandomCard();
        }
    }, intervalDuration);
}

function pickRandomCard() {
    const randomPosition = Math.floor(Math.random() * cardCount);
    const cardIndex = shuffleOrder[randomPosition];
    const picked = cards[cardIndex];

    currentPickedCard = picked;
    
    setTimeout(() => {
        const originalPos = getCardPosition(randomPosition);
        // Lift from its slot and keep its stack order until it clears the deck
        picked.style.zIndex = randomPosition;
        picked.style.transition = "transform 0.5s ease";
        picked.style.transform = `translate(${originalPos.x}px, ${originalPos.y - 350}px)`;

        setTimeout(() => {
            // After it clears the deck, bring it to the top so it stays clickable
            picked.style.zIndex = cardCount;
        }, 520);
        picked.style.cursor = "pointer";
        picked.addEventListener("click", flipCard);
    }, 500);
}

function flipCard(event) {
    if (currentPickedCard) {
        playFlipSound();
        const isFlipped = currentPickedCard.classList.toggle("flipped");
        // Get the current position transform
        const currentTransform = currentPickedCard.style.transform;
        const positionMatch = currentTransform.match(/translate\([^)]+\)/);
        const position = positionMatch ? positionMatch[0] : "translate(0px, 0px)";
        
        if (isFlipped) {
            currentPickedCard.style.transform = `${position} rotateY(180deg)`;
        } else {
            currentPickedCard.style.transform = `${position} rotateY(0deg)`;
        }
    }
}
