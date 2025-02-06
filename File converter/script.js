const text = document.getElementById('text')
const convertBtn = document.getElementById('convert')
const type = document.getElementById('files')
const droparea = document.querySelector('.drop-file');  

let selectedValue = type.value;
type.addEventListener('change', (event) => {
    selectedValue = event.target.value;
    droparea.style.display = 'flex'
    type.style.display = 'none'
    convertBtn.innerText = `Convert into ${selectedValue}`
    console.log('Selected value:', selectedValue);
});

const initApp = () => {

    const active = () => droparea.classList.add("marked");

    const inactive = () => droparea.classList.remove("marked");

    const prevents = (e) => e.preventDefault();

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evtName => {
        droparea.addEventListener(evtName, prevents);
    });

    ['dragenter', 'dragover'].forEach(evtName => {
        droparea.addEventListener(evtName, active);
    });

    ['dragleave', 'drop'].forEach(evtName => {
        droparea.addEventListener(evtName, inactive);
    });

    droparea.addEventListener("drop", handleDrop);

}

document.addEventListener("DOMContentLoaded", initApp);



function uploadAndConvertFile(file) {
    if (!selectedValue) {
        console.error('Please select a type first');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', selectedValue);

    fetch('http://127.0.0.1:5000/convert', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Conversion failed');
        }
        return response.json();
    })
    .then(data => {
        if (data.converted_filename) {
            downloadConvertedFile(data.converted_filename);
        } else {
            console.log('No converted_filename in response');  
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function downloadConvertedFile(filename) {
    convertBtn.addEventListener('click', () => {
    fetch(`http://127.0.0.1:5000/download/${filename}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('File download failed');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            location.reload()
        })
        .catch(error => {
            console.error('Download error:', error);
        });
    })
}

const handleDrop = (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    text.innerText = `You want to convert ${files[0].name}`
    
    if (files.length > 0) {
        uploadAndConvertFile(files[0]);
    }
}