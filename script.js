    // API URL - Replace with your actual deployed Google Apps Script web app URL
    const apiUrl = "https://script.google.com/macros/s/AKfycbyTZ5WqpzCRh1S8GGyz6nUbM44C-SzZK9l6SBAYvYZFsQkOTLSZG1evcyo1NdOrlB-e/exec";
    
    // DOM elements
    const trainerIdInput = document.getElementById('trainerId');
    const loginBtn = document.getElementById('loginBtn');
    const clearBtn = document.getElementById('clearBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const errorDiv = document.getElementById('errorMessage');
    const loginContainer = document.getElementById('loginContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const loadingContainer = document.getElementById('loadingContainer');
    const sessionsContainer = document.getElementById('sessionsContainer');
    const dateFilterSelect = document.getElementById('dateFilter');
    const applyFilterBtn = document.getElementById('applyFilter');
    const resetFilterBtn = document.getElementById('resetFilter');
    
    // Store all sessions for filtering
    let allSessions = [];
    
    // Event listeners
    loginBtn.addEventListener('click', loginTrainer);
    clearBtn.addEventListener('click', clearForm);
    logoutBtn.addEventListener('click', logout);
    applyFilterBtn.addEventListener('click', applyDateFilter);
    resetFilterBtn.addEventListener('click', resetDateFilter);
    
    trainerIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loginTrainer();
    });
    
    // Clear form inputs
    function clearForm() {
        trainerIdInput.value = '';
        errorDiv.style.display = 'none';
    }
    
    // Logout function
    function logout() {
        dashboardContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        clearForm();
    }
    
    // Validate trainer ID
    function validateTrainerId(id) {
        // Remove leading/trailing spaces and convert to uppercase
        id = id.trim().toUpperCase();
        
        // Check if empty
        if (!id) {
            return { valid: false, message: "Please enter your Trainer ID" };
        }
        
        return { valid: true, value: id };
    }
    
    // Show error message
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    // Group sessions by date
    function groupSessionsByDate(sessions) {
        const groupedSessions = {};
        
        sessions.forEach(session => {
            if (!groupedSessions[session.date]) {
                groupedSessions[session.date] = [];
            }
            groupedSessions[session.date].push(session);
        });
        
        return groupedSessions;
    }
    
