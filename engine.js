// Enhanced game engine with grid system and entity management
const Engine = {
    // Constants
    GRID_SIZE: 32,
    GRAVITY: 0.5,
    MAX_VELOCITY: 10,
    FRICTION: 0.98,

    // State management
    state: {
        entities: [],
        buildings: [],
        units: [],
        resources: {
            gold: 1000,
            elixir: 1000
        },
        grid: [],
        selectedEntity: null,
        mousePosition: { x: 0, y: 0 },
        camera: { x: 0, y: 0, zoom: 1 },
        deltaTime: 0,
        lastTime: 0
    },

    // Initialize engine
    init: function(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.initGrid();
        this.bindEvents();
        return this;
    },

    initGrid: function() {
        const rows = Math.ceil(this.canvas.height / this.GRID_SIZE);
        const cols = Math.ceil(this.canvas.width / this.GRID_SIZE);
        this.state.grid = Array(rows).fill().map(() => 
            Array(cols).fill().map(() => ({
                occupied: false,
                type: null,
                entity: null
            }))
        );
    },

    // Enhanced event system
    bindEvents: function() {
        this.input = {
            keys: new Array(256).fill(false),
            mouse: { x: 0, y: 0, pressed: false, rightPressed: false }
        };

        window.addEventListener('keydown', (e) => {
            this.input.keys[e.keyCode] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.input.keys[e.keyCode] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.input.mouse.x = (e.clientX - rect.left) / this.state.camera.zoom + this.state.camera.x;
            this.input.mouse.y = (e.clientY - rect.top) / this.state.camera.zoom + this.state.camera.y;

            // Update grid hover position
            this.state.mousePosition = {
                x: Math.floor(this.input.mouse.x / this.GRID_SIZE),
                y: Math.floor(this.input.mouse.y / this.GRID_SIZE)
            };
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.input.mouse.pressed = true;
                this.handleSelection();
            } else if (e.button === 2) {
                this.input.mouse.rightPressed = true;
                this.handleAction();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.input.mouse.pressed = false;
            } else if (e.button === 2) {
                this.input.mouse.rightPressed = false;
            }
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Add zoom controls
        window.addEventListener('wheel', (e) => {
            const zoomSpeed = 0.1;
            const zoom = this.state.camera.zoom - Math.sign(e.deltaY) * zoomSpeed;
            this.state.camera.zoom = Math.max(0.5, Math.min(2, zoom));
        });
    },

    handleSelection: function() {
        const { x, y } = this.state.mousePosition;
        if (x >= 0 && x < this.state.grid[0].length && y >= 0 && y < this.state.grid.length) {
            const cell = this.state.grid[y][x];
            this.state.selectedEntity = cell.entity;
        }
    },

    handleAction: function() {
        if (this.state.selectedEntity && this.state.selectedEntity.type === 'unit') {
            const targetX = this.state.mousePosition.x * this.GRID_SIZE;
            const targetY = this.state.mousePosition.y * this.GRID_SIZE;
            this.state.selectedEntity.setTarget(targetX, targetY);
        }
    },

    // Grid management
    isGridCellOccupied: function(x, y) {
        if (y >= 0 && y < this.state.grid.length && 
            x >= 0 && x < this.state.grid[0].length) {
            return this.state.grid[y][x].occupied;
        }
        return true;
    },

    occupyGridCell: function(x, y, entity) {
        if (y >= 0 && y < this.state.grid.length && 
            x >= 0 && x < this.state.grid[0].length) {
            this.state.grid[y][x].occupied = true;
            this.state.grid[y][x].entity = entity;
            this.state.grid[y][x].type = entity.type;
        }
    },

    clearGridCell: function(x, y) {
        if (y >= 0 && y < this.state.grid.length && 
            x >= 0 && x < this.state.grid[0].length) {
            this.state.grid[y][x].occupied = false;
            this.state.grid[y][x].entity = null;
            this.state.grid[y][x].type = null;
        }
    },

    // Resource management
    updateResources: function(goldDelta, elixirDelta) {
        this.state.resources.gold += goldDelta;
        this.state.resources.elixir += elixirDelta;

        // Update UI
        document.getElementById('gold').textContent = this.state.resources.gold;
        document.getElementById('elixir').textContent = this.state.resources.elixir;
    },

    // Camera controls
    updateCamera: function() {
        // Pan camera with arrow keys
        const panSpeed = 5;
        if (this.input.keys[37]) this.state.camera.x -= panSpeed / this.state.camera.zoom; // Left
        if (this.input.keys[39]) this.state.camera.x += panSpeed / this.state.camera.zoom; // Right
        if (this.input.keys[38]) this.state.camera.y -= panSpeed / this.state.camera.zoom; // Up
        if (this.input.keys[40]) this.state.camera.y += panSpeed / this.state.camera.zoom; // Down
    },

    // Main update loop
    update: function() {
        const currentTime = performance.now();
        this.state.deltaTime = (currentTime - this.state.lastTime) / 1000;
        this.state.lastTime = currentTime;

        this.updateCamera();

        // Update all entities
        this.state.entities.forEach(entity => {
            if (entity.update) entity.update(this);
        });

        // Clear canvas and apply camera transform
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.scale(this.state.camera.zoom, this.state.camera.zoom);
        this.ctx.translate(-this.state.camera.x, -this.state.camera.y);

        // Draw grid
        this.drawGrid();

        // Render all entities
        this.state.entities.forEach(entity => {
            if (entity.render) entity.render(this.ctx);
        });

        // Draw selection highlight
        if (this.state.selectedEntity) {
            this.drawSelectionHighlight();
        }

        // Draw build placement preview
        if (this.state.buildMode) {
            this.drawBuildPreview();
        }

        this.ctx.restore();

        requestAnimationFrame(() => this.update());
    },

    drawGrid: function() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.canvas.width; x += this.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvas.height; y += this.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    },

    drawSelectionHighlight: function() {
        const entity = this.state.selectedEntity;
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            entity.position.x - 2,
            entity.position.y - 2,
            entity.width + 4,
            entity.height + 4
        );
    },

    drawBuildPreview: function() {
        const { x, y } = this.state.mousePosition;
        const canBuild = !this.isGridCellOccupied(x, y);

        this.ctx.fillStyle = canBuild ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(
            x * this.GRID_SIZE,
            y * this.GRID_SIZE,
            this.GRID_SIZE,
            this.GRID_SIZE
        );
    },

    // Entity management
    addEntity: function(entity) {
        this.state.entities.push(entity);
        if (entity.type === 'building') {
            this.state.buildings.push(entity);
        } else if (entity.type === 'unit') {
            this.state.units.push(entity);
        }
        return entity;
    },

    removeEntity: function(entity) {
        const index = this.state.entities.indexOf(entity);
        if (index > -1) {
            this.state.entities.splice(index, 1);

            if (entity.type === 'building') {
                const buildingIndex = this.state.buildings.indexOf(entity);
                if (buildingIndex > -1) {
                    this.state.buildings.splice(buildingIndex, 1);
                }
            } else if (entity.type === 'unit') {
                const unitIndex = this.state.units.indexOf(entity);
                if (unitIndex > -1) {
                    this.state.units.splice(unitIndex, 1);
                }
            }
        }
    }
};