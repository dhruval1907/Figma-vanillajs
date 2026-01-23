// sare elements is isme me aayenge 
let elements = [];
let selectedElement = null;
let nextId = 1;
let isDragging = false;
let isResizing = false;
let resizeHandle = null;
let dragStartX = 0;
let dragStartY = 0;
let elementStartX = 0;
let elementStartY = 0;
let elementStartWidth = 0;
let elementStartHeight = 0;
let currentOpacity = 1;

// canvas means main div ko target kiya
const canvas = document.getElementById('canvas');

// loading karne ke liye
window.addEventListener('load', () => {
    loadDesign();
});

// rectangle banane ke liye
function createRectangle() {
    const element = {
        id: 'element-' + nextId++,
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        rotation: 0,
        backgroundColor: '#3498db',
        opacity: currentOpacity,
        zIndex: elements.length
    };
    elements.push(element);
    renderElement(element);
    selectElement(element);
    updateLayers();
    saveDesign();
}

//  Text banane ke liye
function createText() {
    const element = {
        id: 'element-' + nextId++,
        type: 'text',
        x: 100,
        y: 100,
        width: 200,
        height: 60,
        rotation: 0,
        backgroundColor: 'transparent',
        text: 'Double click to edit',
        fontSize: 18,
        color: '#000',
        opacity: currentOpacity,
        zIndex: elements.length
    };
    elements.push(element);
    renderElement(element);
    selectElement(element);
    updateLayers();
    saveDesign();
}

// jo element uper load kiya usko render karne ke liye
function renderElement(element) {
    const div = document.createElement('div');
    div.id = element.id;
    div.className = 'element';
    div.style.left = element.x + 'px';
    div.style.top = element.y + 'px';
    div.style.width = element.width + 'px';
    div.style.height = element.height + 'px';
    div.style.backgroundColor = element.backgroundColor;
    div.style.transform = `rotate(${element.rotation}deg)`;
    div.style.zIndex = element.zIndex;
    div.style.opacity = element.opacity;

    if (element.type === 'text') {
        div.textContent = element.text;
        div.style.fontSize = element.fontSize + 'px';
        div.style.color = element.color;
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.padding = '10px';
        div.style.wordWrap = 'break-word';
        div.style.textAlign = 'center';

        // Double click to edit text
        div.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            editTextInline(element, div);
        });
    }

    // this is kind of gives this to the class according to the this arry they resize the elem
    const handles = ['nw', 'ne', 'sw', 'se'];
    handles.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle ' + pos;
        handle.dataset.handle = pos;
        div.appendChild(handle);
    });

    // Event listeners
    div.addEventListener('mousedown', startDrag);

    canvas.appendChild(div);
}

// Edit text inline
function editTextInline(element, div) {
    const input = document.createElement('textarea');
    input.value = element.text;
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.border = 'none';
    input.style.background = 'transparent';
    input.style.color = element.color;
    input.style.fontSize = element.fontSize + 'px';
    input.style.textAlign = 'center';
    input.style.resize = 'none';
    input.style.outline = '2px solid #5e9eff';
    input.style.fontFamily = 'inherit';

    div.textContent = '';
    div.appendChild(input);
    input.focus();
    input.select();

    const finishEdit = () => {
        element.text = input.value;
        div.removeChild(input);
        div.textContent = element.text;
        updateProperties();
        saveDesign();
    };

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            finishEdit();
        }
        e.stopPropagation();
    });
}

// Start Drag or Resize
function startDrag(e) {
    if (e.target.classList.contains('resize-handle')) {
        isResizing = true;
        resizeHandle = e.target.dataset.handle;
        e.stopPropagation();
    } else if (e.target.tagName !== 'TEXTAREA') {
        isDragging = true;
    }

    const element = elements.find(el => el.id === e.currentTarget.id);
    selectElement(element);

    dragStartX = e.clientX;
    dragStartY = e.clientY;
    elementStartX = element.x;
    elementStartY = element.y;
    elementStartWidth = element.width;
    elementStartHeight = element.height;

    e.preventDefault();
}

