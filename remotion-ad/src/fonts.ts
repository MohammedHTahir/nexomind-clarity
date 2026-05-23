import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/Barlow";

const { fontFamily: serifFamily } = loadSerif("normal", { weights: ["400"], subsets: ["latin"], style: "normal" });
const { fontFamily: serifItalicFamily } = loadSerif("italic", { weights: ["400"], subsets: ["latin"], style: "italic" });
const { fontFamily: sansFamily } = loadSans("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const serif = serifFamily;
export const serifItalic = serifItalicFamily;
export const sans = sansFamily;
