class DigicalPro {
    constructor() {
        this.rooms = [];
        this.currentRoomIndex = 0;
        this.projectData = {
            name: '',
            client: '',
            location: '',
            notes: ''
        };
        this.init();
    }

    init() {
        this.updateTimestamp();
        this.addRoom(); // Add first room by default
        this.loadSavedProjects();
    }

    updateTimestamp() {
        const now = new Date();
        document.getElementById('timestamp').textContent = 
            `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
    }

    addRoom() {
        const roomNumber = this.rooms.length + 1;
        const newRoom = {
            id: Date.now(),
            name: `Room ${roomNumber}`,
            length: 0,
            width: 0,
            height: 0,
            acousticDoors: 0,
            deductions: [],
            additionalAreas: [],
            pricing: {
                wallPrice: 0,
                ceilingPrice: 0,
                floorPrice: 0,
                doorPrice: 0,
                additionalPrice: 0
            }
        };
        
        this.rooms.push(newRoom);
        this.currentRoomIndex = this.rooms.length - 1;
        this.renderRoomTabs();
        this.renderRoomForm();
    }

    deleteRoom(index) {
        if (this.rooms.length > 1) {
            this.rooms.splice(index, 1);
            if (this.currentRoomIndex >= this.rooms.length) {
                this.currentRoomIndex = this.rooms.length - 1;
            }
            this.renderRoomTabs();
            this.renderRoomForm();
        } else {
            this.showMessage('Cannot delete the last room', 'error');
        }
    }

    switchRoom(index) {
        this.saveCurrentRoomData();
        this.currentRoomIndex = index;
        this.renderRoomTabs();
        this.renderRoomForm();
    }

    renderRoomTabs() {
        const tabsContainer = document.getElementById('roomTabs');
        tabsContainer.innerHTML = '';
        
        this.rooms.forEach((room, index) => {
            const tab = document.createElement('div');
            tab.className = `room-tab ${index === this.currentRoomIndex ? 'active' : ''}`;
            tab.innerHTML = `
                ${room.name}
                ${this.rooms.length > 1 ? `<button class="delete-room" onclick="app.deleteRoom(${index})">×</button>` : ''}
            `;
            tab.onclick = (e) => {
                if (!e.target.classList.contains('delete-room')) {
                    this.switchRoom(index);
                }
            };
            tabsContainer.appendChild(tab);
        });
    }

    renderRoomForm() {
        const room = this.rooms[this.currentRoomIndex];
        const formContainer = document.getElementById('roomForm');
        
        formContainer.innerHTML = `
            <h3>Room Details</h3>
            <div class="input-group">
                <label for="roomName">Room Name</label>
                <input type="text" id="roomName" value="${room.name}" onchange="app.updateRoomData('name', this.value)">
            </div>
            
            <h4>Dimensions</h4>
            <div class="dimensions-grid">
                <div class="input-group">
                    <label for="roomLength">Length (feet)</label>
                    <input type="number" id="roomLength" value="${room.length}" step="0.1" onchange="app.updateRoomData('length', parseFloat(this.value) || 0)">
                </div>
                <div class="input-group">
                    <label for="roomWidth">Width (feet)</label>
                    <input type="number" id="roomWidth" value="${room.width}" step="0.1" onchange="app.updateRoomData('width', parseFloat(this.value) || 0)">
                </div>
                <div class="input-group">
                    <label for="roomHeight">Height (feet)</label>
                    <input type="number" id="roomHeight" value="${room.height}" step="0.1" onchange="app.updateRoomData('height', parseFloat(this.value) || 0)">
                </div>
                <div class="input-group">
                    <label for="acousticDoors">Acoustic Doors (Qty)</label>
                    <input type="number" id="acousticDoors" value="${room.acousticDoors}" onchange="app.updateRoomData('acousticDoors', parseInt(this.value) || 0)">
                </div>
            </div>
            
            <h4>Deductions</h4>
            <div id="deductionsContainer">${this.renderDeductions(room.deductions)}</div>
            <button class="btn btn-save" onclick="app.addDeduction()">+ Add Deduction</button>
            
            <h4>Additional Areas</h4>
            <div id="additionalAreasContainer">${this.renderAdditionalAreas(room.additionalAreas)}</div>
            <button class="btn btn-save" onclick="app.addAdditionalArea()">+ Add Additional Area</button>
            
            <h4>Pricing (INR per sq ft / unit)</h4>
            <div class="pricing-grid">
                <div class="input-group">
                    <label for="wallPrice">Wall Area Price (INR/sq ft)</label>
                    <input type="number" id="wallPrice" value="${room.pricing.wallPrice}" step="0.01" onchange="app.updatePricing('wallPrice', parseFloat(this.value) || 0)">
                </div>
                <div class="input-group">
                    <label for="ceilingPrice">Ceiling Area Price (INR/sq ft)</label>
                    <input type="number" id="ceilingPrice" value="${room.pricing.ceilingPrice}" step="0.01" onchange="app.updatePricing('ceilingPrice', parseFloat(this.value) || 0)">
                </div>
                <div class="input-group">
                    <label for="floorPrice">Floor Area Price (INR/sq ft)</label>
                    <input type="number" id="floorPrice" value="${room.pricing.floorPrice}" step="0.01" onchange="app.updatePricing('floorPrice', parseFloat(this.value) || 0)">
                </div>
                <div class="input-group">
                    <label for="doorPrice">Acoustic Door Price (INR/unit)</label>
                    <input type="number" id="doorPrice" value="${room.pricing.doorPrice}" step="0.01" onchange="app.updatePricing('doorPrice', parseFloat(this.value) || 0)">
                </div>
                <div class="input-group">
                    <label for="additionalPrice">Additional Area Price (INR/sq ft)</label>
                    <input type="number" id="additionalPrice" value="${room.pricing.additionalPrice}" step="0.01" onchange="app.updatePricing('additionalPrice', parseFloat(this.value) || 0)">
                </div>
            </div>
        `;
    }

    renderDeductions(deductions) {
        return deductions.map((deduction, index) => `
            <div class="deduction-item">
                <div class="input-group">
                    <label>Deduction Name</label>
                    <input type="text" value="${deduction.name}" onchange="app.updateDeduction(${index}, 'name', this.value)">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
                    <div class="input-group">
                        <label>Length (feet)</label>
                        <input type="number" value="${deduction.length}" step="0.1" onchange="app.updateDeduction(${index}, 'length', parseFloat(this.value) || 0)">
                    </div>
                    <div class="input-group">
                        <label>Height (feet)</label>
                        <input type="number" value="${deduction.height}" step="0.1" onchange="app.updateDeduction(${index}, 'height', parseFloat(this.value) || 0)">
                    </div>
                    <button class="btn btn-reset" onclick="app.removeDeduction(${index})" style="height: 45px;">Remove</button>
                </div>
            </div>
        `).join('');
    }

    renderAdditionalAreas(areas) {
        return areas.map((area, index) => `
            <div class="additional-area-item">
                <div class="input-group">
                    <label>Area Name</label>
                    <input type="text" value="${area.name}" onchange="app.updateAdditionalArea(${index}, 'name', this.value)">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
                    <div class="input-group">
                        <label>Length (feet)</label>
                        <input type="number" value="${area.length}" step="0.1" onchange="app.updateAdditionalArea(${index}, 'length', parseFloat(this.value) || 0)">
                    </div>
                    <div class="input-group">
                        <label>Height (feet)</label>
                        <input type="number" value="${area.height}" step="0.1" onchange="app.updateAdditionalArea(${index}, 'height', parseFloat(this.value) || 0)">
                    </div>
                    <button class="btn btn-reset" onclick="app.removeAdditionalArea(${index})" style="height: 45px;">Remove</button>
                </div>
            </div>
        `).join('');
    }

    updateRoomData(field, value) {
        this.rooms[this.currentRoomIndex][field] = value;
        if (field === 'name') {
            this.renderRoomTabs();
        }
    }

    updatePricing(field, value) {
        this.rooms[this.currentRoomIndex].pricing[field] = value;
    }

    addDeduction() {
        this.rooms[this.currentRoomIndex].deductions.push({
            name: 'Deduction',
            length: 0,
            height: 0
        });
        this.renderRoomForm();
    }

    updateDeduction(index, field, value) {
        this.rooms[this.currentRoomIndex].deductions[index][field] = value;
    }

    removeDeduction(index) {
        this.rooms[this.currentRoomIndex].deductions.splice(index, 1);
        this.renderRoomForm();
    }

    addAdditionalArea() {
        this.rooms[this.currentRoomIndex].additionalAreas.push({
            name: 'Additional Area',
            length: 0,
            height: 0
        });
        this.renderRoomForm();
    }

    updateAdditionalArea(index, field, value) {
        this.rooms[this.currentRoomIndex].additionalAreas[index][field] = value;
    }

    removeAdditionalArea(index) {
        this.rooms[this.currentRoomIndex].additionalAreas.splice(index, 1);
        this.renderRoomForm();
    }

    saveCurrentRoomData() {
        const projectName = document.getElementById('projectName').value;
        const clientName = document.getElementById('clientName').value;
        const location = document.getElementById('location').value;
        
        this.projectData = { name: projectName, client: clientName, location: location, notes: this.projectData.notes };
    }

    calculateRoomAreas(room) {
        const { length, width, height } = room;
        
        // Wall areas
        const wall1 = length * height;
        const wall2 = width * height;
        const wall3 = length * height;
        const wall4 = width * height;
        const grossWallArea = wall1 + wall2 + wall3 + wall4;
        
        // Deductions
        const totalDeductions = room.deductions.reduce((sum, deduction) => 
            sum + (deduction.length * deduction.height), 0);
        
        const netWallArea = grossWallArea - totalDeductions;
        
        // Additional areas
        const totalAdditionalArea = room.additionalAreas.reduce((sum, area) => 
            sum + (area.length * area.height), 0);
        
        // Ceiling and floor
        const ceilingArea = length * width;
        const floorArea = length * width;
        
        return {
            walls: { wall1, wall2, wall3, wall4, gross: grossWallArea, net: netWallArea },
            deductions: totalDeductions,
            additional: totalAdditionalArea,
            ceiling: ceilingArea,
            floor: floorArea,
            acousticDoors: room.acousticDoors
        };
    }

    calculatePricing(areas, pricing) {
        const wallCost = areas.walls.net * pricing.wallPrice;
        const ceilingCost = areas.ceiling * pricing.ceilingPrice;
        const floorCost = areas.floor * pricing.floorPrice;
        const doorCost = areas.acousticDoors * pricing.doorPrice;
        const additionalCost = areas.additional * pricing.additionalPrice;
        
        return {
            wall: wallCost,
            ceiling: ceilingCost,
            floor: floorCost,
            doors: doorCost,
            additional: additionalCost,
            total: wallCost + ceilingCost + floorCost + doorCost + additionalCost
        };
    }

    calculateAll() {
        this.saveCurrentRoomData();
        
        let roomResults = '';
        let totalProjectCost = 0;
        let totalWallArea = 0;
        let totalCeilingArea = 0;
        let totalFloorArea = 0;
        
        this.rooms.forEach((room, index) => {
            const areas = this.calculateRoomAreas(room);
            const costs = this.calculatePricing(areas, room.pricing);
            
            totalProjectCost += costs.total;
            totalWallArea += areas.walls.net;
            totalCeilingArea += areas.ceiling;
            totalFloorArea += areas.floor;
            
            roomResults += `
                <div class="room-result">
                    <h3>${room.name}</h3>
                    <div class="calculation-row">
                        <span>Length × Height (Wall 1 & 3):</span>
                        <span>${room.length} × ${room.height} = ${areas.walls.wall1.toFixed(2)} sq ft each</span>
                    </div>
                    <div class="calculation-row">
                        <span>Width × Height (Wall 2 & 4):</span>
                        <span>${room.width} × ${room.height} = ${areas.walls.wall2.toFixed(2)} sq ft each</span>
                    </div>
                    <div class="calculation-row">
                        <span>Gross Wall Area:</span>
                        <span>${areas.walls.gross.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Total Deductions:</span>
                        <span>${areas.deductions.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Net Wall Area:</span>
                        <span>${areas.walls.net.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Ceiling Area:</span>
                        <span>${areas.ceiling.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Floor Area:</span>
                        <span>${areas.floor.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Additional Areas:</span>
                        <span>${areas.additional.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Acoustic Doors:</span>
                        <span>${areas.acousticDoors} units</span>
                    </div>
                    <hr style="margin: 15px 0;">
                    <div class="calculation-row">
                        <span>Wall Cost:</span>
                        <span>${costs.wall > 0 ? '₹' + costs.wall.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Ceiling Cost:</span>
                        <span>${costs.ceiling > 0 ? '₹' + costs.ceiling.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Floor Cost:</span>
                        <span>${costs.floor > 0 ? '₹' + costs.floor.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Doors Cost:</span>
                        <span>${costs.doors > 0 ? '₹' + costs.doors.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Additional Areas Cost:</span>
                        <span>${costs.additional > 0 ? '₹' + costs.additional.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span><strong>Room Total:</strong></span>
                        <span><strong>₹${costs.total.toLocaleString('en-IN', {maximumFractionDigits: 2})}</strong></span>
                    </div>
                </div>
            `;
        });
        
        const projectSummary = `
            <h3>Project Summary</h3>
            <div class="calculation-row">
                <span>Project Name:</span>
                <span>${this.projectData.name || 'Untitled Project'}</span>
            </div>
            <div class="calculation-row">
                <span>Client:</span>
                <span>${this.projectData.client || 'N/A'}</span>
            </div>
            <div class="calculation-row">
                <span>Location:</span>
                <span>${this.projectData.location || 'N/A'}</span>
            </div>
            <div class="calculation-row">
                <span>Total Rooms:</span>
                <span>${this.rooms.length}</span>
            </div>
            <div class="calculation-row">
                <span>Total Wall Area:</span>
                <span>${totalWallArea.toFixed(2)} sq ft</span>
            </div>
            <div class="calculation-row">
                <span>Total Ceiling Area:</span>
                <span>${totalCeilingArea.toFixed(2)} sq ft</span>
            </div>
            <div class="calculation-row">
                <span>Total Floor Area:</span>
                <span>${totalFloorArea.toFixed(2)} sq ft</span>
            </div>
            <div class="calculation-row">
                <span><strong>TOTAL PROJECT COST:</strong></span>
                <span><strong>₹${totalProjectCost.toLocaleString('en-IN', {maximumFractionDigits: 2})}</strong></span>
            </div>
        `;
        
        document.getElementById('roomResults').innerHTML = roomResults;
        document.getElementById('projectSummary').innerHTML = projectSummary;
        
        this.showMessage('Calculations completed successfully!', 'success');
    }

    saveProject() {
        this.saveCurrentRoomData();
        
        const projectData = {
            ...this.projectData,
            rooms: this.rooms,
            savedAt: new Date().toISOString()
        };
        
        const savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
        const existingIndex = savedProjects.findIndex(p => p.name === projectData.name);
        
        if (existingIndex >= 0) {
            savedProjects[existingIndex] = projectData;
        } else {
            savedProjects.push(projectData);
        }
        
        localStorage.setItem('digicalProjects', JSON.stringify(savedProjects));
        this.showMessage('Project saved successfully!', 'success');
    }

    loadProject() {
        this.loadSavedProjects();
        document.getElementById('loadModal').style.display = 'block';
    }

    loadSavedProjects() {
        const savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
        const listContainer = document.getElementById('savedProjectsList');
        
        if (savedProjects.length === 0) {
            listContainer.innerHTML = '<p>No saved projects found.</p>';
            return;
        }
        
        listContainer.innerHTML = savedProjects.map((project, index) => `
            <div class="saved-project-item" onclick="app.loadSavedProject(${index})">
                <h4>${project.name || 'Untitled Project'}</h4>
                <p>Client: ${project.client || 'N/A'}</p>
                <p>Rooms: ${project.rooms?.length || 0}</p>
                <p>Saved: ${new Date(project.savedAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    }

    loadSavedProject(index) {
        const savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
        const project = savedProjects[index];
        
        if (project) {
            this.projectData = {
                name: project.name || '',
                client: project.client || '',
                location: project.location || '',
                notes: project.notes || ''
            };
            
            this.rooms = project.rooms || [];
            this.currentRoomIndex = 0;
            
            // Update form fields
            document.getElementById('projectName').value = this.projectData.name;
            document.getElementById('clientName').value = this.projectData.client;
            document.getElementById('location').value = this.projectData.location;
            
            this.renderRoomTabs();
            this.renderRoomForm();
            this.closeLoadModal();
            this.showMessage('Project loaded successfully!', 'success');
        }
    }

    closeLoadModal() {
        document.getElementById('loadModal').style.display = 'none';
    }

    toggleNotes() {
        const notesSection = document.getElementById('notesSection');
        const isVisible = notesSection.style.display !== 'none';
        notesSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            document.getElementById('projectNotes').value = this.projectData.notes;
        }
    }

    saveNotes() {
        this.projectData.notes = document.getElementById('projectNotes').value;
        this.closeNotes();
        this.showMessage('Notes saved!', 'success');
    }

    closeNotes() {
        document.getElementById('notesSection').style.display = 'none';
    }

    shareResults() {
        const resultsContent = this.generateShareContent();
        
        if (navigator.share) {
            navigator.share({
                title: 'DIGICAL Pro Results',
                text: resultsContent
            });
        } else {
            navigator.clipboard.writeText(resultsContent).then(() => {
                this.showMessage('Results copied to clipboard!', 'success');
            });
        }
    }

    generateShareContent() {
        this.saveCurrentRoomData();
        
        let content = `DIGICAL Pro Calculation Results\n`;
        content += `Powered by Digi Acoustics\n`;
        content += `${'='.repeat(50)}\n\n`;
        content += `Project: ${this.projectData.name || 'Untitled'}\n`;
        content += `Client: ${this.projectData.client || 'N/A'}\n`;
        content += `Location: ${this.projectData.location || 'N/A'}\n`;
        content += `${'='.repeat(50)}\n\n`;
        
        let totalCost = 0;
        
        this.rooms.forEach((room, index) => {
            const areas = this.calculateRoomAreas(room);
            const costs = this.calculatePricing(areas, room.pricing);
            totalCost += costs.total;
            
            content += `${room.name}:\n`;
            content += `- Net Wall Area: ${areas.walls.net.toFixed(2)} sq ft\n`;
            content += `- Ceiling Area: ${areas.ceiling.toFixed(2)} sq ft\n`;
            content += `- Floor Area: ${areas.floor.toFixed(2)} sq ft\n`;
            if (areas.additional > 0) {
                content += `- Additional Areas: ${areas.additional.toFixed(2)} sq ft\n`;
            }
            if (areas.acousticDoors > 0) {
                content += `- Acoustic Doors: ${areas.acousticDoors} units\n`;
            }
            content += `- Room Cost: ₹${costs.total.toLocaleString('en-IN')}\n`;
            content += `${'-'.repeat(30)}\n\n`;
        });
        
        content += `${'='.repeat(50)}\n`;
        content += `TOTAL PROJECT COST: ₹${totalCost.toLocaleString('en-IN')}\n`;
        content += `${'='.repeat(50)}\n\n`;
        
        if (this.projectData.notes) {
            content += `Notes: ${this.projectData.notes}\n\n`;
        }
        
        content += `${'='.repeat(50)}\n`;
        content += `Generated with DIGICAL Pro\n`;
        content += `Powered by Digi Acoustics\n`;
        content += `Date: ${new Date().toLocaleDateString('en-IN')}\n`;
        content += `Time: ${new Date().toLocaleTimeString('en-IN')}\n`;
        content += `${'='.repeat(50)}`;
        
        return content;
    }

    resetAll() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            this.rooms = [];
            this.currentRoomIndex = 0;
            this.projectData = { name: '', client: '', location: '', notes: '' };
            
            // Clear form fields
            document.getElementById('projectName').value = '';
            document.getElementById('clientName').value = '';
            document.getElementById('location').value = '';
            document.getElementById('roomResults').innerHTML = '';
            document.getElementById('projectSummary').innerHTML = '';
            
            this.addRoom(); // Add default room
            this.showMessage('All data has been reset!', 'success');
        }
    }

    takeScreenshot() {
        const element = document.getElementById('app-container');
        
        html2canvas(element, {
            allowTaint: true,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            width: element.scrollWidth,
            height: element.scrollHeight
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${this.projectData.name || 'DIGICAL_Pro'}_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL();
            link.click();
            this.showMessage('Screenshot saved!', 'success');
        });
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(84, 3, 30);
        doc.text('DIGICAL Pro Report', 20, 20);
        doc.setFontSize(12);
        doc.text('Powered by Digi Acoustics', 20, 30);
        
        let yPosition = 50;
        
        // Project Details
        doc.setFontSize(14);
        doc.text('Project Details:', 20, yPosition);
        yPosition += 10;
        doc.setFontSize(10);
        doc.text(`Project: ${this.projectData.name || 'Untitled'}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Client: ${this.projectData.client || 'N/A'}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Location: ${this.projectData.location || 'N/A'}`, 20, yPosition);
        yPosition += 15;
        
        // Room Results
        let totalCost = 0;
        this.rooms.forEach((room, index) => {
            const areas = this.calculateRoomAreas(room);
            const costs = this.calculatePricing(areas, room.pricing);
            totalCost += costs.total;
            
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(12);
            doc.text(room.name, 20, yPosition);
            yPosition += 10;
            doc.setFontSize(9);
            doc.text(`Net Wall Area: ${areas.walls.net.toFixed(2)} sq ft`, 20, yPosition);
            yPosition += 5;
            doc.text(`Ceiling Area: ${areas.ceiling.toFixed(2)} sq ft`, 20, yPosition);
            yPosition += 5;
            doc.text(`Floor Area: ${areas.floor.toFixed(2)} sq ft`, 20, yPosition);
            yPosition += 5;
            doc.text(`Room Cost: ₹${costs.total.toLocaleString('en-IN')}`, 20, yPosition);
            yPosition += 15;
        });
        
        // Total
        doc.setFontSize(14);
        doc.text(`Total Project Cost: ₹${totalCost.toLocaleString('en-IN')}`, 20, yPosition);
        yPosition += 15;
        
        // Footer
        doc.setFontSize(8);
        doc.text(`Generated with DIGICAL Pro`, 20, doc.internal.pageSize.height - 20);
        doc.text(`Powered by Digi Acoustics`, 20, doc.internal.pageSize.height - 15);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 20, doc.internal.pageSize.height - 10);
        
        doc.save(`${this.projectData.name || 'DIGICAL_Pro'}_Report.pdf`);
        this.showMessage('PDF exported successfully!', 'success');
    }

    showMessage(text, type) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Initialize the application
const app = new DigicalPro();

// Global functions for HTML onclick events
function addRoom() { app.addRoom(); }
function calculateAll() { app.calculateAll(); }
function saveProject() { app.saveProject(); }
function loadProject() { app.loadProject(); }
function toggleNotes() { app.toggleNotes(); }
function saveNotes() { app.saveNotes(); }
function closeNotes() { app.closeNotes(); }
function shareResults() { app.shareResults(); }
function resetAll() { app.resetAll(); }
function takeScreenshot() { app.takeScreenshot(); }
function exportPDF() { app.exportPDF(); }
function closeLoadModal() { app.closeLoadModal(); }