// Mouse Move
document.addEventListener('mousemove', (e) => {
    if (!selectedElement) return;

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    if (isDragging) {
        // Dragging element
        let newX = elementStartX + deltaX;
        let newY = elementStartY + deltaY;

        // Constrain to canvas
        newX = Math.max(0, Math.min(newX, canvas.offsetWidth - selectedElement.width));
        newY = Math.max(0, Math.min(newY, canvas.offsetHeight - selectedElement.height));

        selectedElement.x = Math.round(newX);
        selectedElement.y = Math.round(newY);

        const div = document.getElementById(selectedElement.id);
        div.style.left = selectedElement.x + 'px';
        div.style.top = selectedElement.y + 'px';

        updateProperties();
    } else if (isResizing) {
        // Resizing element
        let newWidth = elementStartWidth;
        let newHeight = elementStartHeight;
        let newX = elementStartX;
        let newY = elementStartY;

        if (resizeHandle.includes('e')) {
            newWidth = Math.max(50, elementStartWidth + deltaX);
        }
        if (resizeHandle.includes('w')) {
            const widthChange = elementStartWidth - deltaX;
            if (widthChange >= 50) {
                newWidth = widthChange;
                newX = elementStartX + deltaX;
            }
        }
        if (resizeHandle.includes('s')) {
            newHeight = Math.max(30, elementStartHeight + deltaY);
        }
        if (resizeHandle.includes('n')) {
            const heightChange = elementStartHeight - deltaY;
            if (heightChange >= 30) {
                newHeight = heightChange;
                newY = elementStartY + deltaY;
            }
        }

        // Constrain to canvas
        if (newX < 0) {
            newWidth += newX;
            newX = 0;
        }
        if (newY < 0) {
            newHeight += newY;
            newY = 0;
        }
        if (newX + newWidth > canvas.offsetWidth) {
            newWidth = canvas.offsetWidth - newX;
        }
        if (newY + newHeight > canvas.offsetHeight) {
            newHeight = canvas.offsetHeight - newY;
        }

        selectedElement.x = Math.round(newX);
        selectedElement.y = Math.round(newY);
        selectedElement.width = Math.round(newWidth);
        selectedElement.height = Math.round(newHeight);

        const div = document.getElementById(selectedElement.id);
        div.style.left = selectedElement.x + 'px';
        div.style.top = selectedElement.y + 'px';
        div.style.width = selectedElement.width + 'px';
        div.style.height = selectedElement.height + 'px';

        updateProperties();
    }
});
// agar canvas  clear karna ho to elem jo save hoga usko hi wo delete kar dega
function clearCanvas() {
    if (!confirm('Clear entire canvas?')) return;

    elements = [];
    selectedElement = null;
    canvas.innerHTML = '';

    updateLayers();
    updateProperties();
    localStorage.removeItem('visual-editor-design');
}

// Mouse Up
document.addEventListener('mouseup', () => {
    if (isDragging || isResizing) {
        saveDesign();
    }
    isDragging = false;
    isResizing = false;
    resizeHandle = null;
});

// Canvas Click (Deselect)
canvas.addEventListener('mousedown', (e) => {
    if (e.target === canvas) {
        deselectElement();
    }
});

// Select Element
function selectElement(element) {
    if (selectedElement) {
        const prevDiv = document.getElementById(selectedElement.id);
        if (prevDiv) prevDiv.classList.remove('selected');
    }

    selectedElement = element;
    const div = document.getElementById(element.id);
    if (div) {
        div.classList.add('selected');
    }

    // Update opacity slider
    document.getElementById('opacity-slider').value = (element.opacity * 100);

    updateProperties();
    updateLayers();
}

// Deselect Element
function deselectElement() {
    if (selectedElement) {
        const div = document.getElementById(selectedElement.id);
        if (div) div.classList.remove('selected');
        selectedElement = null;
        document.getElementById('opacity-slider').value = 100;
        updateProperties();
        updateLayers();
    }
}

