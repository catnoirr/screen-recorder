const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const recordedVideo = document.getElementById('recordedVideo');
const timer = document.getElementById('timer');
const timeModal = document.getElementById('timeModal');
const modalText = document.getElementById('modalText');
const closeModal = document.querySelector('.modal .close');

let mediaRecorder;
let recordedChunks = [];
let startTime;
let timerInterval;

// Function to detect mobile devices
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

startBtn.addEventListener('click', async () => {
    if (isMobile()) {
        showMobileMessage();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            recordedVideo.src = url;
            recordedVideo.controls = true;

            downloadBtn.onclick = () => {
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'recording.webm';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };

            downloadBtn.disabled = false;
            recordedChunks = [];
            stopTimer();
            showRecordingTime();
        };

        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        startTimer();
    } catch (err) {
        console.error('Error: ' + err);
    }
});

stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        timer.textContent = formatTime(elapsedTime);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function showRecordingTime() {
    const elapsedTime = Date.now() - startTime;
    const formattedTime = formatTime(elapsedTime);
    modalText.innerHTML = `
        <h4>Recorded Successfully</h4>
        <p>Recording time: ${formattedTime}</p>
        <p>Download your recorded video</p>
    `;
    timeModal.style.display = 'flex'; // Show the modal
}

function showMobileMessage() {
    modalText.innerHTML = `
        <h4 class="alert">SORRY😞</h4>
        <p>This feature does not work on mobile phones. Please try on a PC.</p>
    `;
    timeModal.style.display = 'flex'; // Show the modal
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
    return number.toString().padStart(2, '0');
}

// Close the modal when the user clicks on <span> (x)
closeModal.onclick = () => {
    timeModal.style.display = 'none';
};

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = (event) => {
    if (event.target == timeModal) {
        timeModal.style.display = 'none';
    }
};

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
    timeModal.style.display = 'none';
});
