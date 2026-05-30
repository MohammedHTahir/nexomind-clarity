import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInstrumentItalic } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const { fontFamily: serif } = loadInstrument("normal", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: serifItalic } = loadInstrumentItalic("italic", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: sans } = loadInter("normal", { weights: ["300", "400", "500", "600"], subsets: ["latin"] });
