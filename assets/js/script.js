// Créer une scène Konva
const width = window.innerWidth * 0.8;
const height = window.innerHeight * 0.8;

const stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
});

const layer = new Konva.Layer();
stage.add(layer);

// Définir les points de départ et d'arrivée
const points = [
    { x: 100, y: 100, text: 'A', match: '4' },
    { x: 100, y: 200, text: 'B', match: '2' },
    { x: 100, y: 300, text: 'C', match: '5' },
    { x: 100, y: 400, text: 'D', match: '3' },
    { x: 100, y: 500, text: 'E', match: '1' },
    { x: width - 100, y: 100, text: '1', match: 'E' },
    { x: width - 100, y: 200, text: '2', match: 'B' },
    { x: width - 100, y: 300, text: '3', match: 'D' },
    { x: width - 100, y: 400, text: '4', match: 'A' },
    { x: width - 100, y: 500, text: '5', match: 'C' },
]; 

const texts = [];
const connectedPairs = new Set();
let permanentLines = [];

points.forEach(point => {
    const text = new Konva.Text({
        x: point.x,
        y: point.y,
        text: point.text,
        fontSize: 30,
        fontFamily: 'Poppins',
        fill: 'black',
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
    stroke: 'black',
    strokeWidth: 3,
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

    if (startPoint && !connectedPairs.has(startPoint.text())) {
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

    if (endPoint && endPoint.text() === startPoint.match && !connectedPairs.has(startPoint.text())) {
        connectedPairs.add(startPoint.text());
        connectedPairs.add(endPoint.text());

        const permanentLine = new Konva.Line({
            points: [startPoint.x() + startPoint.width() / 2, startPoint.y() + startPoint.height() / 2, endPoint.x() + endPoint.width() / 2, endPoint.y() + endPoint.height() / 2],
            stroke: 'black',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
        });
        layer.add(permanentLine);
        permanentLines.push(permanentLine);
        
        // Vérifier si toutes les paires sont connectées
        if (connectedPairs.size === points.length) {
            alert('Bravo, vous avez relié tous les points correctement !');
        }
    } else {
        // Réinitialiser la ligne temporaire si la connexion n'est pas valide
        line.points([]);
    }
    
    startPoint = null;
    layer.draw();
});

// Ajouter un bouton de réinitialisation
document.getElementById('reset-button').addEventListener('click', () => {
    // Réinitialiser les connexions
    connectedPairs.clear();
    
    // Supprimer toutes les lignes permanentes
    permanentLines.forEach(line => line.destroy());
    permanentLines = [];
    
    // Redessiner le calque
    layer.draw();
});
