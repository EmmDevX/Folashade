// --- Voice Notes Player & Visualizer ---
let currentVnAudio = null;
let currentVnCard = null;
let audioCtx = null;
let analyser = null;
let sourceMap = new Map();
let animationIdVisualizer = null;

function toggleVoiceNote(audioId, card) {
    const audio = document.getElementById(audioId);
    const icon = card.querySelector('.vn-icon i');
    const canvas = card.querySelector('.vn-canvas');

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Connect audio to analyser if not already done
    if (!sourceMap.has(audioId)) {
        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        sourceMap.set(audioId, source);
    }

    // If another card is playing, stop it
    if (currentVnAudio && currentVnAudio !== audio) {
        currentVnAudio.pause();
        currentVnAudio.currentTime = 0;
        if (currentVnCard) {
            currentVnCard.classList.remove('playing');
            const prevIcon = currentVnCard.querySelector('.vn-icon i');
            if (prevIcon) { prevIcon.className = 'fa-solid fa-play'; }
        }
    }

    if (audio.paused) {
        audio.play().catch(e => console.warn('Audio play failed:', e));
        card.classList.add('playing');
        if (icon) icon.className = 'fa-solid fa-pause';
        currentVnAudio = audio;
        currentVnCard = card;

        startVisualizer(canvas);

        // Auto-reset when audio ends
        audio.onended = () => {
            card.classList.remove('playing');
            if (icon) icon.className = 'fa-solid fa-play';
            currentVnAudio = null;
            currentVnCard = null;
            cancelAnimationFrame(animationIdVisualizer);
        };
    } else {
        audio.pause();
        card.classList.remove('playing');
        if (icon) icon.className = 'fa-solid fa-play';
        currentVnAudio = null;
        currentVnCard = null;
        cancelAnimationFrame(animationIdVisualizer);
    }
}

