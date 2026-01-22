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

// isse create honge element jo tum styling karne donge

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

// isse render honge element jo tum styling donge

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

    const handles = ['nw', 'ne', 'sw', 'se'];
    handles.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle ' + pos;
        handle.dataset.handle = pos;
        div.appendChild(handle);
    });
    div.addEventListener('mousedown', startDrag);
    canvas.appendChild(div);
}

// editing text part in th e line 

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
// drag hoga to 
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
