// Advanced Editor JavaScript - Canva-like functionality
let canvas, activeObject, clipboard = null;
let zoomLevel = 1;
let history = [];
let historyStep = 0;

// Initialize Fabric.js canvas
function initCanvas() {
    canvas = new fabric.Canvas('designCanvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
    });

    // Canvas event listeners
    canvas.on('selection:created', updatePropertiesPanel);
    canvas.on('selection:updated', updatePropertiesPanel);
    canvas.on('selection:cleared', clearPropertiesPanel);
    canvas.on('object:modified', saveState);
    canvas.on('path:created', saveState);

    // Initialize with blank state
    saveState();
    loadTemplates();
    loadPhotos();
}

// Sidebar tab switching
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

// Add text to canvas
function addText(type) {
    let text, fontSize, fontWeight;
    
    switch(type) {
        case 'heading':
            text = 'Add a heading';
            fontSize = 32;
            fontWeight = 'bold';
            break;
        case 'subheading':
            text = 'Add a subheading';
            fontSize = 24;
            fontWeight = '600';
            break;
        default:
            text = 'Add a little bit of body text';
            fontSize = 16;
            fontWeight = 'normal';
    }

    const textObj = new fabric.IText(text, {
        left: 100,
        top: 100,
        fontSize: fontSize,
        fontWeight: fontWeight,
        fill: '#000000',
        fontFamily: 'Inter'
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    saveState();
}

// Add shapes to canvas
function addShape(type) {
    let shape;
    
    switch(type) {
        case 'rectangle':
            shape = new fabric.Rect({
                left: 100,
                top: 100,
                width: 100,
                height: 100,
                fill: '#8b5cf6'
            });
            break;
        case 'circle':
            shape = new fabric.Circle({
                left: 100,
                top: 100,
                radius: 50,
                fill: '#06b6d4'
            });
            break;
        case 'triangle':
            shape = new fabric.Triangle({
                left: 100,
                top: 100,
                width: 100,
                height: 100,
                fill: '#f59e0b'
            });
            break;
        case 'star':
            const starPoints = [];
            const outerRadius = 50;
            const innerRadius = 25;
            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                starPoints.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                });
            }
            shape = new fabric.Polygon(starPoints, {
                left: 100,
                top: 100,
                fill: '#ef4444'
            });
            break;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    saveState();
}

// Add lines to canvas
function addLine(type) {
    let line;
    
    switch(type) {
        case 'straight':
            line = new fabric.Line([50, 100, 200, 100], {
                stroke: '#000000',
                strokeWidth: 2
            });
            break;
        case 'curved':
            line = new fabric.Path('M 50 100 Q 125 50 200 100', {
                stroke: '#000000',
                strokeWidth: 2,
                fill: ''
            });
            break;
        case 'arrow':
            const arrow = new fabric.Group([
                new fabric.Line([50, 100, 180, 100], {
                    stroke: '#000000',
                    strokeWidth: 2
                }),
                new fabric.Triangle({
                    left: 180,
                    top: 100,
                    width: 20,
                    height: 20,
                    fill: '#000000',
                    angle: 90
                })
            ]);
            line = arrow;
            break;
    }

    canvas.add(line);
    canvas.setActiveObject(line);
    saveState();
}

// Add icons to canvas
function addIcon(type) {
    const icons = {
        heart: '❤️',
        star: '⭐',
        check: '✅',
        arrow: '➡️'
    };

    const icon = new fabric.Text(icons[type], {
        left: 100,
        top: 100,
        fontSize: 48,
        fontFamily: 'Arial'
    });

    canvas.add(icon);
    canvas.setActiveObject(icon);
    saveState();
}

// Handle file upload
function handleFileUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                fabric.Image.fromURL(e.target.result, function(img) {
                    img.scaleToWidth(200);
                    img.set({
                        left: 100,
                        top: 100
                    });
                    canvas.add(img);
                    canvas.setActiveObject(img);
                    saveState();
                });

                // Add to uploaded images
                addToUploadedImages(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
}

// Add to uploaded images gallery
function addToUploadedImages(src) {
    const container = document.getElementById('uploadedImages');
    const imgDiv = document.createElement('div');
    imgDiv.className = 'uploaded-image';
    imgDiv.onclick = () => addImageToCanvas(src);
    
    const img = document.createElement('img');
    img.src = src;
    imgDiv.appendChild(img);
    container.appendChild(imgDiv);
}

