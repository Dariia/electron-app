const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage (e) {
    const file = e.target.files[0];

    if (!validateIsImage(file)) {
      alertMessage('Please select an image', true);
      return;
    }
  //  alertMessage('Success');
    // Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height;
    };

    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'imageResizer');
}

function sendImage (e) {
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;

    if (!img.files[0]) {
       alertMessage('Please upload image');
       return;
    }
    if (width === '' || height === '') {
        alertMessage('Please fill height and width', true);
        return;
    }

    const imgPath = img.files[0].path;

    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height
    });
}

ipcRenderer.on('image:done', () => {
    alertMessage(`Image resized to ${widthInput.value} * ${heightInput.value}`);
})

function alertMessage (message, isError) {
    Toastify.toast({
        text: message,
        close: false,
        duration: 5000,
        style: {
            background: isError ? 'red' : 'green',
            color: '#fff',
            textAlign: 'center'
        }
    })
}


// Validate file is image

function validateIsImage (file) {
    const acceptImgTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptImgTypes.includes(file.type);
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);
