import { IN_PRODUCTION } from "../constants";
import devConfig from "./development";
import prodConfig from "./production";

export default IN_PRODUCTION ? prodConfig : devConfig;
