// Face Recognition Utilities using face-api.js
class FaceRecognition {
    constructor() {
        this.isModelLoaded = false;
        this.faceDescriptor = null;
        this.video = null;
        this.canvas = null;
        this.stream = null;
    }

    async loadModels() {
        try {
            console.log('Loading face recognition models...');
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
            await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
            await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
            this.isModelLoaded = true;
            console.log('Face recognition models loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading face recognition models:', error);
            // Fallback: simulate model loading for demo purposes
            this.isModelLoaded = true;
            return true;
        }
    }

    async startCamera(videoElement) {
        try {
            this.video = videoElement;
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            });
            this.video.srcObject = this.stream;
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Camera access denied. Please allow camera permissions.');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    async captureAndAnalyzeFace(videoElement, canvasElement) {
        try {
            if (!this.isModelLoaded) {
                await this.loadModels();
            }

            const canvas = canvasElement;
            const video = videoElement;
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Simulate face detection for demo purposes
            // In a real implementation, this would use face-api.js
            const faceDetected = Math.random() > 0.2; // 80% success rate for demo
            
            if (faceDetected) {
                // Generate a simulated face descriptor
                const descriptor = this.generateSimulatedDescriptor();
                
                return {
                    success: true,
                    descriptor: descriptor,
                    imageData: canvas.toDataURL('image/jpeg', 0.8),
                    confidence: 0.85 + Math.random() * 0.1
                };
            } else {
                throw new Error('No face detected. Please ensure your face is clearly visible.');
            }
        } catch (error) {
            console.error('Error in face analysis:', error);
            throw error;
        }
    }

    async compareFaces(descriptor1, descriptor2) {
        try {
            // Simulate face comparison
            // In a real implementation, this would use face-api.js distance calculation
            const similarity = 0.7 + Math.random() * 0.2; // Simulate 70-90% similarity
            const threshold = 0.6;
            
            return {
                similarity: similarity,
                isMatch: similarity > threshold,
                confidence: similarity
            };
        } catch (error) {
            console.error('Error comparing faces:', error);
            return {
                similarity: 0,
                isMatch: false,
                confidence: 0
            };
        }
    }

    generateSimulatedDescriptor() {
        // Generate a simulated 128-dimensional face descriptor
        const descriptor = new Float32Array(128);
        for (let i = 0; i < 128; i++) {
            descriptor[i] = Math.random() * 2 - 1; // Random values between -1 and 1
        }
        return Array.from(descriptor);
    }

    async detectFaceInRealTime(videoElement, onFaceDetected, onNoFace) {
        if (!this.isModelLoaded) {
            await this.loadModels();
        }

        const detectFace = async () => {
            try {
                // Simulate real-time face detection
                const faceDetected = Math.random() > 0.3; // 70% detection rate
                
                if (faceDetected) {
                    const confidence = 0.8 + Math.random() * 0.15;
                    onFaceDetected(confidence);
                } else {
                    onNoFace();
                }
            } catch (error) {
                console.error('Real-time detection error:', error);
                onNoFace();
            }
        };

        // Run detection every 500ms
        return setInterval(detectFace, 500);
    }
}

// Global face recognition instance
const faceRecognition = new FaceRecognition();

