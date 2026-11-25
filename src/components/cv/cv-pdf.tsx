import type { ICv } from './cv-model';

import i18next from 'i18next';

/**
 * Renders a CV to a PDF blob. react-pdf (~1MB) is only loaded when a PDF is actually needed.
 */
export const renderCvPdf = async (cv: ICv): Promise<Blob> => {
  const [{ pdf }, { default: CvPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./CvPdfDocument'),
  ]);
  return pdf(<CvPdfDocument cv={cv} />).toBlob();
};

// ASCII file name: the upload API strips other characters anyway
export const cvFileName = (cv: ICv) => {
  const base = (cv.data.fullName || cv.title || 'CV')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return i18next.t('app:components.cv.cv_pdf.cv_pdf', { v0: base || 'CV' });
};

export const renderCvPdfFile = async (cv: ICv) =>
  new File([await renderCvPdf(cv)], cvFileName(cv), { type: 'application/pdf' });

export const downloadCvPdf = async (cv: ICv) => {
  const url = URL.createObjectURL(await renderCvPdf(cv));
  const link = document.createElement('a');
  link.href = url;
  link.download = cvFileName(cv);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Center-crops and shrinks a photo to a small JPEG data URL (keeps the CV document light)
 */
export const resizePhoto = (file: File, size = 240): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas
        .getContext('2d')!
        .drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size
        );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Cannot read this image'));
    };
    img.src = url;
  });
