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

