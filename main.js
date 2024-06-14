async function convertAudio() {
    const fileInput = document.getElementById('audio-file');
    const format = document.getElementById('format').value;
    const message = document.getElementById('message');

    if (fileInput.files.length === 0) {
        alert('Please choose an audio file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function (e) {
        const arrayBuffer = e.target.result;
        const fileData = new Uint8Array(arrayBuffer);

        const { createFFmpeg } = FFmpeg;
        const ffmpeg = createFFmpeg({ corePath: 'https://cdn.jsdelivr.net/npm/ffmpeg.wasm@0.11.0/dist/ffmpeg-core.js' });

        try {
            message.innerHTML = 'Loading FFmpeg...';
            await ffmpeg.load();
            console.log('FFmpeg loaded successfully.');

            message.innerHTML = 'Writing file to filesystem...';
            ffmpeg.FS('writeFile', 'input', fileData);
            console.log('File written to filesystem.');

            message.innerHTML = 'Converting...';
            await ffmpeg.run('-i', 'input', `output.${format}`);
            console.log('Conversion command executed.');

            const data = ffmpeg.FS('readFile', `output.${format}`);
            console.log('File read from filesystem.');

            const blob = new Blob([data.buffer], { type: `audio/${format}` });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `converted.${format}`;
            document.body.appendChild(a); // Append the element to the DOM
            a.click(); // Programmatically click to start download
            document.body.removeChild(a); // Remove the element after the download starts
            URL.revokeObjectURL(url); // Revoke the object URL to free memory

            message.innerHTML = 'Download started automatically.';
        } catch (error) {
            console.error('Error during conversion:', error);
            message.innerHTML = `Conversion failed. Please try again. Error: ${error.message}`;
        }
    };

    reader.onerror = function (error) {
        console.error('File reading error:', error);
        message.innerHTML = 'Failed to read file. Please try again.';
    };

    reader.readAsArrayBuffer(file);
}
