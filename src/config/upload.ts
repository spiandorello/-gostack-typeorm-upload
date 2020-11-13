import { resolve } from 'path';
import { randomBytes } from 'crypto';
import { diskStorage } from 'multer';

const tempFolder = resolve(__dirname, '..', '..', 'tmp');
export default {
  directory: tempFolder,
  storage: diskStorage({
    destination: tempFolder,
    filename(request, file, callback) {
      const fileHash = randomBytes(8).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
