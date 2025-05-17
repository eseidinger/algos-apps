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

import { Vector } from '../geom/vector';
import { Rectangle } from '../geom/rectangle';
import constant from '../util/constant';
import array from '../util/array';
import { Computations } from './computations';
import { VoronoiState } from '../canvas/drawingcontroller';

export class SharedData {
    static points: Vector[] = [];
    static alphaDiscCenter: Vector = new Vector(10, 10);

    static alpha: number = 75;
    static alphaMin: number = -100;
    static alphaMax: number = 100;

    static selectedTriangle: number = 0;

    /**
     * Calculate minimum and maximum alpha from significant alphas if available.
     * If no significant alphas are available, sets default values.
     */
    static update(width: number, height: number, voronoiState: VoronoiState): void {
        const rect = new Rectangle(0, 0, width, height);

        SharedData.points = SharedData.points.filter((point) => rect.containsPoint(point));

        const sweepLine = Math.round(voronoiState.sweepLinePercentage / 100 * height);

        Computations.compute(
            SharedData.points,
            SharedData.alpha,
            0,
            0,
            width,
            height,
            sweepLine,
            voronoiState,
        );

        if (Computations.significantAlphas.length === 0) {
            SharedData.alphaMin = -100;
            SharedData.alphaMax = 100;
        } else {
            let alphaMin = constant.INFINITY;
            let alphaMax = -constant.INFINITY;
            Computations.significantAlphas.forEach((val) => {
                if (val > alphaMax) {
                    alphaMax = Math.round(val);
                }
                if (val < alphaMin) {
                    alphaMin = Math.round(val);
                }
            });
            SharedData.alphaMin = alphaMin - 10;
            SharedData.alphaMax = alphaMax + 10;
        }
        SharedData.setAlpha(SharedData.alpha);
    }

    /**
     * Sets alpha value from slider value.
     *
     * @param sliderValue - The value from the slider
     */
    static setAlpha(sliderValue: number): void {
        if (sliderValue <= SharedData.alphaMin) {
            SharedData.alpha = -constant.INFINITY;
        } else if (sliderValue >= SharedData.alphaMax) {
            SharedData.alpha = constant.INFINITY;
        } else {
            SharedData.alpha = sliderValue;
        }
    }

    /**
     * Add a point to the point set given coordinates.
     *
     * @param x - X coordinate of the new point
     * @param y - Y coordinate of the new point
     */
    static addPoint(x: number, y: number): void {
        SharedData.points.push(new Vector(x, y));
    }

    /**
     * Remove the closest point with maximum distance to the given coordinate.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param maxDist - Maximum distance
     */
    static removePoint(x: number, y: number, maxDist: number): void {
        const pointIndex = array.indexOfElementWithMinimalDistance(
            SharedData.points,
            new Vector(x, y),
            (p1, p2) => p1.dist(p2),
            maxDist
        );

        if (pointIndex >= 0) {
            SharedData.points.splice(pointIndex, 1);
        }
    }
}