function startVisualizer(canvas) {
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        if (!currentVnAudio || currentVnAudio.paused) return;
        
        animationIdVisualizer = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            
            // Premium blue/gold gradient effect
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#1e90ff');
            gradient.addColorStop(1, '#4db8ff');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 2;
        }
    }
    
    // Set internal canvas resolution
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    draw();
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Hero Enhancements ---
    const sparklesContainer = document.getElementById('sparkles');
    if (sparklesContainer) {
        function createSparkle() {
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');

            // Randomize size, position, and duration
            const size = Math.random() * 8 + 4;
            sparkle.style.width = `${size}px`;
            sparkle.style.height = `${size}px`;
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animationDuration = `${Math.random() * 2 + 1.5}s`;

            sparklesContainer.appendChild(sparkle);

            // Cleanup
            setTimeout(() => {
                sparkle.remove();
            }, 3500);
        }

        // Spawn sparkles continuously
        setInterval(createSparkle, 300);
    }


    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const fadeLines = document.querySelectorAll('.fade-line');

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                if (entry.target.classList.contains('pin-card')) {
                    entry.target.style.opacity = '1';
                } else {
                    entry.target.classList.add('active');
                }
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // --- Typewriter Effect for Love Letter ---
    let typewriterStarted = false;
    const letterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !typewriterStarted) {
                typewriterStarted = true;
                startTypewriter();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const letterContainer = document.querySelector('.letter-content');
    if (letterContainer) {
        letterObserver.observe(letterContainer);
    }

    function startTypewriter() {
        const lines = Array.from(document.querySelectorAll('.fade-line'));

        // Store original text and clear elements
        const textData = lines.map(el => {
            const text = el.innerText;
            el.innerText = '';
            el.style.opacity = 1; // Ensure container is visible
            return text;
        });

        // Add a global cursor element
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';

        let currentLine = 0;
        let currentChar = 0;
        const typingSpeed = 30; // ms per char

        function typeChar() {
            if (currentLine >= textData.length) {
                // Done - remove cursor
                cursor.remove();
                return;
            }

            const element = lines[currentLine];
            const text = textData[currentLine];

            // Wait, then append cursor to current line
            if (currentChar === 0) {
                element.appendChild(cursor);
            }

            if (currentChar < text.length) {
                // Insert character before cursor
                element.insertBefore(document.createTextNode(text.charAt(currentChar)), cursor);
                currentChar++;
                setTimeout(typeChar, typingSpeed);
            } else {
                // Move to next line
                currentLine++;
                currentChar = 0;
                setTimeout(typeChar, 300); // 300ms pause between paragraphs
            }
        }

        // Start typing first line
        typeChar();
    }

    // --- Gift Box & Interactive Cake ---
    const giftBoxBtn = document.getElementById('gift-box');
    const cakeContent = document.getElementById('cake-content');
    const boxAnim = document.querySelector('.box');

    if (giftBoxBtn) {
        giftBoxBtn.addEventListener('click', () => {
            boxAnim.classList.add('open');
            giftBoxBtn.querySelector('.subtitle').innerText = "SURPRISE!";

            setTimeout(() => {
                giftBoxBtn.classList.add('hidden');
                cakeContent.classList.remove('hidden');
            }, 1000); // Wait for open animation to finish
        });
    }

    // --- Elegant Spin the Wheel ---
    const spinBtn = document.getElementById('elegant-spin-btn');
    const wheel = document.getElementById('wheel-elegant');
    const spinResult = document.getElementById('elegant-spin-result');
    const prizeText = document.getElementById('elegant-prize-text');
    let currentRotation = 0;
    let isSpinning = false;

    const wheelRim = document.getElementById('wheel-rim');
    if (wheelRim) {
        // Create 24 bulbs around the rim
        for (let i = 0; i < 24; i++) {
            const bulb = document.createElement('div');
            bulb.className = 'bulb';
            // 450px rim width/height. translateY half of that minus bulb size to put on edge
            bulb.style.transform = `rotate(${i * 15}deg) translateY(-213px)`;
            wheelRim.appendChild(bulb);
        }

        // Blink logic
        setInterval(() => {
            const bulbs = wheelRim.querySelectorAll('.bulb');
            if (isSpinning) {
                // Chaotic casino blink when spinning
                bulbs.forEach(b => {
                    if (Math.random() > 0.5) b.classList.toggle('off');
                });
            } else {
                // Gentle pulse or fully on when idle
                bulbs.forEach((b, idx) => {
                    b.classList.remove('off');
                });
            }
        }, 150);
    }

    const prizes = [
        "Spa Day! 🧖‍♀️",
        "Shopping Spree! 🛒️",
        "Dinner Date! 🍽️",
        "New Perfume! 🌸",
        "Beautiful Jewelry! 💎",
        "Bouquet of Flowers! 💐",
        "Movie Night! 🍿",
        "Relaxing Massage! 💆‍♀️",
        "A Pink Teddy Bear! 🧸"
    ];

    if (spinBtn && wheel) {
        spinBtn.addEventListener('click', () => {
            if (isSpinning) return;
            isSpinning = true;

            spinResult.classList.add('hidden');
            prizeText.innerText = '';

            // --- Rigged Probability Logic ---
            // Slices are 40 degrees each. 
            // 0: Spa Day
            // 1: Shopping (Rigged: low probability, between ~280 and ~320)
            // 2: Dinner Date
            // 3: Perfume
            // 4: Jewelry
            // 5: Flowers
            // 6: Movie Night
            // 7: Massage (Rigged: low probability, between ~0 and ~40)
            // 8: Hug

            // 100% chance — always land on Pink Teddy Bear (index 8, segment 320–360deg)
            randomDeg = 360 - (8 * 40) - 20; // land mid-segment

            // Ensure randomDeg is positive and wrap
            randomDeg = (randomDeg + 360) % 360;

            currentRotation += 2520 + randomDeg; // 7 full spins + the rigged stopping point

            wheel.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => {
                isSpinning = false;

                const actualDeg = currentRotation % 360;
                const winningIndex = Math.floor((360 - actualDeg) / 40) % 9;
                const wonPrize = prizes[winningIndex];

                // Special Teddy Bear win!
                if (winningIndex === 8) {
                    prizeText.innerHTML = `
                        <span style="font-size:3rem;display:block;margin-bottom:0.5rem;animation:teddyBounce 0.6s ease-in-out infinite alternate; filter: sepia(1) hue-rotate(290deg) saturate(5) brightness(1.1);">🧸</span>
                        <strong style="font-size:1.3rem;color:#ff85a2;">A Pink Teddy Bear!</strong><br>
                        <span style="font-size:0.95rem;color:#c8dcff;display:block;margin-top:0.6rem;">
                            Just like you — soft, sweet, and precious. This little bear carries all my love for you! 💕
                        </span>
                    `;
                    // Inject the teddy bounce keyframe once
                    if (!document.getElementById('teddy-style')) {
                        const ts = document.createElement('style');
                        ts.id = 'teddy-style';
                        ts.textContent = '@keyframes teddyBounce { 0% { transform: scale(1) rotate(-5deg); } 100% { transform: scale(1.2) rotate(5deg); } }';
                        document.head.appendChild(ts);
                    }
                } else {
                    prizeText.innerText = wonPrize;
                }

                spinResult.classList.remove('hidden');

                // Retrigger animation
                spinResult.style.animation = 'none';
                spinResult.offsetHeight;
                spinResult.style.animation = 'floatUp 0.5s ease';

                // --- Secret Email Notification ---
                // Using Web3Forms API to silently email the user the result
                const formData = new FormData();
                // User needs to replace this with their free access key from web3forms.com
                formData.append("access_key", "79c7ebea-abb1-419b-87b5-fbc39666e8e7");
                formData.append("subject", "Happy Birthday Ebunoluwa - Spin result!");
                formData.append("message", `Ebunoluwa just spun the wheel on her birthday website and landed on: ${prizes[winningIndex]}`);
                formData.append("from_name", "Wheel of Fortune");

                fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                })
                    .then(res => res.json())
                    .then(data => console.log("Silent notification fired."))
                    .catch(e => console.error(e));

            }, 7000); // Wait for the longer CSS transition time to finish
        });
    }
    const startMicBtn = document.getElementById('start-mic-btn');
    const flames = document.querySelectorAll('.flame');
    const subtitle = document.querySelector('.cake-container .subtitle');
    const celebrationMsg = document.getElementById('celebration-msg');

    let audioContext;
    let microphone;
    let analyser;
    let microphoneStream;
    let animationId;
    let candlesOut = false;

    if (startMicBtn) {
        startMicBtn.addEventListener('click', async () => {
            try {
                microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(microphoneStream);

                microphone.connect(analyser);
                analyser.fftSize = 256;

                startMicBtn.classList.add('hidden');
                subtitle.innerText = "Blow hard on the mic!";

                checkVolume();

            } catch (err) {
                console.error("Error accessing microphone: ", err);
                subtitle.innerText = "Microphone access denied. You must click to blow the candles!";
                // Fallback: Click to blow
                document.querySelector('.cake').addEventListener('click', blowOutCandles);
            }
        });
    }

    function checkVolume() {
        if (candlesOut) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        let average = sum / bufferLength;

        // Threshold for blowing (may need adjustment based on mic sensitivity)
        if (average > 60) {
            blowOutCandles();
        } else {
            animationId = requestAnimationFrame(checkVolume);
        }
    }

    function blowOutCandles() {
        if (candlesOut) return;
        candlesOut = true;

        flames.forEach(flame => flame.classList.add('out'));
        subtitle.classList.add('hidden');

        // Stop microphone
        if (microphoneStream) {
            microphoneStream.getTracks().forEach(track => track.stop());
        }
        if (audioContext) {
            audioContext.close();
        }
        cancelAnimationFrame(animationId);

        // Trigger Celebration
        setTimeout(() => {
            celebrationMsg.classList.remove('hidden');
            celebrationMsg.style.animation = "floatUp 1s ease forwards";
            createConfetti();
        }, 800);
    }

    function createConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#ff1493', '#ffd700', '#ffb6c1', '#800080', '#fff'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';

        }
    }

    // --- 100 Reasons Why Logic ---
    const magicJar = document.getElementById('magic-jar');
    const reasonText = document.getElementById('reason-text');

    // Array of reasons
    const reasons = [
        "Because your smile makes my day brighter.",
        "Your unyielding kindness and empathy for everyone.",
        "Your incredible sense of majestic style and elegance.",
        "The way you care so deeply for your friends and family.",
        "Because you inspire everyone to be a better person.",
        "The lovely, infectious sound of your laughter.",
        "Your unwavering faith and strength in tough times.",
        "For all the unforgettable memories we've made.",
        "Because of your brilliant and beautiful mind.",
        "The way you light up any room you walk into.",
        "Your royal grace and poise in every situation.",
        "For your incredibly big and pure royal heart.",
        "Because you make the world a more beautiful place.",
        "Your incredible ambition and drive to succeed.",
        "Because every moment with you is an absolute treasure.",
        "The comfort and warmth of your caring presence.",
        "Your stunning, breathtaking beauty inside and out.",
        "For being my absolute favorite person in the world.",
        "Because of your infectious joy and endless energy.",
        "Because there is simply no one else like you.",
        "Your ability to find the good in every situation.",
        "The cute way your nose crinkles when you laugh.",
        "For always knowing exactly what to say.",
        "Because you have the courage to chase your dreams.",
        "Your incredible talent for making people feel special."
    ];

    if (magicJar && reasonText) {
        let tappedCount = 0;
        const tappedEl = document.getElementById('reasons-tapped');
        const reasonIcon = document.getElementById('reason-icon');
        const jarBurst = document.getElementById('jar-burst');

        const reasonIcons = ['💛', '🌸', '✨', '💕', '🌟', '💙', '🦋', '🎀', '☁️', '🫶'];
        const burstEmojis = ['💛', '✨', '🌸', '💫', '⭐', '💕', '🌟'];

        function triggerBurst() {
            if (!jarBurst) return;
            for (let i = 0; i < 8; i++) {
                const el = document.createElement('span');
                el.className = 'burst-emoji';
                el.textContent = burstEmojis[Math.floor(Math.random() * burstEmojis.length)];
                const angle = (i / 8) * 360;
                const dist = 80 + Math.random() * 60;
                const rad = (angle * Math.PI) / 180;
                el.style.setProperty('--bx', `${Math.cos(rad) * dist}px`);
                el.style.setProperty('--by', `${Math.sin(rad) * dist}px`);
                el.style.setProperty('--br', `${Math.random() * 360}deg`);
                jarBurst.appendChild(el);
                setTimeout(() => el.remove(), 1000);
            }
        }

        magicJar.addEventListener('click', () => {
            if (magicJar.classList.contains('animating-jar')) return;

            // Shake jar
            magicJar.classList.add('animating-jar');

            // Emoji burst
            triggerBurst();

            // Fade out text
            reasonText.style.opacity = 0;
            if (reasonIcon) reasonIcon.style.opacity = 0;

            setTimeout(() => {
                // Pick a reason
                const randomIndex = Math.floor(Math.random() * reasons.length);
                const newReason = reasons[randomIndex];

                // Update reason text
                reasonText.innerText = newReason;
                reasonText.style.textTransform = 'none';
                reasonText.style.fontWeight = '500';
                reasonText.style.fontSize = '1.25rem';
                reasonText.style.color = '#eef4ff';

                // Update icon
                if (reasonIcon) {
                    reasonIcon.textContent = reasonIcons[Math.floor(Math.random() * reasonIcons.length)];
                    reasonIcon.style.opacity = 1;
                }

                // Animate back in
                reasonText.classList.remove('fade-in-reason');
                void reasonText.offsetWidth;
                reasonText.classList.add('fade-in-reason');
                reasonText.style.opacity = 1;

                // Increment counter (cap at 100)
                tappedCount = Math.min(tappedCount + 1, 100);
                if (tappedEl) tappedEl.textContent = tappedCount;

            }, 300);

            setTimeout(() => {
                magicJar.classList.remove('animating-jar');
            }, 600);
        });
    }


    // --- Mouse Sparkle Trail ---
    let lastSparkleTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        // Throttle sparkle creation (e.g. every 50ms)
        if (now - lastSparkleTime > 50) {
            createSparkleAt(e.clientX, e.clientY);
            lastSparkleTime = now;
        }
    });

    function createSparkleAt(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'cursor-sparkle';
        // Randomize slight offset
        sparkle.style.left = (x + (Math.random() - 0.5) * 10) + 'px';
        sparkle.style.top = (y + (Math.random() - 0.5) * 10) + 'px';
        document.body.appendChild(sparkle);

        // Remove after animation completes
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }

    // --- 3D Photo Carousel Drag Logic ---
    const dragCarousel = document.getElementById('drag-carousel');
    let isDragging = false;
    let startX = 0;
    let currentRotationY = 0; // base auto rotation
    let prevRotationY = 0;

    if (dragCarousel) {
        // Auto rotate
        setInterval(() => {
            if (!isDragging) {
                currentRotationY -= 0.2;
                dragCarousel.style.transform = `rotateY(${currentRotationY}deg)`;
            }
        }, 30);

        // Mouse Events
        const startDrag = (e) => {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            prevRotationY = currentRotationY;
            dragCarousel.style.transition = 'none'; // remove smooth transition during drag
        };

        const onDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            const walk = (x - startX) * 0.5; // Drag sensitivity
            currentRotationY = prevRotationY + walk;
            dragCarousel.style.transform = `rotateY(${currentRotationY}deg)`;
        };

        const stopDrag = () => {
            isDragging = false;
            dragCarousel.style.transition = 'transform 0.1s';
        };

        const scene = document.querySelector('.scene');
        if (scene) {
            scene.addEventListener('mousedown', startDrag);
            scene.addEventListener('mousemove', onDrag);
            scene.addEventListener('mouseup', stopDrag);
            scene.addEventListener('mouseleave', stopDrag);

            scene.addEventListener('touchstart', startDrag, { passive: false });
            scene.addEventListener('touchmove', onDrag, { passive: false });
            scene.addEventListener('touchend', stopDrag);
        }
    }

    // --- Magnetic Buttons ---
    const magneticButtons = document.querySelectorAll('.magnetic');
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Smoothly translate the button toward the cursor
            btn.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0) scale(1.05)`;
            
            // Optional: light glow effect that follows cursor
            btn.style.boxShadow = `${-x * 0.15}px ${-y * 0.15}px 25px rgba(30, 144, 255, 0.6)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate3d(0, 0, 0) scale(1)';
            btn.style.boxShadow = '';
        });
    });

    // --- Cinematic Page Curtain ---
    const curtain = document.getElementById('page-curtain');
    if (curtain) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                curtain.classList.add('hidden');
            }, 1000);
        });
        
        // Safety timeout if load event is missed
        setTimeout(() => {
            curtain.classList.add('hidden');
        }, 3000);
    }

    // --- Ambient Particle System ---
    function initAmbientParticles() {
        const container = document.getElementById('ambient-particles');
        if (!container) return;
        
        const particleCount = 30;
        const symbols = ['✨', '⭐', '💖', '🎈', '🫧'];
        
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'ambient-particle';
            p.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = Math.random() * 100 + 'vh';
            p.style.fontSize = (Math.random() * 15 + 10) + 'px';
            
            // Floating animation
            p.style.animation = `floatParticle ${Math.random() * 10 + 15}s infinite ease-in-out`;
            p.style.animationDelay = `${Math.random() * 10}s`;
            
            container.appendChild(p);
            
            // React to mouse
            const startX = parseFloat(p.style.left);
            const startY = parseFloat(p.style.top);
            
            document.addEventListener('mousemove', (e) => {
                const dx = e.clientX - (innerWidth * startX / 100);
                const dy = e.clientY - (innerHeight * startY / 100);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    const angle = Math.atan2(dy, dx);
                    const force = (150 - dist) / 10;
                    p.style.transform = `translate(${-Math.cos(angle) * force}px, ${-Math.sin(angle) * force}px)`;
                } else {
                    p.style.transform = '';
                }
            });
        }
    }
    initAmbientParticles();

});

