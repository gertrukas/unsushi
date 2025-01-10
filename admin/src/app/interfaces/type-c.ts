import { Rudomatic } from "./rudomatic";
import { Pneumatic } from "./pneumatic";
import { Cushion } from "./cushion";

export interface TypeC {
  name?: string;
  style?: string;
  type?: Rudomatic | Pneumatic | Cushion
}