// Create session card element
function createSessionCard(session) {
    const sessionBox = document.createElement('div');
    sessionBox.className = 'info-box';
    
    // Create session title with timing
    const timing = session.timing || "All Day";
    const sessionTitle = document.createElement('h2');
    sessionTitle.className = 'info-section-title';
    sessionTitle.innerHTML = `Training Details<br><span style="font-size: smaller;">Session ${session.session} (${timing})</span>`;
    sessionBox.appendChild(sessionTitle);
    
    // Create information rows
    const infoRows = [
        { label: "Training Date", value: session.date },
        { label: "Training Topic", value: session.topic },
        { label: "Venue", value: session.venue },
        { label: "Student Count", value: session.studentCount }
    ];
    
    infoRows.forEach(info => {
        const row = document.createElement('div');
        row.className = 'info-row';
        
        const label = document.createElement('div');
        label.className = 'info-label';
        label.textContent = info.label;
        
        const value = document.createElement('div');
        value.className = 'info-value';
        value.textContent = info.value || "-";
        
        row.appendChild(label);
        row.appendChild(value);
        sessionBox.appendChild(row);
    });
    
    // Create departments row
    const deptRow = document.createElement('div');
    deptRow.className = 'info-row';
    
    const deptLabel = document.createElement('div');
    deptLabel.className = 'info-label';
    deptLabel.textContent = "Departments";
    
    const deptValue = document.createElement('div');
    deptValue.className = 'info-value';
    
    const deptList = document.createElement('div');
    deptList.className = 'department-list';
    
    // Add department badges
    if (session.departments && session.departments.length > 0) {
        session.departments.forEach(dept => {
            const badge = document.createElement('span');
            badge.className = 'department-badge';
            badge.textContent = dept;
            deptList.appendChild(badge);
        });
    } else {
        deptList.textContent = "No departments specified";
    }
    
    deptValue.appendChild(deptList);
    deptRow.appendChild(deptLabel);
    deptRow.appendChild(deptValue);
    sessionBox.appendChild(deptRow);
    
    // Create materials section
    if (session.pptLink) {
        const materialSection = document.createElement('div');
        materialSection.className = 'material-section';
        
        const materialLabel = document.createElement('div');
        materialLabel.className = 'info-label';
        materialLabel.textContent = "Training Materials";
        
        const materialValue = document.createElement('div');
        materialValue.className = 'info-value';
        
        const pptLink = document.createElement('a');
        pptLink.className = 'ppt-link';
        pptLink.href = session.pptLink;
        pptLink.target = "_blank";
        pptLink.textContent = "Download Presentation";
        
        materialValue.appendChild(pptLink);
        materialSection.appendChild(materialLabel);
        materialSection.appendChild(materialValue);
        sessionBox.appendChild(materialSection);
    }
    
    return sessionBox;
}
    
    // Populate date filter dropdown
    function populateDateFilter(sessions) {
        // Clear any existing options except the first one
        while (dateFilterSelect.options.length > 1) {
            dateFilterSelect.remove(1);
        }
        
        // Extract unique dates
        const uniqueDates = [...new Set(sessions.map(session => session.date))].sort();
        
        // Add date options to select
        uniqueDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateFilterSelect.appendChild(option);
        });
    }
    
    // Apply date filter
    function applyDateFilter() {
        const selectedDate = dateFilterSelect.value;
        
        if (selectedDate) {
            // Filter sessions by selected date
            const filteredSessions = allSessions.filter(session => session.date === selectedDate);
            renderSessions(filteredSessions);
        } else {
            // If no date selected, show all sessions
            renderSessions(allSessions);
        }
    }
    
    // Reset date filter
    function resetDateFilter() {
        dateFilterSelect.value = "";
        renderSessions(allSessions);
    }
    
    // Render all sessions
    function renderSessions(sessions) {
        // Clear previous sessions
        sessionsContainer.innerHTML = '';
        
        if (sessions.length === 0) {
            const noSessionsMsg = document.createElement('div');
            noSessionsMsg.className = 'no-sessions-message';
            noSessionsMsg.textContent = 'No sessions found for the selected criteria.';
            sessionsContainer.appendChild(noSessionsMsg);
            return;
        }
        
        // Group sessions by date
        const groupedSessions = groupSessionsByDate(sessions);
        
        // Sort dates
        const sortedDates = Object.keys(groupedSessions).sort();
        
        // Render sessions for each date
        sortedDates.forEach(date => {
            // Create date header
            const dateHeader = document.createElement('div');
            dateHeader.className = 'session-date-header';
            dateHeader.textContent = `Sessions for ${date}`;
            sessionsContainer.appendChild(dateHeader);
            
            // Sort sessions by session number
            const sortedSessions = groupedSessions[date].sort((a, b) => {
                return parseInt(a.session) - parseInt(b.session);
            });
            
            // Add each session card
            sortedSessions.forEach(session => {
                const sessionCard = createSessionCard(session);
                sessionsContainer.appendChild(sessionCard);
            });
        });
    }
    
    // Login function
    function loginTrainer() {
        const trainerIdResult = validateTrainerId(trainerIdInput.value);
        
        // Reset UI states
        errorDiv.style.display = 'none';
        
        // Validate trainer ID
        if (!trainerIdResult.valid) {
            showError(trainerIdResult.message);
            return;
        }
        
        // Show loading state
        loadingContainer.style.display = 'block';
        loginContainer.style.display = 'none';
        
        // Fetch data from the Google Apps Script API
        fetch(`${apiUrl}?trainerId=${trainerIdResult.value}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                try {
                    // Try to parse as JSON
                    const data = JSON.parse(text);
                    return data;
                } catch (e) {
                    // If can't parse as JSON, handle as text response
                    if (text === "undefined" || text.includes("Error") || text.trim() === "") {
                        throw new Error("Invalid data received from server");
                    }
                    try {
                        // Sometimes API might return weird formatting
                        return JSON.parse(text.replace(/[\n\r]/g, ''));
                    } catch (e2) {
                        throw new Error("Unable to process data from server");
                    }
                }
            })
            .then(data => {
                loadingContainer.style.display = 'none';
                
                if (!data || !data.success) {
                    showError(data.error || "Invalid trainer credentials");
                    loginContainer.style.display = 'block';
                    return;
                }
                
                // Store all sessions for later filtering
                allSessions = data.sessions;
                
                // Update trainer info in banner
                document.getElementById('trainerNameBanner').textContent = `Welcome, ${data.trainerName}`;
                document.getElementById('trainerCompanyBanner').textContent = data.vendorName || "SEED Training Program";
                
                // Update session count statistic
                document.getElementById('sessionCount').textContent = data.sessions.length;
                
                // Populate date filter dropdown
                populateDateFilter(data.sessions);
                
                // Render all sessions
                renderSessions(data.sessions);
                
                // Show dashboard
                dashboardContainer.style.display = 'block';
            })
            .catch(error => {
                loadingContainer.style.display = 'none';
                showError("Error: " + error.message);
                loginContainer.style.display = 'block';
            });
    }