// --- Utility Functions ---

function createSparkles(element, count = 10) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'cursor-sparkle';
        sparkle.style.left = (rect.left + Math.random() * rect.width + window.scrollX) + 'px';
        sparkle.style.top = (rect.top + Math.random() * rect.height + window.scrollY) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'achievement') icon = '🏆';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// --- Guest Book Functionality ---
const guestForm = document.getElementById('guest-form-element');
const messagesContainer = document.getElementById('messages-container');

if (guestForm) {
    guestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('guest-name');
        const messageInput = document.getElementById('guest-message');
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (name && message) {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card reveal active';
            messageCard.innerHTML = `
                <div class="message-author">${name}</div>
                <div class="message-text">${message}</div>
                <div class="message-date">${new Date().toLocaleDateString()}</div>
            `;
            
            if (messagesContainer) {
                messagesContainer.insertBefore(messageCard, messagesContainer.firstChild);
            }
            
            nameInput.value = '';
            messageInput.value = '';
            
            createSparkles(messageCard, 15);
            showNotification('Message sent successfully! 💌', 'success');
        } else {
            showNotification('Please fill in both name and message!', 'error');
        }
    });
}

// --- Achievements System ---
const achievements = [
    { id: 'first-visit', title: 'First Visit', description: 'Welcome to Deborah\'s magical birthday site!', icon: '🎉', progress: 100 },
    { id: 'scroll-explorer', title: 'Scroll Explorer', description: 'Explore all sections of the site', icon: '🔍', progress: 0 },
    { id: 'music-lover', title: 'Music Lover', description: 'Play some birthday music', icon: '🎵', progress: 0 },
    { id: 'voice-listener', title: 'Voice Listener', description: 'Listen to all the voice wishes', icon: '🎧', progress: 0 },
    { id: 'wheel-spinner', title: 'Wheel Spinner', description: 'Spin the prize wheel', icon: '🎡', progress: 0 },
    { id: 'reason-finder', title: 'Reason Finder', description: 'Find 5 reasons why Deborah is amazing', icon: '💖', progress: 0 },
    { id: 'cake-blower', title: 'Cake Blower', description: 'Blow out the birthday candles', icon: '🎂', progress: 0 }
];

