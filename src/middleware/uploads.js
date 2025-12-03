import multer from "multer";

const upload = multer({ dest: 'storage/' });

function store(Server) {
    Server.post('/storage', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        res.send(`File ${req.file.originalname} uploaded successfully.`);
    });
}

export default store;