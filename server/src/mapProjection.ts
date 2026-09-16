import { geoAlbersUsa } from "d3-geo";

/**
 * Fixed to match a pre-generated US outline path (see mobile's UsMap
 * component) — scale/translate come from fitting the same us-atlas nation
 * geometry to a 975x610 viewBox. Any point projected here lines up with
 * that outline; changing these numbers without regenerating the outline
 * will throw the two out of sync.
 */
const projection = geoAlbersUsa().scale(1249.1268278249595).translate([523.8084201513246, 300.6018568224242]);

export const MAP_VIEWBOX = { width: 975, height: 610 };

export function projectLatLng(latitude: number, longitude: number): { x: number; y: number } | null {
  const projected = projection([longitude, latitude]);
  if (!projected) return null;
  return { x: projected[0], y: projected[1] };
}
