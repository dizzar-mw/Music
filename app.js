const SHEET_ID = '1dvgO64fHfjDxwMUKuW7Fvq_C8lgsJsF180md8d7Xofg';
const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

async function loadDizzarTracks() {
    try {
        const response = await fetch(csvUrl);
        const data = await response.text();
        
        const lines = data.split('\n').map(line => line.split(','));
        const rows = lines.slice(1); 

        const tracksList = document.getElementById('tracks-list');
        tracksList.innerHTML = ''; 

        rows.forEach((row, index) => {
            if (row.length < 4 || !row[0]) return; 
            
            const title = row[0].trim();
            const artist = row[1].trim();
            const audioUrl = row[2].trim();
            const coverUrl = row[3].trim();
            const downloadUrl = row[4] ? row[4].trim() : audioUrl;

            const card = document.createElement('div');
            card.className = 'track-card';
            card.innerHTML = `
                <div class="track-info">
                    <img class="track-cover" src="${coverUrl}" alt="${title} Cover">
                    <div class="track-details">
                        <h3>${title}</h3>
                        <p>${artist}</p>
                    </div>
                </div>
                <div id="waveform-${index}" style="margin: 5px 0; background: #090909; padding: 4px; border-radius: 4px;"></div>
                <div style="display: flex; gap: 10px;">
                    <button class="download-btn" id="play-${index}" style="background-color: #ff3e3e; border: none; color: white; cursor: pointer;">Play</button>
                    <button class="download-btn trigger-download" data-title="${title}" data-artist="${artist}" data-cover="${coverUrl}" data-url="${downloadUrl}">Download Song</button>
                </div>
            `;

            tracksList.appendChild(card);

            const wavesurfer = WaveSurfer.create({
                container: `#waveform-${index}`,
                waveColor: '#333333',
                progressColor: '#ff3e3e',
                cursorColor: '#ffffff',
                barWidth: 2,
                barRadius: 2,
                height: 35,
                responsive: true
            });

            wavesurfer.load(audioUrl);

            const playBtn = document.getElementById(`play-${index}`);
            playBtn.addEventListener('click', () => {
                wavesurfer.playPause();
                playBtn.textContent = wavesurfer.isPlaying() ? 'Pause' : 'Play';
                playBtn.style.backgroundColor = wavesurfer.isPlaying() ? '#ffffff' : '#ff3e3e';
                playBtn.style.color = wavesurfer.isPlaying() ? '#000000' : '#ffffff';
            });
        });

        setupDownloadModal();
        gsap.from('.track-card', { opacity: 0, y: 30, duration: 0.5, stagger: 0.1 });

    } catch (error) {
        console.error('Error fetching tracks:', error);
    }
}

function setupDownloadModal() {
    const modal = document.getElementById('download-modal');
    const closeBtn = document.getElementById('close-modal');
    const progressBar = document.getElementById('modal-progress-bar');
    
    document.querySelectorAll('.trigger-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = btn.getAttribute('data-title');
            const artist = btn.getAttribute('data-artist');
            const cover = btn.getAttribute('data-cover');
            const downloadUrl = btn.getAttribute('data-url');
            
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-artist').textContent = artist;
            document.getElementById('modal-cover').src = cover;
            
            progressBar.style.width = '0%';
            modal.classList.add('active');
            
            // GSAP animation to fake an elegant loading state before download starts
            gsap.to(progressBar, {
                width: '100%',
                duration: 2.5,
                ease: "power1.inOut",
                onComplete: () => {
                    // Trigger the true file browser download download loop
                    const hiddenAnchor = document.createElement('a');
                    hiddenAnchor.href = downloadUrl;
                    hiddenAnchor.download = `${title}.mp3`;
                    document.body.appendChild(hiddenAnchor);
                    hiddenAnchor.click();
                    document.body.removeChild(hiddenAnchor);
                    
                    setTimeout(() => { modal.classList.remove('active'); }, 800);
                }
            });
        });
    });
    
    closeBtn.addEventListener('click', () => {
        gsap.killTweensOf(progressBar);
        modal.classList.remove('active');
    });
}

window.addEventListener('DOMContentLoaded', loadDippobieTracks);