// ye property panel hai isme jab kuch chnage honge wo jo element honga usme bhi dekhne ko milega
function updateProperties() {
    const container = document.getElementById('properties-content');

    if (!selectedElement) {
        container.innerHTML = '<div class="empty-state">Select an element to edit properties</div>';
        return;
    }

    let html = `
                        <div class="property-row">
                            <label>Width</label>
                            <input type="number" id="prop-width" value="${selectedElement.width}" min="10">
                        </div>
                        <div class="property-row">
                            <label>Height</label>
                            <input type="number" id="prop-height" value="${selectedElement.height}" min="10">
                        </div>
                        <div class="property-row">
                            <label>X Position</label>
                            <input type="number" id="prop-x" value="${selectedElement.x}" min="0">
                        </div>
                        <div class="property-row">
                            <label>Y Position</label>
                            <input type="number" id="prop-y" value="${selectedElement.y}" min="0">
                        </div>
                        <div class="property-row">
                            <label>Rotation (degrees)</label>
                            <input type="number" id="prop-rotation" value="${selectedElement.rotation}" step="1">
                        </div>
                        <div class="property-row">
                            <label>Background Color</label>
                            <input type="color" id="prop-bg" value="${selectedElement.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.backgroundColor}">
                        </div>
                        `;

    if (selectedElement.type === 'text') {
        html += `
                    <div class="property-row">
                        <label>Text Content</label>
                        <textarea id="prop-text">${selectedElement.text}</textarea>
                    </div>
                    <div class="property-row">
                        <label>Font Size</label>
                        <input type="number" id="prop-fontsize" value="${selectedElement.fontSize}" min="8">
                    </div>
                    <div class="property-row">
                        <label>Text Color</label>
                        <input type="color" id="prop-color" value="${selectedElement.color}">
                    </div>
                `;
    }

    container.innerHTML = html;

    // Add event listeners
    document.getElementById('prop-width').addEventListener('input', updateElementFromProperties);
    document.getElementById('prop-height').addEventListener('input', updateElementFromProperties);
    document.getElementById('prop-x').addEventListener('input', updateElementFromProperties);
    document.getElementById('prop-y').addEventListener('input', updateElementFromProperties);
    document.getElementById('prop-rotation').addEventListener('input', updateElementFromProperties);
    document.getElementById('prop-bg').addEventListener('input', updateElementFromProperties);

    if (selectedElement.type === 'text') {
        document.getElementById('prop-text').addEventListener('input', updateElementFromProperties);
        document.getElementById('prop-fontsize').addEventListener('input', updateElementFromProperties);
        document.getElementById('prop-color').addEventListener('input', updateElementFromProperties);
    }
}

// Update Element from Properties
function updateElementFromProperties() {
    if (!selectedElement) return;

    const width = Math.max(10, parseInt(document.getElementById('prop-width').value) || 10);
    const height = Math.max(10, parseInt(document.getElementById('prop-height').value) || 10);
    const x = Math.max(0, parseInt(document.getElementById('prop-x').value) || 0);
    const y = Math.max(0, parseInt(document.getElementById('prop-y').value) || 0);
    const rotation = parseInt(document.getElementById('prop-rotation').value) || 0;
    const bg = document.getElementById('prop-bg').value;

    selectedElement.width = width;
    selectedElement.height = height;
    selectedElement.x = x;
    selectedElement.y = y;
    selectedElement.rotation = rotation;
    selectedElement.backgroundColor = bg;

    if (selectedElement.type === 'text') {
        selectedElement.text = document.getElementById('prop-text').value;
        selectedElement.fontSize = Math.max(8, parseInt(document.getElementById('prop-fontsize').value) || 16);
        selectedElement.color = document.getElementById('prop-color').value;
    }

    const div = document.getElementById(selectedElement.id);
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.transform = `rotate(${rotation}deg)`;
    div.style.backgroundColor = bg;

    if (selectedElement.type === 'text') {
        div.textContent = selectedElement.text;
        div.style.fontSize = selectedElement.fontSize + 'px';
        div.style.color = selectedElement.color;
    }

    saveDesign();
    updateLayers();
}

