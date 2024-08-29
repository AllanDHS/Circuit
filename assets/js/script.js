// Créer une scène Konva
const width = window.innerWidth * 0.8;
const height = window.innerHeight * 0.7;

const stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
});

const layer = new Konva.Layer();
stage.add(layer);

// Définir les points de départ et d'arrivée
const startPoints = [
    { text: 'A', match: 'I' },
    { text: 'B', match: 'III' },
    { text: 'C', match: 'V' },
    { text: 'D', match: 'II' },
    { text: 'E', match: 'VI' },
    { text: 'F', match: 'IV' }
];

const endPoints = [
    { text: 'I', match: 'A' },
    { text: 'II', match: 'D' },
    { text: 'III', match: 'B' }, // No corresponding match
    { text: 'IV', match: 'F' },
    { text: 'V', match: 'C' },
    { text: 'VI', match: 'E' }
];

const margin = 30; // Marge pour éviter les bords
const spacing = (height - 2 * margin) / (startPoints.length - 1);
const points = [
    ...startPoints.map((point, index) => ({
        x: margin,
        y: margin + index * spacing,
        text: point.text,
        match: point.match
    })),
    ...endPoints.map((point, index) => ({
        x: width - margin,
        y: margin + index * spacing,
        text: point.text,
        match: point.match
    }))
];

const texts = [];
const connectedPairs = new Set();
const lines = [];

points.forEach(point => {
    const text = new Konva.Text({
        x: point.x,
        y: point.y,
        text: point.text,
        fontSize: 30,
        fontFamily: 'Poppins',
        fill: 'white',
        draggable: false,
    });
    text.match = point.match;
    layer.add(text);
    texts.push(text);
});

// Variables pour garder la trace du point de départ
let startPoint = null;

// Ligne temporaire pour les connexions en cours
let line = new Konva.Line({
    points: [],
    stroke: 'white',
    strokeWidth: 5,
    lineCap: 'round',
    lineJoin: 'round',
});

layer.add(line);

// Écouter les événements de la souris
stage.on('mousedown touchstart', (e) => {
    const pos = stage.getPointerPosition();
    startPoint = texts.find(text => {
        const box = text.getClientRect();
        return pos.x >= box.x && pos.x <= box.x + box.width && pos.y >= box.y && pos.y <= box.y + box.height;
    });

    if (startPoint) {
        line.points([startPoint.x() + startPoint.width() / 2, startPoint.y() + startPoint.height() / 2, startPoint.x() + startPoint.width() / 2, startPoint.y() + startPoint.height() / 2]);
        layer.draw();
    }
});

stage.on('mousemove touchmove', (e) => {
    if (!startPoint) return;
    const pos = stage.getPointerPosition();
    let points = line.points();
    points[2] = pos.x;
    points[3] = pos.y;
    line.points(points);
    layer.draw();
});

stage.on('mouseup touchend', (e) => {
    if (!startPoint) return;
    const pos = stage.getPointerPosition();
    const endPoint = texts.find(text => {
        const box = text.getClientRect();
        return pos.x >= box.x && pos.x <= box.x + box.width && pos.y >= box.y && pos.y <= box.y + box.height;
    });

    if (endPoint) {
        const permanentLine = new Konva.Line({
            points: [startPoint.x() + startPoint.width() / 2, startPoint.y() + startPoint.height() / 2, endPoint.x() + endPoint.width() / 2, endPoint.y() + endPoint.height() / 2],
            stroke: 'white',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
        });
        layer.add(permanentLine);
        lines.push({ start: startPoint, end: endPoint, line: permanentLine });

        if (endPoint.text() === startPoint.match) {
            connectedPairs.add(startPoint.text());
            connectedPairs.add(endPoint.text());
        }
    }

    // Réinitialiser la ligne temporaire
    line.points([]);
    startPoint = null;
    layer.draw();
});

// Ajouter un bouton de réinitialisation
document.getElementById('reset-button').addEventListener('click', () => {
    // Réinitialiser les connexions
    connectedPairs.clear();

    // Supprimer toutes les lignes permanentes
    lines.forEach(l => l.line.destroy());
    lines.length = 0;

    // Redessiner le calque
    layer.draw();
});

document.getElementById('validate-button').addEventListener('click', () => {
    const correctPairs = startPoints.length * 2;
    if (connectedPairs.size === correctPairs) {
        const video = document.getElementById('success-video');
        video.style.display = 'block';
        video.play();
    } else {
        alert('Certaines connexions sont incorrectes ou manquantes. Veuillez réessayer.');
    }
});

