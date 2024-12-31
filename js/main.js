_  = (el) => { return document.querySelector(el);    }
__ = (el) => { return document.querySelectorAll(el); }

document.addEventListener("DOMContentLoaded", (e) => {
/*
    bitmap = [
        0x20,
        0x00,
        0x20,
        0x00,
        0x20,
        0x00,
        0x20,
        0x00,
        0xE0,
        0x07,
        0xF0,
        0x0F,
        0x30,
        0x0C,
        0x30,
        0x0C,
        0xF0,
        0x0F,
        0xF0,
        0x0F,
        0x70,
        0x0D,
        0xB0,
        0x0E,
        0x70,
        0x0D,
        0xB0,
        0x0E,
        0xF0,
        0x0F,
        0xE0,
        0x07,    
    ];
*/

    var bitmapWidth  = 8; // Character width
    var bitmapHeight = 16; // Character width

    bitmap = new Array(bitmapHeight).fill(0);

    let hexArrToBinaryArr = ''; // Use as global variable

    function hex2bin(hex){
        return (parseInt(hex).toString(2)).padStart(8, '0');
    }

    // Replace character at position 'index'
    String.prototype.replaceAt = function(index, replacement) {
        return this.substring(0, parseInt(index) ) + replacement + this.substring( parseInt(index) + 1);
    }

    // Parse bitmap array with values and output binary string
    hexArrToBinaryArr = (hex_arr) => {
        strBin = '';
        for (i = 0; i < hex_arr.length; i++) {
            strBin += hex2bin(hex_arr[i]);
        }
        
        var regexpBin = new RegExp('.{1,8}', 'g');
        return strBin.match(regexpBin);
    }

    // -------------------------------

    // Convert binary string to HEX string
    binaryStrToHexStr = (binaryString) => {
        // Ensure the binary string length is a multiple of 8
        while (binaryString.length % 8 !== 0) {
            binaryString = '0' + binaryString;
        }
        
        // Split into 8-bit chunks and convert each to hex
        const hexValues = [];

        for (let i = 0; i < binaryString.length; i += 8) {
            const byte = binaryString.substr(i, 8);
            const hexByte = parseInt(byte, 2).toString(16).padStart(2, '0').toUpperCase();

            hexValues.push("0x" + hexByte);
        }
    
        return hexValues.join(', ');
    }

    // -------------------------------

    hexStringToIntArray = (input) => {
        // Remove all comments
        const withoutComments = input.replace(/\/\/.*?(?=\s*0x|\s*$)/g, '');
        
        // Extract hex values, but only those followed by a comma
        const hexPattern = /0x[0-9A-Fa-f]{2}(?=\s*,|\s*$)/g;
        const hexValues = withoutComments.match(hexPattern);
        
        return hexValues || [];
    }

    // -------------------------------

    reorderBitmapRow = (row) => {
        const firstHalf = row.slice(0, 8).split('').reverse().join('');
        const secondHalf = row.slice(8).split('').reverse().join('');

        return firstHalf + secondHalf;
    }

    // -------------------------------

    // Draw pixellated bitmap of divs
    drawBitmapDivs = (arrBin) => {
        console.log(arrBin);

        divBitmapEditor = _("#divBitmapEditor");
        divBitmapEditor.innerHTML = '';

        let row = 0;
        let bitNr = 0;
        let bitmapRow = 0;
        let bitmapColumn = 1;

        // Iterate all 8-bit arrays
        arrBin.forEach( (bits) => {
            let bitsReverse = bits.split('').reverse().join('');

            for (i = 0; i < bits.length; i++) {
                bitNr = (bits.length - 1 - i) + (row * bits.length);

                divBitmapEditor.insertAdjacentHTML('beforeEnd', '<div data-bit=' + bitNr + ' class="pixel bit' + bitsReverse[i] + '">' + bitNr + '</div>');

                if (bitmapColumn == bitmapWidth) {
                    // Bitmap row linefeed
                    divBitmapEditor.insertAdjacentHTML('beforeEnd', '<div class="bitmapRowDivider"></div>');
                    bitmapColumn = 0;
                    bitmapRow++;
                }

                if (bitmapRow == bitmapHeight) {
                    // Bitmap linefeed
                    divBitmapEditor.insertAdjacentHTML('beforeEnd', '<div class="bitmapDivider"></div>');
                    bitmapRow = 0;
                }

                bitmapColumn++;
            }
            
            row++;
        });
    }

    // -------------------------------

    let isDrawing = false;
    let drawMode = null;
    
    const bitmapEditorDiv = _('#divBitmapEditor');
    
    // Disable text selection on the drawing area
    bitmapEditorDiv.style.userSelect = 'none';
    bitmapEditorDiv.style.webkitUserSelect = 'none';
    bitmapEditorDiv.style.mozUserSelect = 'none';
    bitmapEditorDiv.style.msUserSelect = 'none';
    
    bitmapEditorDiv.addEventListener('mousedown', startDrawing);
    bitmapEditorDiv.addEventListener('mousemove', draw);
    bitmapEditorDiv.addEventListener('mouseup', stopDrawing);
    bitmapEditorDiv.addEventListener('mouseleave', stopDrawing);
    
    // Prevent default drag behavior
    bitmapEditorDiv.addEventListener('dragstart', (e) => e.preventDefault());
    
    function startDrawing(event) {
        event.preventDefault(); // Prevent any default selection behavior
        isDrawing = true;
        togglePixel(event.target);
        drawMode = event.target.classList.contains('bit1') ? 'bit1' : 'bit0';
    }
    
    function draw(event) {
        if (!isDrawing) return;
        event.preventDefault(); // Prevent any default selection behavior
        togglePixel(event.target, drawMode);
    }
    
    function stopDrawing() {
        isDrawing = false;
        drawMode = null;
    }
    
    function togglePixel(element, forcedMode = null) {
        if (element.classList.contains('pixel')) {
            let newClass = forcedMode || (element.classList.contains('bit0') ? 'bit1' : 'bit0');
            let oldClass = newClass === 'bit1' ? 'bit0' : 'bit1';
            
            element.classList.replace(oldClass, newClass);

            let newBit = newClass === 'bit1' ? '1' : '0';
            strBin = strBin.replaceAt(element.dataset.bit, newBit);
    
            console.log(strBin);
            console.log(binaryStrToHexStr(strBin));
            _("#hexOutput").innerHTML = binaryStrToHexStr(strBin);
        }
    }

    // -------------------------------

    // Event listener Enter-key in HEX input field
    _("#hexInput > input").addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            let arrHex = hexStringToIntArray( _("#hexInput > input").value );
            let arrBinary = hexArrToBinaryArr( arrHex )

            drawBitmapDivs(arrBinary);
            _("#hexOutput").innerHTML = binaryStrToHexStr(strBin);
        }
    });

    // -------------------------------

    _('input[name="btnSwapBytes"]').addEventListener('click', function (e) {
        rearrangeDivs();
    });

	// Mouse hover on buttons-event
	__('input[type="button"]').forEach((elX) => {
		elX.addEventListener('mouseover', () => { elX.style.filter = "brightness(1.5)"; }, false);
		elX.addEventListener('mouseout',  () => { elX.style.filter = ""; }, false);
	});

    _('input[name="btnShowBitPos"]').addEventListener('click', function (e) {
        el = _("#divBitmapEditor");
        el.style.color = el.style.color === '' ? '#66a' : '';
    });

    _('input[name="rngPixelSize"]').addEventListener('input', function (e) {
        _(":root").style.setProperty('--pixSize', e.target.value + 'px');
        
        // Gridsize
        if (e.target.value < 8) {
            if (e.target.value < 4)
                _(":root").style.setProperty('--pixMargin', '0px');
            else
                _(":root").style.setProperty('--pixMargin', 1.0 / 8.0 * e.target.value + 'px');
        } else {
            _(":root").style.setProperty('--pixMargin', '1px');
        }
    });
    
    _('input[name="bmpSizeX"]').addEventListener('input', function (e) {
        bitmapWidth = e.target.value;

        let arrHex = hexStringToIntArray( _("#hexOutput").innerHTML );
        let arrBinary = hexArrToBinaryArr(arrHex);

        drawBitmapDivs(arrBinary);
    });

    _('input[name="bmpSizeY"]').addEventListener('input', function (e) {
        bitmapHeight = e.target.value;

        let arrHex = hexStringToIntArray( _("#hexOutput").innerHTML );
        let arrBinary = hexArrToBinaryArr(arrHex);

        drawBitmapDivs(arrBinary);
    });

	window.onscroll = function(e) {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight)
			_("#divBottomBar").style.opacity = 0;
		else
			_("#divBottomBar").style.opacity = 1;
	}

    // -------------------------------
    
    rearrangeDivs = () => {
        const divBitmapEditor = _('#divBitmapEditor');
        const allDivs = Array.from(divBitmapEditor.children);
        let currentRow = [];
        let newOrder = [];
    
        allDivs.forEach((div, index) => {
            // Row end has been identified
            if ( div.classList.contains('bitmapDivider') ) { // .style.clear === 'both') {
                // This is a line feed div
                if (currentRow.length === 16) {
                    // Rearrange the current row
                    newOrder.push(...currentRow.slice(8, 16));
                    newOrder.push(...currentRow.slice(0, 8));
                } else {
                    // If not 16 pixels, just add them as is
                    newOrder.push(...currentRow);
                }
                newOrder.push(div); // Add the line feed div
                currentRow = []; // Reset for the next row
            } else {
                currentRow.push(div);
            }
        });
    
        // Handle the last row if it doesn't end with a line feed
        if (currentRow.length > 0) {
            if (currentRow.length === 16) {
                newOrder.push(...currentRow.slice(8, 16));
                newOrder.push(...currentRow.slice(0, 8));
            } else {
                newOrder.push(...currentRow);
            }
        }
    
        // Clear the char div and append the rearranged divs
        divBitmapEditor.innerHTML = '';
        newOrder.forEach(div => divBitmapEditor.appendChild(div));
    }

    // -------------------------------

    let arrBinary = hexArrToBinaryArr(bitmap);

    drawBitmapDivs(arrBinary);
});
