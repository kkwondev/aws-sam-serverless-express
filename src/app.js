const express = require('express');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
app.use(express.json());

const key = process.env.KEY;
const iv = key.substr(16);

app.get('/', (req, res) => {
    res.send({ message: "정상" });
})

app.get('/image', (req, res) => {
    if (!req.query.hash) {
        res.send({ message: "hash 정보 없음." })
    } else {
        try {
            const hash = req.query.hash;
            const decipher = crypto.createDecipheriv("AES-256-CTR", key, iv);
            let decoded = decipher.update(hash, 'hex', 'utf-8');
            decoded += decipher.final('utf-8');

            if (!fs.existsSync('public/image')) {
                fs.mkdirSync('public/image', { recursive: true });
            }
            decoded = JSON.parse(decoded);
            const img_url_sha1 = crypto.createHash('sha1').update(decoded.image_url).digest('hex');
            res.send({ data: img_url_sha1 })
        } catch (e) {
            res.status(e.status || 500).json({
                status: e.status || 500,
                message: "Watermark 요청이 실패하였습니다.",
                e: e,
            })
        }
    }
})



// app.use('/image', imageController);
app.listen(3000, () => {
    console.log("Listening on port 3000");
});

module.exports = app;