let unlockedAchievements = JSON.parse(localStorage.getItem('deborah_unlockedAchievements')) || [];

function updateAchievementsUI() {
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    achievementCards.forEach(card => {
        const achievementId = card.dataset.achievement;
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (achievement) {
            const progressFill = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.progress-text');
            
            if (progressFill) progressFill.style.width = `${achievement.progress}%`;
            if (progressText) progressText.textContent = `${achievement.progress}%`;
            
            if (achievement.progress >= 100 && !unlockedAchievements.includes(achievementId)) {
                unlockedAchievements.push(achievementId);
                card.classList.remove('locked');
                card.classList.add('unlocked');
                showNotification(`Achievement Unlocked: ${achievement.title}! 🏆`, 'achievement');
                createSparkles(card, 20);
                localStorage.setItem('deborah_unlockedAchievements', JSON.stringify(unlockedAchievements));
            }
        }
    });
}

const notificationStyles = `
#notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
}

.notification {
    background: rgba(10, 20, 50, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(30, 144, 255, 0.3);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    font-family: 'Outfit', sans-serif;
    color: #fff;
    min-width: 250px;
    animation: slideIn 0.5s ease forwards;
}

.notification-icon {
    font-size: 1.5rem;
}

.notification.achievement {
    border-color: #ffd700;
    background: linear-gradient(135deg, rgba(8, 12, 20, 0.95), rgba(40, 30, 10, 0.95));
}

@keyframes slideIn {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(120%); opacity: 0; }
}
`;

