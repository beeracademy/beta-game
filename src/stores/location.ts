import { create } from "zustand";
import type { Location } from "../models/location";

interface LocationState {
	location?: Location;
	requested: boolean;

	RequestLocation: () => void;
}

const useLocation = create<LocationState>()((set, get) => ({
	location: undefined,
	requested: false,

	RequestLocation: () => {
		if (get().requested || !navigator?.geolocation) {
			return;
		}
		set({ requested: true });

		navigator.geolocation.getCurrentPosition(
			(position) => {
				set({
					location: {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						accuracy: position.coords.accuracy,
					},
				});
			},
			(error) => {
				// User denied or location unavailable, just proceed without it
				console.debug("[Location]", "Failed to get location", error);
			},
		);
	},
}));

export default useLocation;
