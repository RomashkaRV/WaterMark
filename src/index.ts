import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import archiver from "archiver";

const app = express();
const port = process.env.PORT || 3000; // Порт из переменных окружения

// Настройки сервера
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Настройка загрузки файлов
const upload = multer({ dest: "uploads/" });
const watermarkPath = path.resolve("assets", "watermark.png");
const processedDir = "processed";

if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir);
}

// Обработчик для загрузки и обработки изображений
app.post("/process-images", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const processedFiles: string[] = [];

    for (let file of files) {
      const inputPath = file.path;
      const outputPath = `processed/${file.filename}-processed.png`;

      const metadata = await sharp(inputPath).metadata();
      const imageHeight = metadata.height || 0;

      await sharp(inputPath)
        .composite([
          {
            input: watermarkPath,
            gravity: "southwest",
            top: imageHeight - 200,
            left: 10,
          },
        ])
        .toFile(outputPath);

      processedFiles.push(outputPath);
    }

    const archive = archiver("zip", { zlib: { level: 9 } });
    res.attachment("processed-images.zip");
    archive.pipe(res);

    for (let file of processedFiles) {
      archive.file(file, { name: path.basename(file) });
    }

    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка обработки");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
