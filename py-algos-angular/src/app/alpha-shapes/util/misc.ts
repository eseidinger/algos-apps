/**
 Copyright 2013-2014 Emanuel Seidinger

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

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

    /**
     * Gets the version of Internet Explorer or returns -1 if another browser is used.
     *
     * @returns Version of Internet Explorer or -1
     */
    static getInternetExplorerVersion(): number {
        let rv = -1; // Return value assumes failure.
        const ua = navigator.userAgent;
        if (navigator.appName === 'Microsoft Internet Explorer') {
            const re = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        } else if (navigator.appName === 'Netscape') {
            const re = new RegExp('Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})');
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return rv;
    }
}