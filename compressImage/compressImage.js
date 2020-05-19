/**
 * 
 * @param {File} file 
 * @param {object} obj 
 */
function compressImage(file, obj) {
    return new Promise((resolve, reject) => {
        let { width, height, size, fileType, quality } = obj;

        if (typeof obj === 'number') {
            size = obj;
        }

        if (file && file.size) {
            if (size && file.size <= size) {
                resolve(file);
                return;
            }
        } else {
            reject({
                msg: 'file type error'
            });
            return;
        }

        size = size || 100000

        if (!/(jpg|jpeg|png)$/.test(file.type)) {
            reject({
                msg: 'file type error'
            });
            return;
        }

        fileType = fileType || file.type;
        switch(fileType) {
            case 'jpg':
            case 'jpeg':
            case 'image/jpeg':
                fileType = 'image/jpeg';
                break;
            case 'png':
            case 'image/png':
                fileType = 'image/png';
                break;
            default:
                reject({
                    msg: 'unsupport file type'
                });
                return;
        }

        const canvas = document.createElement('canvas');
        if (!canvas || !canvas.getContext('2d')) {
            reject({
                msg: 'Browser does not support canvas'
            })
            return;
        }
        const context = canvas.getContext('2d');

        if (!window.FileReader) {
            reject({
                msg: 'Browser does not support FileReader'
            })
            return;
        }

        const reader = new FileReader();
        const image = new Image();

        reader.readAsDataURL(file);
        reader.onload = function(e) {
            image.src = e.target.result;
        }
        image.onload = function() {
            const originWidth = image.width;
            const originHeight = image.height;
            if (width && height) {
                if (width > originWidth && height > originHeight) {
                    resolve(file);
                    return;
                }
            } else if (width) {
                if (width > originWidth) {
                    resolve(file);
                    return;
                }
                height = originHeight * width / originWidth;
            } else if (height) {
                if (height > originHeight) {
                    resolve(file);
                    return;
                }
                width = originWidth * height / originHeight;
            } else {
                const radio = (size > 0 && size < 1) ? size : 0.9;
                width = originWidth * radio;
                height = originHeight * radio;
            }
            canvas.width = width;
            canvas.height = height;
            context.drawImage(image, 0, 0, width, height);
            canvas.toBlob(function(blob) {
                if (size  && size > 1) {
                    if (blob.size <= size) {
                        resolve(blob);
                    } else {
                        compressImage(blob, obj).then(newBlob => {
                            resolve(newBlob);
                        });
                    }
                } else {
                    resolve(blob);
                }
            }, fileType, quality || .8)
        }
    })
}