export interface ScriptTemplate {
  name: string;
  description: string;
  category: string;
  code: string;
}

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    name: "Spin Forever",
    description: "Makes the object rotate continuously",
    category: "Animation",
    code: `// Spin the object continuously
mesh.rotation.y += delta * 2;`
  },
  {
    name: "Click to Change Color",
    description: "Changes object color when clicked",
    category: "Interaction",
    code: `// Click handler to change color
object.onClick = () => {
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  mesh.material.color.setHex(randomColor);
};`
  },
  {
    name: "Move with Arrow Keys",
    description: "Control object with arrow keys",
    category: "Input",
    code: `// Arrow key movement
const speed = 5;

if (input.isKeyDown('ArrowLeft')) {
  mesh.position.x -= delta * speed;
}
if (input.isKeyDown('ArrowRight')) {
  mesh.position.x += delta * speed;
}
if (input.isKeyDown('ArrowUp')) {
  mesh.position.z -= delta * speed;
}
if (input.isKeyDown('ArrowDown')) {
  mesh.position.z += delta * speed;
}`
  },
  {
    name: "Jump on Spacebar",
    description: "Makes object jump when spacebar is pressed",
    category: "Input",
    code: `// Jump with spacebar
if (input.wasKeyPressed('Space')) {
  // Simple jump animation
  object.animate({
    property: 'position.y',
    to: mesh.position.y + 2,
    duration: 300,
    easing: 'easeOutQuad'
  });
  
  engine.setTimeout(() => {
    object.animate({
      property: 'position.y',
      to: 0,
      duration: 300,
      easing: 'easeInQuad'
    });
  }, 300);
}`
  },
  {
    name: "Hover Effects",
    description: "Scale up on hover, scale down on exit",
    category: "Interaction",
    code: `// Hover enter effect
object.onHoverEnter = () => {
  object.animate({
    property: 'scale.x',
    to: 1.2,
    duration: 200
  });
  object.animate({
    property: 'scale.y',
    to: 1.2,
    duration: 200
  });
  object.animate({
    property: 'scale.z',
    to: 1.2,
    duration: 200
  });
};

// Hover exit effect
object.onHoverExit = () => {
  object.animate({
    property: 'scale.x',
    to: 1.0,
    duration: 200
  });
  object.animate({
    property: 'scale.y',
    to: 1.0,
    duration: 200
  });
  object.animate({
    property: 'scale.z',
    to: 1.0,
    duration: 200
  });
};`
  },
  {
    name: "Play Sound on Hit",
    description: "Plays a sound when object is clicked",
    category: "Audio",
    code: `// Play sound on click
object.onClick = () => {
  engine.playSound('/sounds/click.wav', 0.5);
  
  // Also flash the object
  const originalColor = mesh.material.color.getHex();
  mesh.material.color.setHex(0xffffff);
  
  engine.setTimeout(() => {
    mesh.material.color.setHex(originalColor);
  }, 100);
};`
  },
  {
    name: "Follow Target",
    description: "Makes object follow another object",
    category: "AI",
    code: `// Follow target object
const targetName = "Player"; // Change to target object name
const followSpeed = 3;
const followDistance = 2;

const target = scene.getObjectByName(targetName);
if (target && target.mesh) {
  const distance = mesh.position.distanceTo(target.mesh.position);
  
  if (distance > followDistance) {
    const direction = target.mesh.position.clone().sub(mesh.position).normalize();
    mesh.position.add(direction.multiplyScalar(followSpeed * delta));
  }
}`
  },
  {
    name: "Oscillating Movement",
    description: "Makes object move in a sine wave pattern",
    category: "Animation",
    code: `// Oscillating movement
const amplitude = 2;
const frequency = 1;
const offset = object.id * 0.5; // Unique offset for each object

mesh.position.y = Math.sin(time * frequency + offset) * amplitude;`
  },
  {
    name: "Health System",
    description: "Basic health system with damage handling",
    category: "Game Logic",
    code: `// Initialize health if not set
if (!object.health) {
  object.health = 100;
  object.maxHealth = 100;
}

// Handle damage messages
object.onMessage = (messageType, data) => {
  if (messageType === 'takeDamage') {
    object.health -= data;
    
    // Flash red when taking damage
    const originalColor = mesh.material.color.getHex();
    mesh.material.color.setHex(0xff0000);
    
    engine.setTimeout(() => {
      mesh.material.color.setHex(originalColor);
    }, 100);
    
    // Destroy if health reaches 0
    if (object.health <= 0) {
      mesh.visible = false;
      engine.playSound('/sounds/explosion.wav');
    }
  }
};

// Show health bar
const healthPercent = object.health / object.maxHealth;
gui.addText(\`Health: \${Math.ceil(object.health)}/\${object.maxHealth}\`, object.id);`
  },
  {
    name: "Spawn System",
    description: "Spawns objects at regular intervals",
    category: "Game Logic",
    code: `// Spawner system (use in global script)
if (!scene.spawnTimer) {
  scene.spawnTimer = 0;
  scene.spawnInterval = 2000; // 2 seconds
  scene.spawnCount = 0;
}

scene.spawnTimer += delta * 1000;

if (scene.spawnTimer >= scene.spawnInterval) {
  // Spawn new object
  const spawnPos = [
    Math.random() * 10 - 5,
    0,
    Math.random() * 10 - 5
  ];
  
  engine.spawn('cube', { 
    position: spawnPos,
    name: \`Spawned_\${scene.spawnCount++}\`
  });
  
  scene.spawnTimer = 0;
  
  // Increase spawn rate over time
  scene.spawnInterval = Math.max(500, scene.spawnInterval * 0.95);
}`
  },
  {
    name: "Simple GUI Controls",
    description: "Creates GUI elements to control the object",
    category: "UI",
    code: `// Create GUI controls for this object
gui.addButton('Randomize Position', () => {
  mesh.position.set(
    Math.random() * 10 - 5,
    Math.random() * 5,
    Math.random() * 10 - 5
  );
});

gui.addSlider('Scale', 0.1, 3.0, mesh.scale.x, (value) => {
  mesh.scale.set(value, value, value);
});

gui.addToggle('Visible', mesh.visible, (visible) => {
  mesh.visible = visible;
});

gui.addSlider('Rotation Speed', 0, 5, 1, (speed) => {
  object.rotationSpeed = speed;
});

// Use rotation speed in update
if (object.rotationSpeed) {
  mesh.rotation.y += delta * (object.rotationSpeed || 0);
}`
  }
];

export const SCRIPT_CATEGORIES = [
  'Animation',
  'Interaction', 
  'Input',
  'Audio',
  'AI',
  'Game Logic',
  'UI'
];

export function getTemplatesByCategory(category: string): ScriptTemplate[] {
  return SCRIPT_TEMPLATES.filter(template => template.category === category);
}

export function getAllTemplates(): ScriptTemplate[] {
  return SCRIPT_TEMPLATES;
}

export function getTemplateByName(name: string): ScriptTemplate | undefined {
  return SCRIPT_TEMPLATES.find(template => template.name === name);
}