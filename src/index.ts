import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import archiver from "archiver";

// Настройка приложения
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Настройка multer для загрузки нескольких файлов
const upload = multer({
  dest: "uploads/", // Временная директория для загрузки
});

const watermarkPath = path.resolve("assets", "watermark.png");
const processedDir = "processed";

// Убедимся, что директория для сохранения обработанных файлов существует
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir);
}

// Обработчик загрузки и обработки нескольких изображений
app.post("/process-images", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).send("Файлы не были загружены.");
      return;
    }

    const processedFiles: string[] = [];

    for (let file of files) {
      const inputPath = file.path;
      const outputPath = `processed/${file.filename}-processed.png`;

      const metadata = await sharp(inputPath).metadata();
      const imageHeight = metadata.height || 0;
      const imageWidth = metadata.width || 0;

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

    // Создаем архив
    const archive = archiver('zip', {
      zlib: { level: 9 } // Максимальная степень сжатия
    });

    res.attachment('processed-images.zip'); // Устанавливаем имя архива

    archive.pipe(res);

    // Добавляем обработанные файлы в архив
    for (let file of processedFiles) {
      archive.file(file, { name: path.basename(file) });
    }

    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при обработке изображений.");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});