// Add image to canvas
function addImageToCanvas(src) {
    fabric.Image.fromURL(src, function(img) {
        img.scaleToWidth(200);
        img.set({
            left: 100,
            top: 100
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        saveState();
    });
}

// Set background color
function setBackground(color) {
    canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
    saveState();
}

// Set gradient background
function setGradientBackground(gradient) {
    canvas.setBackgroundColor(gradient, canvas.renderAll.bind(canvas));
    saveState();
}

// Update properties panel
function updatePropertiesPanel() {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    const content = document.getElementById('propertiesContent');
    let html = '';

    // Common properties
    html += `
        <div class="property-group">
            <label>Position</label>
            <div style="display: flex; gap: 8px;">
                <input type="number" class="property-input" placeholder="X" value="${Math.round(obj.left)}" onchange="updateObjectProperty('left', this.value)">
                <input type="number" class="property-input" placeholder="Y" value="${Math.round(obj.top)}" onchange="updateObjectProperty('top', this.value)">
            </div>
        </div>
        <div class="property-group">
            <label>Size</label>
            <div style="display: flex; gap: 8px;">
                <input type="number" class="property-input" placeholder="W" value="${Math.round(obj.width * obj.scaleX)}" onchange="updateObjectSize('width', this.value)">
                <input type="number" class="property-input" placeholder="H" value="${Math.round(obj.height * obj.scaleY)}" onchange="updateObjectSize('height', this.value)">
            </div>
        </div>
        <div class="property-group">
            <label>Rotation</label>
            <input type="range" class="slider" min="0" max="360" value="${obj.angle}" onchange="updateObjectProperty('angle', this.value)">
        </div>
        <div class="property-group">
            <label>Opacity</label>
            <input type="range" class="slider" min="0" max="1" step="0.1" value="${obj.opacity}" onchange="updateObjectProperty('opacity', this.value)">
        </div>
    `;

    // Text-specific properties
    if (obj.type === 'i-text' || obj.type === 'text') {
        html += `
            <div class="property-group">
                <label>Font Size</label>
                <input type="number" class="property-input" value="${obj.fontSize}" onchange="updateObjectProperty('fontSize', this.value)">
            </div>
            <div class="property-group">
                <label>Text Color</label>
                <input type="color" class="color-picker" value="${obj.fill}" onchange="updateObjectProperty('fill', this.value)">
            </div>
            <div class="property-group">
                <label>Font Family</label>
                <select class="property-input" onchange="updateObjectProperty('fontFamily', this.value)">
                    <option value="Inter" ${obj.fontFamily === 'Inter' ? 'selected' : ''}>Inter</option>
                    <option value="Arial" ${obj.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                    <option value="Times New Roman" ${obj.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                    <option value="Helvetica" ${obj.fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                </select>
            </div>
        `;
    }

    // Shape-specific properties
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || obj.type === 'polygon') {
        html += `
            <div class="property-group">
                <label>Fill Color</label>
                <input type="color" class="color-picker" value="${obj.fill}" onchange="updateObjectProperty('fill', this.value)">
            </div>
            <div class="property-group">
                <label>Stroke Color</label>
                <input type="color" class="color-picker" value="${obj.stroke || '#000000'}" onchange="updateObjectProperty('stroke', this.value)">
            </div>
            <div class="property-group">
                <label>Stroke Width</label>
                <input type="number" class="property-input" value="${obj.strokeWidth || 0}" onchange="updateObjectProperty('strokeWidth', this.value)">
            </div>
        `;
    }

    // Action buttons
    html += `
        <div class="property-group">
            <button class="btn btn-secondary" onclick="copyObject()" style="width: 100%; margin-bottom: 8px;">
                <i class="fas fa-copy"></i> Duplicate
            </button>
            <button class="btn btn-secondary" onclick="deleteObject()" style="width: 100%; background: #ef4444; color: white;">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    content.innerHTML = html;
}

// Clear properties panel
function clearPropertiesPanel() {
    document.getElementById('propertiesContent').innerHTML = `
        <div class="no-selection">
            <p>Select an object to edit its properties</p>
        </div>
    `;
}

// Update object property
function updateObjectProperty(property, value) {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    obj.set(property, parseFloat(value) || value);
    canvas.renderAll();
    saveState();
}

// Update object size
function updateObjectSize(dimension, value) {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    if (dimension === 'width') {
        obj.scaleToWidth(parseFloat(value));
    } else {
        obj.scaleToHeight(parseFloat(value));
    }
    canvas.renderAll();
    saveState();
}

// Copy object
function copyObject() {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    obj.clone(function(cloned) {
        clipboard = cloned;
    });
}

// Paste object
function pasteObject() {
    if (!clipboard) return;

    clipboard.clone(function(cloned) {
        cloned.set({
            left: cloned.left + 10,
            top: cloned.top + 10,
            evented: true,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        saveState();
    });
}

// Delete object
function deleteObject() {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    canvas.remove(obj);
    saveState();
}

// Zoom functions
function zoomIn() {
    zoomLevel = Math.min(3, zoomLevel + 0.1);
    canvas.setZoom(zoomLevel);
    document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100) + '%';
}

function zoomOut() {
    zoomLevel = Math.max(0.1, zoomLevel - 0.1);
    canvas.setZoom(zoomLevel);
    document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100) + '%';
}

// Undo/Redo functionality
function saveState() {
    if (historyStep < history.length - 1) {
        history = history.slice(0, historyStep + 1);
    }
    history.push(JSON.stringify(canvas.toJSON()));
    historyStep = history.length - 1;
}

function undo() {
    if (historyStep > 0) {
        historyStep--;
        canvas.loadFromJSON(history[historyStep], canvas.renderAll.bind(canvas));
    }
}

function redo() {
    if (historyStep < history.length - 1) {
        historyStep++;
        canvas.loadFromJSON(history[historyStep], canvas.renderAll.bind(canvas));
    }
}

// Load templates
function loadTemplates() {
    const templates = [
        { id: 'social-post', name: 'Social Media Post', category: 'social', preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOGI1Y2Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U29jaWFsIFBvc3Q8L3RleHQ+PC9zdmc+' },
        { id: 'business-card', name: 'Business Card', category: 'business', preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDZiNmQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QnVzaW5lc3MgQ2FyZDwvdGV4dD48L3N2Zz4=' },
        { id: 'invitation', name: 'Invitation', category: 'events', preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjU5ZTBiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW52aXRhdGlvbjwvdGV4dD48L3N2Zz4=' }
    ];

    const grid = document.getElementById('templateGrid');
    grid.innerHTML = templates.map(template => `
        <div class="template-item" onclick="loadTemplate('${template.id}')">
            <img src="${template.preview}" alt="${template.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
    `).join('');
}

// Load template
function loadTemplate(templateId) {
    canvas.clear();
    
    switch(templateId) {
        case 'social-post':
            canvas.setWidth(400);
            canvas.setHeight(400);
            canvas.setBackgroundColor('#8b5cf6', canvas.renderAll.bind(canvas));
            addText('heading');
            break;
        case 'business-card':
            canvas.setWidth(400);
            canvas.setHeight(250);
            canvas.setBackgroundColor('#06b6d4', canvas.renderAll.bind(canvas));
            addText('heading');
            break;
        case 'invitation':
            canvas.setWidth(400);
            canvas.setHeight(500);
            canvas.setBackgroundColor('#f59e0b', canvas.renderAll.bind(canvas));
            addText('heading');
            break;
    }
    saveState();
}

// Load sample photos
function loadPhotos() {
    const photos = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200&h=200&fit=crop'
    ];

    const grid = document.getElementById('photoGrid');
    grid.innerHTML = photos.map(photo => `
        <div class="photo-item" onclick="addImageToCanvas('${photo}')">
            <img src="${photo}" alt="Photo" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
    `).join('');
}

// Download design
function downloadDesign() {
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
    });
    
    const link = document.createElement('a');
    link.download = document.getElementById('projectName').value + '.png';
    link.href = dataURL;
    link.click();
}

// Share design
function shareDesign() {
    const dataURL = canvas.toDataURL();
    
    if (navigator.share) {
        canvas.toBlob(blob => {
            const file = new File([blob], 'design.png', { type: 'image/png' });
            navigator.share({
                title: 'My Design',
                files: [file]
            });
        });
    } else {
        // Fallback - copy to clipboard
        canvas.toBlob(blob => {
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Design copied to clipboard!');
        });
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case 'c':
                e.preventDefault();
                copyObject();
                break;
            case 'v':
                e.preventDefault();
                pasteObject();
                break;
            case 's':
                e.preventDefault();
                downloadDesign();
                break;
        }
    }
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteObject();
    }
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initCanvas();
    initTabs();
    clearPropertiesPanel();
});