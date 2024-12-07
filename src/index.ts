import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import archiver from "archiver";

const app = express();
const port = process.env.PORT || 3000; // Порт из переменных окружения

// Настройки сервера
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Настройка загрузки файлов в память
const upload = multer({ storage: multer.memoryStorage() });
const watermarkPath = path.resolve("assets", "watermark.png");

// Обработчик для загрузки и обработки изображений
app.post("/process-images", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const processedFiles: Buffer[] = [];

    for (let file of files) {
      // Обрабатываем изображение в памяти
      const metadata = await sharp(file.buffer).metadata();
      const imageHeight = metadata.height || 0;

      const processedImage = await sharp(file.buffer)
        .composite([
          {
            input: watermarkPath,
            gravity: "southwest",
            top: imageHeight - 200,
            left: 10,
          },
        ])
        .toBuffer(); // Сохраняем результат в буфер

      processedFiles.push(processedImage);
    }

    // Создаем архив с обработанными изображениями
    const archive = archiver("zip", { zlib: { level: 9 } });
    res.attachment("processed-images.zip");
    archive.pipe(res);

    for (let i = 0; i < processedFiles.length; i++) {
      // Добавляем обработанное изображение в архив
      archive.append(processedFiles[i], { name: `processed-${i + 1}.png` });
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
