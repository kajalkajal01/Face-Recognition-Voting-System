// Backend Simulation for Indian Election Voting System
class ElectionBackend {
    constructor() {
        this.initializeDefaultData();
    }

    initializeDefaultData() {
        // Initialize default candidates if not exists
        if (!localStorage.getItem('candidates')) {
            const defaultCandidates = [
                {
                    id: 'bjp-001',
                    name: 'Rajesh Kumar',
                    party: 'Bharatiya Janata Party (BJP)',
                    constituency: 'delhi-north',
                    symbol: '🪷',
                    votes: 0
                },
                {
                    id: 'inc-001',
                    name: 'Priya Sharma',
                    party: 'Indian National Congress (INC)',
                    constituency: 'delhi-north',
                    symbol: '✋',
                    votes: 0
                },
                {
                    id: 'aap-001',
                    name: 'Amit Singh',
                    party: 'Aam Aadmi Party (AAP)',
                    constituency: 'delhi-north',
                    symbol: '🧹',
                    votes: 0
                },
                {
                    id: 'bjp-002',
                    name: 'Sunita Devi',
                    party: 'Bharatiya Janata Party (BJP)',
                    constituency: 'delhi-south',
                    symbol: '🪷',
                    votes: 0
                },
                {
                    id: 'inc-002',
                    name: 'Mohammed Ali',
                    party: 'Indian National Congress (INC)',
                    constituency: 'delhi-south',
                    symbol: '✋',
                    votes: 0
                },
                {
                    id: 'aap-002',
                    name: 'Kavita Jain',
                    party: 'Aam Aadmi Party (AAP)',
                    constituency: 'delhi-south',
                    symbol: '🧹',
                    votes: 0
                },
                {
                    id: 'bjp-003',
                    name: 'Vikram Patel',
                    party: 'Bharatiya Janata Party (BJP)',
                    constituency: 'mumbai-central',
                    symbol: '🪷',
                    votes: 0
                },
                {
                    id: 'inc-003',
                    name: 'Anjali Desai',
                    party: 'Indian National Congress (INC)',
                    constituency: 'mumbai-central',
                    symbol: '✋',
                    votes: 0
                },
                {
                    id: 'ss-001',
                    name: 'Ravi Thackeray',
                    party: 'Shiv Sena (SS)',
                    constituency: 'mumbai-central',
                    symbol: '🏹',
                    votes: 0
                }
            ];
            localStorage.setItem('candidates', JSON.stringify(defaultCandidates));
        }

        // Initialize election settings
        if (!localStorage.getItem('electionSettings')) {
            const settings = {
                status: 'active',
                allowRegistrations: true,
                faceThreshold: 0.6,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            localStorage.setItem('electionSettings', JSON.stringify(settings));
        }

        // Initialize vote logs
        if (!localStorage.getItem('voteLogs')) {
            localStorage.setItem('voteLogs', JSON.stringify([]));
        }
    }

    getVoters() {
        return JSON.parse(localStorage.getItem('voters') || '[]');
    }

    getCandidates(constituency = null) {
        const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
        return constituency ? candidates.filter(c => c.constituency === constituency) : candidates;
    }

    getElectionSettings() {
        return JSON.parse(localStorage.getItem('electionSettings') || '{}');
    }

    castVote(voterAadhaar, candidateId) {
        try {
            // Get current data
            const voters = this.getVoters();
            const candidates = this.getCandidates();
            const voteLogs = JSON.parse(localStorage.getItem('voteLogs') || '[]');

            // Find voter and candidate
            const voter = voters.find(v => v.aadhaar === voterAadhaar);
            const candidate = candidates.find(c => c.id === candidateId);

            if (!voter) throw new Error('Voter not found');
            if (!candidate) throw new Error('Candidate not found');
            if (voter.hasVoted) throw new Error('Voter has already voted');

            // Update voter status
            voter.hasVoted = true;
            voter.voteDate = new Date().toISOString();

            // Update candidate votes
            candidate.votes += 1;

            // Log the vote
            voteLogs.push({
                id: Date.now().toString(),
                voterAadhaar: voterAadhaar,
                candidateId: candidateId,
                constituency: voter.constituency,
                timestamp: new Date().toISOString()
            });

            // Save updated data
            localStorage.setItem('voters', JSON.stringify(voters));
            localStorage.setItem('candidates', JSON.stringify(candidates));
            localStorage.setItem('voteLogs', JSON.stringify(voteLogs));

            return { success: true, message: 'Vote cast successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    getResults(constituency = null) {
        const candidates = this.getCandidates(constituency);
        const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

        return candidates.map(candidate => ({
            ...candidate,
            percentage: totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0
        })).sort((a, b) => b.votes - a.votes);
    }

    getStatistics() {
        const voters = this.getVoters();
        const candidates = this.getCandidates();
        const voteLogs = JSON.parse(localStorage.getItem('voteLogs') || '[]');

        const totalVoters = voters.length;
        const totalVotes = voteLogs.length;
        const turnout = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(1) : 0;

        // Find leading candidate
        const results = this.getResults();
        const leadingCandidate = results.length > 0 ? results[0] : null;

        return {
            totalVoters,
            totalVotes,
            turnout,
            leadingCandidate: leadingCandidate ? leadingCandidate.name : 'None'
        };
    }

    addCandidate(candidateData) {
        const candidates = this.getCandidates();
        const newCandidate = {
            id: `${candidateData.party.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            ...candidateData,
            votes: 0
        };
        candidates.push(newCandidate);
        localStorage.setItem('candidates', JSON.stringify(candidates));
        return newCandidate;
    }

    resetElection() {
        localStorage.removeItem('voters');
        localStorage.removeItem('voteLogs');
        const candidates = this.getCandidates();
        candidates.forEach(c => c.votes = 0);
        localStorage.setItem('candidates', JSON.stringify(candidates));
    }

    exportResults() {
        const data = {
            voters: this.getVoters(),
            candidates: this.getCandidates(),
            voteLogs: JSON.parse(localStorage.getItem('voteLogs') || '[]'),
            statistics: this.getStatistics(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `election-results-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Global backend instance
const electionBackend = new ElectionBackend();

// Voting functionality
function initializeVoting() {
    const authenticatedVoter = JSON.parse(sessionStorage.getItem('authenticatedVoter') || 'null');
    
    if (!authenticatedVoter) {
        alert('Please authenticate first');
        window.location.href = 'login.html';
        return;
    }

    // Display voter info
    document.getElementById('voterNameDisplay').textContent = authenticatedVoter.fullName;
    document.getElementById('voterConstituency').textContent = authenticatedVoter.constituency;
    document.getElementById('voterAadhaar').textContent = authenticatedVoter.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');

    // Load candidates for voter's constituency
    const candidates = electionBackend.getCandidates(authenticatedVoter.constituency);
    const candidatesGrid = document.getElementById('candidatesGrid');
    
    candidatesGrid.innerHTML = '';
    candidates.forEach(candidate => {
        const candidateCard = document.createElement('div');
        candidateCard.className = 'candidate-card';
        candidateCard.dataset.candidateId = candidate.id;
        
        candidateCard.innerHTML = `
            <div class="candidate-photo">${candidate.symbol}</div>
            <div class="candidate-name">${candidate.name}</div>
            <div class="candidate-party">${candidate.party}</div>
        `;
        
        candidateCard.addEventListener('click', function() {
            // Remove previous selection
            document.querySelectorAll('.candidate-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Select this candidate
            this.classList.add('selected');
            document.getElementById('confirmVote').disabled = false;
        });
        
        candidatesGrid.appendChild(candidateCard);
    });

    // Confirm vote button
    document.getElementById('confirmVote').addEventListener('click', function() {
        const selectedCard = document.querySelector('.candidate-card.selected');
        if (!selectedCard) return;
        
        const candidateId = selectedCard.dataset.candidateId;
        const candidate = candidates.find(c => c.id === candidateId);
        
        // Show confirmation modal
        document.getElementById('selectedCandidateInfo').innerHTML = `
            <div class="selected-candidate">
                <div class="candidate-photo">${candidate.symbol}</div>
                <div>
                    <div class="candidate-name">${candidate.name}</div>
                    <div class="candidate-party">${candidate.party}</div>
                </div>
            </div>
        `;
        
        document.getElementById('confirmModal').style.display = 'flex';
    });

    // Final submit
    document.getElementById('finalSubmit').addEventListener('click', function() {
        const selectedCard = document.querySelector('.candidate-card.selected');
        const candidateId = selectedCard.dataset.candidateId;
        
        document.getElementById('confirmModal').style.display = 'none';
        document.getElementById('loadingModal').style.display = 'flex';
        
        // Simulate vote submission
        setTimeout(() => {
            const result = electionBackend.castVote(authenticatedVoter.aadhaar, candidateId);
            
            document.getElementById('loadingModal').style.display = 'none';
            
            if (result.success) {
                document.getElementById('successModal').style.display = 'flex';
                sessionStorage.removeItem('authenticatedVoter');
            } else {
                alert('Error: ' + result.message);
            }
        }, 2000);
    });

    // Modal actions
    document.getElementById('cancelConfirm').addEventListener('click', function() {
        document.getElementById('confirmModal').style.display = 'none';
    });

    document.getElementById('cancelVote').addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    document.getElementById('viewResults').addEventListener('click', function() {
        window.location.href = 'results.html';
    });

    document.getElementById('goHome').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}

// Results functionality
function initializeResults() {
    updateResults();
    
    // Constituency filter
    document.getElementById('constituencySelect').addEventListener('change', function() {
        updateResults(this.value === 'all' ? null : this.value);
    });
}

function updateResults(constituency = null) {
    const results = electionBackend.getResults(constituency);
    const statistics = electionBackend.getStatistics();
    
    // Update summary
    document.getElementById('totalVotes').textContent = statistics.totalVotes;
    document.getElementById('totalVoters').textContent = statistics.totalVoters;
    document.getElementById('turnoutPercentage').textContent = statistics.turnout + '%';
    document.getElementById('leadingCandidate').textContent = statistics.leadingCandidate;
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    
    // Update results grid
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '';
    
    results.forEach((candidate, index) => {
        const resultCard = document.createElement('div');
        resultCard.className = `result-card ${index === 0 && candidate.votes > 0 ? 'winner' : ''}`;
        
        resultCard.innerHTML = `
            <div class="candidate-photo">${candidate.symbol}</div>
            <div class="candidate-name">${candidate.name}</div>
            <div class="candidate-party">${candidate.party}</div>
            <div class="result-votes">${candidate.votes}</div>
            <div class="result-percentage">${candidate.percentage}%</div>
            <div class="vote-bar">
                <div class="vote-fill" style="width: ${candidate.percentage}%"></div>
            </div>
        `;
        
        resultsGrid.appendChild(resultCard);
    });
    
    // Update constituency results
    updateConstituencyResults();
    
    // Update charts
    updateCharts(results);
}

function updateConstituencyResults() {
    const constituencies = ['delhi-north', 'delhi-south', 'mumbai-central', 'mumbai-north', 
                           'bangalore-central', 'bangalore-north', 'chennai-central', 'kolkata-north'];
    
    const constituencyResults = document.getElementById('constituencyResults');
    constituencyResults.innerHTML = '';
    
    constituencies.forEach(constituency => {
        const results = electionBackend.getResults(constituency);
        const totalVotes = results.reduce((sum, c) => sum + c.votes, 0);
        
        if (totalVotes > 0) {
            const winner = results[0];
            
            const constituencyCard = document.createElement('div');
            constituencyCard.className = 'result-card';
            constituencyCard.innerHTML = `
                <h4>${constituency.replace('-', ' ').toUpperCase()}</h4>
                <div class="candidate-name">${winner.name}</div>
                <div class="candidate-party">${winner.party}</div>
                <div class="result-votes">${totalVotes} total votes</div>
            `;
            
            constituencyResults.appendChild(constituencyCard);
        }
    });
}

function updateCharts(results) {
    // Simple canvas-based charts (placeholder for actual chart library)
    const pieCanvas = document.getElementById('pieChart');
    const barCanvas = document.getElementById('barChart');
    
    if (pieCanvas && barCanvas) {
        drawPieChart(pieCanvas, results);
        drawBarChart(barCanvas, results);
    }
}

function drawPieChart(canvas, results) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const totalVotes = results.reduce((sum, c) => sum + c.votes, 0);
    if (totalVotes === 0) return;
    
    let currentAngle = 0;
    const colors = ['#667eea', '#f093fb', '#4facfe', '#ff6b6b', '#27ae60', '#f39c12'];
    
    results.forEach((candidate, index) => {
        const sliceAngle = (candidate.votes / totalVotes) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}

function drawBarChart(canvas, results) {
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.length === 0) return;
    
    const maxVotes = Math.max(...results.map(r => r.votes), 1);
    const barWidth = chartWidth / results.length;
    
    results.forEach((candidate, index) => {
        const barHeight = (candidate.votes / maxVotes) * chartHeight;
        const x = padding + index * barWidth;
        const y = canvas.height - padding - barHeight;
        
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
        
        // Draw candidate name
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(candidate.name.split(' ')[0], x + barWidth / 2, canvas.height - 10);
    });
}

// Admin functionality
function initializeAdmin() {
    const adminPassword = document.getElementById('adminPassword');
    const adminLogin = document.getElementById('adminLogin');
    const adminAuth = document.getElementById('adminAuth');
    const adminContent = document.getElementById('adminContent');
    
    // Admin login
    adminLogin.addEventListener('click', function() {
        if (adminPassword.value === 'admin123') {
            adminAuth.style.display = 'none';
            adminContent.style.display = 'block';
            loadAdminData();
        } else {
            alert('Invalid admin password');
        }
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName).classList.add('active');
            
            // Load specific tab data
            if (tabName === 'voters') loadVotersData();
            if (tabName === 'candidates') loadCandidatesData();
        });
    });
    
    // Admin actions
    document.getElementById('resetElection').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all election data? This cannot be undone.')) {
            electionBackend.resetElection();
            alert('Election data has been reset');
            loadAdminData();
        }
    });
    
    document.getElementById('exportResults').addEventListener('click', function() {
        electionBackend.exportResults();
    });
    
    document.getElementById('generateReport').addEventListener('click', function() {
        generateElectionReport();
    });
    
    // Add candidate
    document.getElementById('addCandidate').addEventListener('click', function() {
        const name = document.getElementById('candidateName').value;
        const party = document.getElementById('candidateParty').value;
        const constituency = document.getElementById('candidateConstituency').value;
        
        if (!name || !party || !constituency) {
            alert('Please fill all candidate details');
            return;
        }
        
        const candidateData = {
            name: name,
            party: party,
            constituency: constituency,
            symbol: getPartySymbol(party)
        };
        
        electionBackend.addCandidate(candidateData);
        alert('Candidate added successfully');
        
        // Clear form
        document.getElementById('candidateName').value = '';
        document.getElementById('candidateParty').value = '';
        document.getElementById('candidateConstituency').value = '';
        
        loadCandidatesData();
    });
    
    // Search voter
    document.getElementById('searchVoter').addEventListener('click', function() {
        const query = document.getElementById('voterSearch').value.toLowerCase();
        const voters = electionBackend.getVoters();
        const filteredVoters = voters.filter(v => 
            v.aadhaar.includes(query) || v.fullName.toLowerCase().includes(query)
        );
        displayVoters(filteredVoters);
    });
    
    // Settings
    document.getElementById('faceThreshold').addEventListener('input', function() {
        document.getElementById('thresholdValue').textContent = this.value;
    });
    
    document.getElementById('saveSettings').addEventListener('click', function() {
        const settings = {
            status: document.getElementById('electionStatus').value,
            allowRegistrations: document.getElementById('allowRegistrations').checked,
            faceThreshold: parseFloat(document.getElementById('faceThreshold').value)
        };
        
        localStorage.setItem('electionSettings', JSON.stringify(settings));
        alert('Settings saved successfully');
    });
}

function loadAdminData() {
    const statistics = electionBackend.getStatistics();
    
    document.getElementById('adminTotalVoters').textContent = statistics.totalVoters;
    document.getElementById('adminVotesCast').textContent = statistics.totalVotes;
    document.getElementById('adminConstituencies').textContent = '8';
    
    loadVotersData();
}

function loadVotersData() {
    const voters = electionBackend.getVoters();
    displayVoters(voters);
}

function displayVoters(voters) {
    const tbody = document.getElementById('votersTableBody');
    tbody.innerHTML = '';
    
    voters.forEach(voter => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${voter.aadhaar}</td>
            <td>${voter.fullName}</td>
            <td>${voter.age}</td>
            <td>${voter.constituency}</td>
            <td>${voter.hasVoted ? '✅ Voted' : '⏳ Not Voted'}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewVoter('${voter.aadhaar}')">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadCandidatesData() {
    const candidates = electionBackend.getCandidates();
    const candidatesList = document.getElementById('candidatesList');
    
    candidatesList.innerHTML = '';
    
    candidates.forEach(candidate => {
        const candidateCard = document.createElement('div');
        candidateCard.className = 'candidate-card';
        candidateCard.innerHTML = `
            <div class="candidate-photo">${candidate.symbol}</div>
            <div class="candidate-name">${candidate.name}</div>
            <div class="candidate-party">${candidate.party}</div>
            <div class="candidate-constituency">${candidate.constituency}</div>
            <div class="candidate-votes">Votes: ${candidate.votes}</div>
        `;
        candidatesList.appendChild(candidateCard);
    });
}

function getPartySymbol(party) {
    const symbols = {
        'Bharatiya Janata Party (BJP)': '🪷',
        'Indian National Congress (INC)': '✋',
        'Aam Aadmi Party (AAP)': '🧹',
        'Shiv Sena (SS)': '🏹',
        'Trinamool Congress': '🌸',
        'Communist Party': '⚒️'
    };
    return symbols[party] || '🗳️';
}

function viewVoter(aadhaar) {
    const voters = electionBackend.getVoters();
    const voter = voters.find(v => v.aadhaar === aadhaar);
    if (voter) {
        alert(`Voter Details:\nName: ${voter.fullName}\nAge: ${voter.age}\nConstituency: ${voter.constituency}\nStatus: ${voter.hasVoted ? 'Voted' : 'Not Voted'}`);
    }
}

function generateElectionReport() {
    const statistics = electionBackend.getStatistics();
    const results = electionBackend.getResults();
    
    let report = `ELECTION REPORT\n`;
    report += `Generated on: ${new Date().toLocaleString()}\n\n`;
    report += `STATISTICS:\n`;
    report += `Total Registered Voters: ${statistics.totalVoters}\n`;
    report += `Total Votes Cast: ${statistics.totalVotes}\n`;
    report += `Voter Turnout: ${statistics.turnout}%\n`;
    report += `Leading Candidate: ${statistics.leadingCandidate}\n\n`;
    report += `RESULTS:\n`;
    
    results.forEach((candidate, index) => {
        report += `${index + 1}. ${candidate.name} (${candidate.party}): ${candidate.votes} votes (${candidate.percentage}%)\n`;
    });
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `election-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}