const styleElement = document.createElement('style');
styleElement.textContent = notificationStyles;
document.head.appendChild(styleElement);

// --- Birthday Countdown Timer ---
// Deborah's birthday: April 9
function updateCountdown() {
    const now = new Date();
    let nextBirthday = new Date(now.getFullYear(), 3, 9); // April = month 3 (0-indexed)
    // If her birthday already passed this year, count to next year
    if (now >= nextBirthday) {
        nextBirthday = new Date(now.getFullYear() + 1, 3, 9);
    }

    const diff = nextBirthday - now;

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = n => String(n).padStart(2, '0');

    const cdDays  = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins  = document.getElementById('cd-mins');
    const cdSecs  = document.getElementById('cd-secs');

    if (cdDays)  cdDays.textContent  = pad(days);
    if (cdHours) cdHours.textContent = pad(hours);
    if (cdMins)  cdMins.textContent  = pad(mins);
    if (cdSecs)  cdSecs.textContent  = pad(secs);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// --- Closing Section Starfield Canvas ---
const closingCanvas = document.getElementById('closing-stars-canvas');
if (closingCanvas) {
    const ctx = closingCanvas.getContext('2d');
    let stars = [];

    function resizeCanvas() {
        closingCanvas.width  = closingCanvas.offsetWidth;
        closingCanvas.height = closingCanvas.offsetHeight;
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x:     Math.random() * closingCanvas.width,
                y:     Math.random() * closingCanvas.height,
                r:     Math.random() * 1.5 + 0.3,
                alpha: Math.random(),
                speed: Math.random() * 0.008 + 0.003,
                dir:   Math.random() > 0.5 ? 1 : -1,
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, closingCanvas.width, closingCanvas.height);
        stars.forEach(s => {
            s.alpha += s.speed * s.dir;
            if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(drawStars);
    }

    window.addEventListener('resize', () => { resizeCanvas(); initStars(); });
    resizeCanvas();
    initStars();
    drawStars();

    // --- Click any star to trigger a wish ---
    closingCanvas.addEventListener('click', () => {
        const overlay = document.getElementById('wish-overlay');
        if (overlay) overlay.classList.add('active');
    });
}

// ===== Birthday Blessing Typewriter =====
const blessingEl = document.getElementById('blessing-text');
const blessingVerses = [
    "May God's grace cover every step you take this year, opening doors no man can shut and closing doors that are not meant for you. You are loved beyond measure, Deborah. 🌸",
];
if (blessingEl) {
    const verse = blessingVerses[0];
    let i = 0;
    const blessingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                blessingObserver.disconnect();
                function typeBlessing() {
                    if (i < verse.length) {
                        blessingEl.textContent += verse[i++];
                        setTimeout(typeBlessing, 30);
                    } else {
                        blessingEl.classList.add('done');
                    }
                }
                setTimeout(typeBlessing, 800);
            }
        });
    }, { threshold: 0.5 });
    blessingObserver.observe(blessingEl);
}

