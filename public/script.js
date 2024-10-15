document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('converterForm');
    const qualityInput = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const resultDiv = document.getElementById('result');
    const beforeImage = document.getElementById('beforeImage');
    const afterImage = document.getElementById('afterImage');
    const pngSizeElement = document.getElementById('pngSize');
    const webpSizeElement = document.getElementById('webpSize');
    const savedSizeElement = document.getElementById('savedSize');
    const downloadLink = document.getElementById('downloadLink');
    const dropZone = document.querySelector('.drop-zone');
    const fileInput = document.querySelector('.drop-zone__input');

    qualityInput.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('/convert', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                beforeImage.src = URL.createObjectURL(fileInput.files[0]);
                afterImage.src = data.webpUrl;
                downloadLink.href = data.webpUrl;
                resultDiv.classList.remove('hidden');
                
                // Update file sizes
                updateFileSizes(data.pngSize, data.webpSize);

                // Initialize slider position
                const slider = document.querySelector('.slider-handle');
                slider.style.left = '50%';
                afterImage.style.clipPath = 'inset(0 0 0 50%)';

                // Enable slider functionality
                enableSlider();
            } else {
                alert('Conversion failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during conversion.');
        });
    });

    function updateFileSizes(pngSize, webpSize) {
        const pngSizeInMB = (pngSize / (1024 * 1024)).toFixed(2);
        const webpSizeInMB = (webpSize / (1024 * 1024)).toFixed(2);
        const savedSizeInMB = (pngSize - webpSize) / (1024 * 1024);
        const savingsPercentage = ((pngSize - webpSize) / pngSize * 100).toFixed(2);

        pngSizeElement.textContent = `${pngSizeInMB} MB`;
        webpSizeElement.textContent = `${webpSizeInMB} MB`;
        savedSizeElement.textContent = `${savedSizeInMB.toFixed(2)} MB (${savingsPercentage}%)`;
    }

    function enableSlider() {
        const slider = document.querySelector('.slider-handle');
        const sliderContainer = document.querySelector('.comparison-slider');

        let isResizing = false;

        slider.addEventListener('mousedown', startResize);
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);

        function startResize(e) {
            e.preventDefault();
            isResizing = true;
        }

        function stopResize() {
            isResizing = false;
        }

        function resize(e) {
            if (!isResizing) return;

            const sliderRect = sliderContainer.getBoundingClientRect();
            const position = (e.clientX - sliderRect.left) / sliderRect.width;

            if (position > 0 && position < 1) {
                slider.style.left = `${position * 100}%`;
                afterImage.style.clipPath = `inset(0 0 0 ${position * 100}%)`;
            }
        }
    }

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('drop-zone--over');
    }

    function unhighlight() {
        dropZone.classList.remove('drop-zone--over');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
    }
});