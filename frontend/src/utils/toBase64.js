// src/utils/toBase64.js
export const toBase64 = (filePath) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = filePath;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        };
        img.onerror = (err) => reject(err);
    });
};
