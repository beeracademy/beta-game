import { Card } from "./card";
import { Location } from "./location";

interface Game {
  start_datetime: string;
  official: boolean;
  player_names: string[];
  cards: Card[];

  has_ended: boolean;
  description?: string;
  dnf: boolean;

  dnf_player_ids: number[];

  id?: number;
  player_ids?: number[];
  token?: string;
  shuffle_indices?: number[];

  location?: Location;
}

export type { Game };