// ===== Heart Rain =====
window.triggerHeartRain = function() {
    const container = document.getElementById('heart-rain');
    if (!container) return;
    const pieces = ['💝','💕','❤️','🌸','💗','💖','✨','🌟','💛','💙'];
    const btn = document.getElementById('send-love-btn');
    if (btn) {
        btn.textContent = '💕 Love Sent! 💕';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = '<span class="send-love-icon">💝</span><span>Send Love Again</span>';
            btn.disabled = false;
        }, 4000);
    }
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const el = document.createElement('span');
            el.className = 'rain-piece';
            el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
            el.style.left = `${Math.random() * 100}%`;
            el.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
            const dur = Math.random() * 2 + 2;
            el.style.animationDuration = `${dur}s`;
            el.style.animationDelay = `${Math.random() * 1.5}s`;
            container.appendChild(el);
            setTimeout(() => el.remove(), (dur + 2) * 1000);
        }, i * 40);
    }
};



// ===== Golden Sparkle Trail on Letter Card =====
const letterCard = document.querySelector('.closing-letter');
if (letterCard) {
    letterCard.addEventListener('mousemove', (e) => {
        const rect = letterCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const spark = document.createElement('span');
        spark.style.cssText = `
            position: absolute;
            left: ${x}px; top: ${y}px;
            width: 6px; height: 6px;
            background: radial-gradient(circle, #ffd166, transparent);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%) scale(1);
            animation: sparkFade 0.7s ease-out forwards;
            z-index: 10;
        `;
        letterCard.appendChild(spark);
        setTimeout(() => spark.remove(), 700);
    });
    // Inject keyframes if not present
    if (!document.getElementById('spark-style')) {
        const s = document.createElement('style');
        s.id = 'spark-style';
        s.textContent = `@keyframes sparkFade { 0% { opacity:1; transform:translate(-50%,-50%) scale(1); } 100% { opacity:0; transform:translate(-50%,-50%) scale(2.5); } }`;
        document.head.appendChild(s);
    }
}

