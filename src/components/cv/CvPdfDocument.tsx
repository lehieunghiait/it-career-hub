import { Document, Font, Image, Link, Page, Text, View } from '@react-pdf/renderer';
import { ICv } from './cv-model';
import CvLayout, { CV_FONT, CvPrimitives } from './CvLayout';
import { CV_FONT_FILES } from './cv-fonts';

// Full TTF files so every Vietnamese glyph is embedded and the text stays selectable for ATS
Font.register({ family: CV_FONT, fonts: CV_FONT_FILES });
// Default hyphenation follows English rules and splits Vietnamese syllables
Font.registerHyphenationCallback(word => [word]);

const pdfPrimitives: CvPrimitives = {
  Page: ({ style, children }) => (
    <Page size='A4' style={style as any}>
      {children}
    </Page>
  ),
  View: ({ style, fixed, wrap, children }) => (
    <View style={style as any} fixed={fixed} wrap={wrap}>
      {children}
    </View>
  ),
  Text: ({ style, minPresenceAhead, children }) => (
    <Text style={style as any} minPresenceAhead={minPresenceAhead}>
      {children}
    </Text>
  ),
  Image: ({ src, style }) => <Image src={src} style={style as any} />,
  Link: ({ src, style, children }) => (
    <Link src={src} style={style as any}>
      {children}
    </Link>
  ),
};

/**
 * The CV as a PDF document (download and apply)
 */
const CvPdfDocument = ({ cv }: { cv: ICv }) => (
  <Document
    title={cv.title}
    author={cv.data.fullName}
    creator='IT Career Hub'
    producer='IT Career Hub'
  >
    <CvLayout cv={cv} primitives={pdfPrimitives} />
  </Document>
);

export default CvPdfDocument;
