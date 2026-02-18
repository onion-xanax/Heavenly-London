particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#ffffff'
        },
        shape: {
            type: 'circle'
        },
        opacity: {
            value: 0.5,
            random: true,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.2,
            width: 1
        },
        move: {
            enable: true,
            speed: 1.5,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'grab'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 200,
                line_linked: {
                    opacity: 0.5
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultContent = document.getElementById('resultContent');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const resultCard = document.getElementById('resultCard');

    let currentResults = [];
    let currentPage = 0;
    let searchTimeout = null;

    resultCard.style.display = 'none';

    function formatResultData(data) {
        if (!data || !data.List) {
            return ['<div class="error-message">Nothing found</div>'];
        }

        let pages = [];

        for (const [dbName, dbData] of Object.entries(data.List)) {
            if (dbName === "No results found") continue;

            let page = `<div class="database-section">`;
            page += `<h3 style="color: #ffffff; margin-bottom: 15px; font-size: 20px; font-weight: 400;">${dbName}</h3>`;

            if (dbData.InfoLeak) {
                page += `<div style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 10px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1);">`;
                page += `<span style="color: #ffffff;">InfoLeak:</span> ${dbData.InfoLeak}`;
                page += `</div>`;
            }

            if (dbData.Data && dbData.Data.length > 0) {
                dbData.Data.forEach((item) => {
                    page += `<div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.01); border-radius: 10px;">`;
                    for (const [key, value] of Object.entries(item)) {
                        page += `<div style="margin-bottom: 8px;">`;
                        page += `<span style="color: #ffffff; font-weight: 400;">${key}:</span> `;
                        page += `<span style="color: rgba(255,255,255,0.7);">${value}</span>`;
                        page += `</div>`;
                    }
                    page += `</div>`;
                });
            }

            page += `</div>`;
            pages.push(page);
        }

        return pages;
    }

    async function performSearch(query) {
        if (!query.trim()) {
            resultCard.style.display = 'none';
            return;
        }

        resultContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loader"></div><p style="margin-top: 20px; color: rgba(255,255,255,0.5);">Searching</p></div>';
        resultCard.style.display = 'block';

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            });

            const data = await response.json();

            if (data.error) {
                resultContent.innerHTML = `<div class="error-message">Error: ${data.error}</div>`;
                currentResults = [];
                currentPage = 0;
                updateNavigation();
                return;
            }

            if (!data.List || Object.keys(data.List).length === 0) {
                resultContent.innerHTML = '<div class="error-message">Nothing found</div>';
                currentResults = [];
                currentPage = 0;
                updateNavigation();
                return;
            }

            currentResults = formatResultData(data);
            currentPage = 0;

            if (currentResults.length > 0) {
                resultContent.innerHTML = currentResults[0];
            } else {
                resultContent.innerHTML = '<div class="error-message">No data</div>';
            }

            updateNavigation();

        } catch (error) {
            resultContent.innerHTML = '<div class="error-message">Search error</div>';
            currentResults = [];
            currentPage = 0;
            updateNavigation();
        }
    }

    function updateNavigation() {
        if (currentResults.length > 1) {
            pageIndicator.textContent = `${currentPage + 1}/${currentResults.length}`;
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage === currentResults.length - 1;
        } else {
            pageIndicator.textContent = currentResults.length === 1 ? '1/1' : '0/0';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        }
    }

    searchInput.addEventListener('input', (e) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 500);
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            resultContent.innerHTML = currentResults[currentPage];
            updateNavigation();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < currentResults.length - 1) {
            currentPage++;
            resultContent.innerHTML = currentResults[currentPage];
            updateNavigation();
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            performSearch(e.target.value);
        }
    });
});