// --- Background Music Player ---
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let isMusicPlaying = false;

if (bgMusic && musicToggle) {
    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fa-solid fa-play"></i> <span class="music-text">Play Music</span>';
        } else {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
            musicToggle.innerHTML = '<i class="fa-solid fa-pause"></i> <span class="music-text">Pause Music</span>';
        }
        isMusicPlaying = !isMusicPlaying;
    });
}

// ===== Floating Music Notes =====
const musicNoteWrap = document.getElementById('music-notes-wrap');
const noteEmojis = ['🎵','🎶','🎼','♪','♫'];
let musicNoteInterval = null;

function spawnMusicNote() {
    if (!musicNoteWrap) return;
    const el = document.createElement('span');
    el.className = 'music-note';
    el.textContent = noteEmojis[Math.floor(Math.random() * noteEmojis.length)];
    el.style.left = `${Math.random() * 95}%`;
    const dur = Math.random() * 5 + 6;
    el.style.animationDuration = `${dur}s`;
    musicNoteWrap.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 500);
}

if (musicToggle) {
    musicToggle.addEventListener('click', () => {
        setTimeout(() => {
            if (bgMusic && !bgMusic.paused) {
                if (!musicNoteInterval) {
                    musicNoteInterval = setInterval(spawnMusicNote, 2500);
                }
            } else {
                clearInterval(musicNoteInterval);
                musicNoteInterval = null;
            }
        }, 100);
    });
}
