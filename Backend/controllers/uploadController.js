const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// @desc    Upload photo without multer (alternative method)
// @route   POST /api/v1/auth/photo-simple
// @access  Private
exports.uploadPhotoSimple = async (req, res, next) => {
    try {
        console.log('📸 [uploadPhotoSimple] Starting simple photo upload...');
        console.log('📸 [uploadPhotoSimple] User ID:', req.user?._id);
        console.log('📸 [uploadPhotoSimple] Headers:', req.headers);
        
        // Check if we have the multipart boundary
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.log('❌ [uploadPhotoSimple] No multipart content-type');
            return res.status(400).json({ 
                success: false, 
                error: 'Content-Type must be multipart/form-data' 
            });
        }
        
        let rawData = '';
        let received = false;
        
        // Collect all data
        req.on('data', chunk => {
            rawData += chunk;
            received = true;
        });
        
        req.on('end', async () => {
            try {
                console.log('📸 [uploadPhotoSimple] Raw data length:', rawData.length);
                
                if (!received || rawData.length === 0) {
                    console.log('❌ [uploadPhotoSimple] No data received');
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Aucune donnée reçue' 
                    });
                }
                
                // Parse multipart data
                const boundary = contentType.split('boundary=')[1];
                if (!boundary) {
                    console.log('❌ [uploadPhotoSimple] No boundary found');
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Boundary non trouvé' 
                    });
                }
                
                const parts = rawData.split(`--${boundary}`);
                console.log('📸 [uploadPhotoSimple] Parts found:', parts.length);
                
                let fileData = null;
                let fileName = '';
                let mimeType = '';
                
                for (let i = 1; i < parts.length - 1; i++) {
                    const part = parts[i];
                    
                    if (part.includes('Content-Disposition: form-data')) {
                        const lines = part.split('\r\n');
                        
                        // Extract filename
                        const filenameMatch = lines.find(line => line.includes('filename="'));
                        if (filenameMatch) {
                            const filename = filenameMatch.split('filename="')[1].split('"')[0];
                            fileName = filename;
                            console.log('📸 [uploadPhotoSimple] Filename found:', fileName);
                        }
                        
                        // Extract mime type
                        const mimeMatch = lines.find(line => line.includes('Content-Type:'));
                        if (mimeMatch) {
                            mimeType = mimeMatch.split('Content-Type: ')[1].trim();
                            console.log('📸 [uploadPhotoSimple] MIME type:', mimeType);
                        }
                        
                        // Find empty line and extract file data
                        let emptyLineIndex = -1;
                        for (let j = 0; j < lines.length; j++) {
                            if (lines[j].trim() === '') {
                                emptyLineIndex = j;
                                break;
                            }
                        }
                        
                        if (emptyLineIndex !== -1 && emptyLineIndex < lines.length - 1) {
                            const fileLines = lines.slice(emptyLineIndex + 1);
                            // Remove the last line if it's just the boundary
                            const lastLine = fileLines[fileLines.length - 1];
                            if (lastLine.includes('--')) {
                                fileLines.pop();
                            }
                            
                            const fileContent = fileLines.join('\r\n');
                            fileData = Buffer.from(fileContent, 'binary');
                            console.log('📸 [uploadPhotoSimple] File data size:', fileData.length);
                        }
                        
                        break;
                    }
                }
                
                if (!fileData || !fileName) {
                    console.log('❌ [uploadPhotoSimple] No file data or filename found');
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Aucun fichier trouvé' 
                    });
                }
                
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                if (!allowedTypes.includes(mimeType)) {
                    console.log('❌ [uploadPhotoSimple] Invalid file type:', mimeType);
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Type de fichier non autorisé' 
                    });
                }
                
                // Validate file size (5MB max)
                if (fileData.length > 5 * 1024 * 1024) {
                    console.log('❌ [uploadPhotoSimple] File too large:', fileData.length);
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Fichier trop volumineux (max 5MB)' 
                    });
                }
                
                // Generate unique filename
                const timestamp = Date.now();
                const randomString = crypto.randomBytes(8).toString('hex');
                const ext = path.extname(fileName);
                const uniqueFileName = `user-${req.user._id}-${timestamp}-${randomString}${ext}`;
                
                // Save file
                const uploadPath = path.join('uploads/profile', uniqueFileName);
                await fs.writeFile(uploadPath, fileData);
                
                const photoUrl = `/uploads/profile/${uniqueFileName}`;
                console.log('✅ [uploadPhotoSimple] File saved:', photoUrl);
                
                // Update user in database
                const User = require('../models/User');
                const updatedUser = await User.findByIdAndUpdate(
                    req.user._id,
                    { photo: photoUrl },
                    { new: true }
                );
                
                console.log('✅ [uploadPhotoSimple] User updated successfully');
                
                res.status(200).json({
                    success: true,
                    data: photoUrl
                });
                
            } catch (parseError) {
                console.error('❌ [uploadPhotoSimple] Parse error:', parseError);
                res.status(500).json({ 
                    success: false, 
                    error: 'Erreur lors du traitement du fichier' 
                });
            }
        });
        
    } catch (err) {
        console.error('❌ [uploadPhotoSimple] Error:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
};