// Registration functionality
async function initializeRegistration() {
    const form = document.getElementById('registrationForm');
    const aadhaarInput = document.getElementById('aadhaar');
    const startCameraBtn = document.getElementById('startCamera');
    const captureBtn = document.getElementById('capturePhoto');
    const retakeBtn = document.getElementById('retakePhoto');
    const registerBtn = document.getElementById('registerBtn');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    let capturedFaceData = null;

    // Aadhaar validation
    aadhaarInput.addEventListener('input', function() {
        const aadhaar = this.value.replace(/\D/g, '');
        this.value = aadhaar;
        
        const validation = document.getElementById('aadhaarValidation');
        if (aadhaar.length === 12) {
            validation.textContent = '✓ Valid Aadhaar number';
            validation.style.color = '#27ae60';
        } else if (aadhaar.length > 0) {
            validation.textContent = 'Aadhaar number must be 12 digits';
            validation.style.color = '#e74c3c';
        } else {
            validation.textContent = '';
        }
    });

    // Start camera
    startCameraBtn.addEventListener('click', async function() {
        try {
            await faceRecognition.startCamera(video);
            this.disabled = true;
            captureBtn.disabled = false;
            this.textContent = 'Camera Active';
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // Capture photo
    captureBtn.addEventListener('click', async function() {
        try {
            const result = await faceRecognition.captureAndAnalyzeFace(video, canvas);
            
            if (result.success) {
                capturedFaceData = result;
                
                // Show captured image
                const previewImg = document.getElementById('previewImage');
                previewImg.src = result.imageData;
                document.getElementById('capturedImage').style.display = 'block';
                
                // Update buttons
                captureBtn.style.display = 'none';
                retakeBtn.style.display = 'inline-block';
                registerBtn.disabled = false;
                
                faceRecognition.stopCamera();
            }
        } catch (error) {
            alert('Error capturing face: ' + error.message);
        }
    });

    // Retake photo
    retakeBtn.addEventListener('click', async function() {
        try {
            await faceRecognition.startCamera(video);
            document.getElementById('capturedImage').style.display = 'none';
            captureBtn.style.display = 'inline-block';
            this.style.display = 'none';
            registerBtn.disabled = true;
            capturedFaceData = null;
        } catch (error) {
            alert('Error restarting camera: ' + error.message);
        }
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!capturedFaceData) {
            alert('Please capture your face first');
            return;
        }

        const formData = new FormData(form);
        const voterData = {
            aadhaar: formData.get('aadhaar'),
            fullName: formData.get('fullName'),
            age: formData.get('age'),
            constituency: formData.get('constituency'),
            faceDescriptor: capturedFaceData.descriptor,
            faceImage: capturedFaceData.imageData,
            registrationDate: new Date().toISOString(),
            hasVoted: false
        };

        // Show loading
        document.getElementById('loadingModal').style.display = 'flex';

        try {
            // Simulate registration process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Save to localStorage (simulating database)
            const voters = JSON.parse(localStorage.getItem('voters') || '[]');
            
            // Check if already registered
            if (voters.find(v => v.aadhaar === voterData.aadhaar)) {
                throw new Error('Voter with this Aadhaar number is already registered');
            }
            
            voters.push(voterData);
            localStorage.setItem('voters', JSON.stringify(voters));
            
            document.getElementById('loadingModal').style.display = 'none';
            alert('Registration successful! You can now proceed to vote.');
            window.location.href = 'login.html';
            
        } catch (error) {
            document.getElementById('loadingModal').style.display = 'none';
            alert('Registration failed: ' + error.message);
        }
    });
}

// Login functionality
async function initializeLogin() {
    const verifyBtn = document.getElementById('verifyAadhaar');
    const startAuthBtn = document.getElementById('startFaceAuth');
    const proceedBtn = document.getElementById('proceedToVote');
    const aadhaarInput = document.getElementById('loginAadhaar');
    const video = document.getElementById('loginVideo');
    
    let currentVoter = null;
    let authInterval = null;

    // Verify Aadhaar
    verifyBtn.addEventListener('click', function() {
        const aadhaar = aadhaarInput.value.trim();
        
        if (aadhaar.length !== 12) {
            document.getElementById('aadhaarError').textContent = 'Please enter a valid 12-digit Aadhaar number';
            return;
        }

        const voters = JSON.parse(localStorage.getItem('voters') || '[]');
        currentVoter = voters.find(v => v.aadhaar === aadhaar);
        
        if (!currentVoter) {
            document.getElementById('aadhaarError').textContent = 'Aadhaar number not found. Please register first.';
            return;
        }

        if (currentVoter.hasVoted) {
            document.getElementById('aadhaarError').textContent = 'You have already voted in this election.';
            return;
        }

        // Move to step 2
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        document.getElementById('aadhaarError').textContent = '';
    });

    // Start face authentication
    startAuthBtn.addEventListener('click', async function() {
        try {
            await faceRecognition.startCamera(video);
            this.disabled = true;
            document.getElementById('authProgress').style.display = 'block';
            
            // Start real-time face detection
            authInterval = await faceRecognition.detectFaceInRealTime(
                video,
                (confidence) => {
                    document.getElementById('authStatus').innerHTML = 
                        `<span style="color: #27ae60;">Face detected (${Math.round(confidence * 100)}%)</span>`;
                },
                () => {
                    document.getElementById('authStatus').innerHTML = 
                        '<span style="color: #e74c3c;">No face detected</span>';
                }
            );

            // Simulate authentication process
            setTimeout(async () => {
                try {
                    const result = await faceRecognition.captureAndAnalyzeFace(video, document.createElement('canvas'));
                    const comparison = await faceRecognition.compareFaces(currentVoter.faceDescriptor, result.descriptor);
                    
                    clearInterval(authInterval);
                    faceRecognition.stopCamera();
                    
                    if (comparison.isMatch) {
                        // Authentication successful
                        document.getElementById('step2').classList.remove('active');
                        document.getElementById('step3').classList.add('active');
                        document.getElementById('voterName').textContent = currentVoter.fullName;
                        
                        // Store authenticated voter
                        sessionStorage.setItem('authenticatedVoter', JSON.stringify(currentVoter));
                    } else {
                        throw new Error('Face authentication failed. Please try again.');
                    }
                } catch (error) {
                    document.getElementById('authStatus').innerHTML = 
                        `<span style="color: #e74c3c;">${error.message}</span>`;
                    startAuthBtn.disabled = false;
                }
            }, 3000);
            
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // Proceed to vote
    proceedBtn.addEventListener('click', function() {
        window.location.href = 'vote.html';
    });
}