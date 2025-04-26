export class Misc {

    /**
     * Converts a hex RGB string to an object containing RGB values.
     *
     * @param hex - RGB string in hex format
     * @returns Object containing `r`, `g`, and `b` values, or null if invalid
     */
    static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : null;
    }

    /**
     * Converts a hex RGB string and opacity to an RGBA string.
     *
     * @param hex - RGB string in hex format
     * @param opacity - Opacity value (0 to 1)
     * @returns RGBA string
     */
    static hexToRgba(hex: string, opacity: number): string {
        const rgb = Misc.hexToRgb(hex);
        if (!rgb) {
            throw new Error('Invalid hex color string');
        }
        return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`;
    }
}