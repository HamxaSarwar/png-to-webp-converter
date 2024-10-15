document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('converterForm');
    const qualityInput = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const resultDiv = document.getElementById('result');
    const convertedImage = document.getElementById('convertedImage');
    const downloadLink = document.getElementById('downloadLink');

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
                convertedImage.src = data.webpUrl;
                downloadLink.href = data.webpUrl;
                resultDiv.classList.remove('hidden');
            } else {
                alert('Conversion failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during conversion.');
        });
    });
});