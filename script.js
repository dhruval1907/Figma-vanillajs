// all things are coming to the this array like rec and all
let elements = []

let selectelm = null;

let isDragging = false;

let isResizing = false;

let nextId = 1;

let resizeHandle = null;
let elementStartX = 0;
let elementStartY = 0;
let elementStartWidth = 0;
let elementStartHeight = 0;
let currentOpacity = 1;


const canvas = document.getElementById('canvas');

// reload hone pr means load hote hai isme set ho jayegs
window.addEventListener('load', () => {
    loadDesign();
});

// rectangle banne ke liye

function createREc() {
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
    }
    element.push(element)
    renderElem(element)
    selectElement(element);
    updateLayers();
    saveDesign();
}

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
    renderElem(element);
    selectElement(element);
    updateLayers();
    saveDesign();
}

function renderElem(element) {
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