function updateOpacity(value) {
    currentOpacity = value / 100;
    if (!selectedElement) return;
    selectedElement.opacity = currentOpacity;
    document.getElementById(selectedElement.id).style.opacity = currentOpacity;
    saveDesign();
}

function setStrokeColor(color) {
    if (!selectedElement) return;
    document.getElementById(selectedElement.id).style.border = `2px solid ${color}`;
}

function setBackgroundColor(color) {
    if (!selectedElement) return;
    selectedElement.backgroundColor = color;
    document.getElementById(selectedElement.id).style.backgroundColor = color;
    updateProperties();
    saveDesign();
}

function updateLayers() {
    const container = document.getElementById('layers-list');

    if (elements.length === 0) {
        container.innerHTML = '<div class="empty-state">No layers yet</div>';
        return;
    }

    container.innerHTML = '';
    [...elements].reverse().forEach(el => {
        const item = document.createElement('div');
        item.className = 'layer-item' + (selectedElement === el ? ' selected' : '');
        item.innerHTML = `
                        <span class="layer-name">${el.type} (${el.id})</span>
                        <div class="layer-controls">
                            <button onclick="deleteLayer('${el.id}')">✕</button>
                        </div>
                        `;
        item.onclick = () => selectElement(el);
        container.appendChild(item);
    });
}

function deleteLayer(id) {
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return;

    const el = elements[index];
    document.getElementById(el.id).remove();
    elements.splice(index, 1);
    selectedElement = null;
    updateLayers();
    updateProperties();
    saveDesign();
}


function saveDesign() {
    localStorage.setItem('visual-editor-design', JSON.stringify(elements));
}

function loadDesign() {
    const saved = localStorage.getItem('visual-editor-design');
    if (!saved) return;

    elements = JSON.parse(saved);
    canvas.innerHTML = '';
    elements.forEach(el => {
        renderElement(el);
        nextId++;
    });
    updateLayers();
}

function exportJSON() {
    const data = JSON.stringify(elements, null, 2);
    downloadFile(data, 'design.json', 'application/json');
}

function exportHTML() {
    let html = `<div style="position:relative;width:800px;height:600px;">`;
    elements.forEach(el => {
        html += `
                <div style="
                    position:absolute;
                    left:${el.x}px;
                    top:${el.y}px;
                    width:${el.width}px;
                    height:${el.height}px;
                    background:${el.backgroundColor};
                    opacity:${el.opacity};
                    transform:rotate(${el.rotation}deg);
                ">
                ${el.type === 'text' ? el.text : ''}
                </div>`;
    });
    html += `</div>`;
    downloadFile(html, 'design.html', 'text/html');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

let zoom = 1;

function zoomIn() {
    zoom = Math.min(2, zoom + 0.1);
    applyZoom();
}

function zoomOut() {
    zoom = Math.max(0.5, zoom - 0.1);
    applyZoom();
}

function applyZoom() {
    canvas.style.transform = `scale(${zoom})`;
    document.getElementById('zoom-level').textContent = Math.round(zoom * 100) + '%';
}

document.addEventListener('keydown', (e) => {
    // sirf jab element selected ho
    if (!selectedElement) return;

    const step = 5;
    let moved = false;

    switch (e.key) {
        case 'Delete':
        case 'Backspace':
            deleteLayer(selectedElement.id);
            return;

        case 'ArrowUp':
            selectedElement.y = Math.max(0, selectedElement.y - step);
            moved = true;
            break;

        case 'ArrowDown':
            selectedElement.y = Math.min(
                canvas.offsetHeight - selectedElement.height,
                selectedElement.y + step
            );
            moved = true;
            break;

        case 'ArrowLeft':
            selectedElement.x = Math.max(0, selectedElement.x - step);
            moved = true;
            break;

        case 'ArrowRight':
            selectedElement.x = Math.min(
                canvas.offsetWidth - selectedElement.width,
                selectedElement.x + step
            );
            moved = true;
            break;
    }

    if (moved) {
        const div = document.getElementById(selectedElement.id);
        div.style.left = selectedElement.x + 'px';
        div.style.top = selectedElement.y + 'px';

        updateProperties();
        saveDesign();
    }
});
