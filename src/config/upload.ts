import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'tmp'),
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;
      if (file.mimetype !== 'text/csv') {
        return callback(new Error('Arquivo Invalido'), fileName);
      }

      return callback(null, fileName);
    },
  }),
};
