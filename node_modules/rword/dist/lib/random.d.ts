export declare class Random {
    /**
     * Generate a random number between `0` (inclusive) and `1` (exclusive). A
     *  drop in replacement for `Math.random()`
     */
    static value(): number;
    /**
     * Generate a random number between `min` (inclusive) and `max` (exclusive).
     */
    static range(min: number, max: number): number;
    /** Transform an integer to a floating point number. */
    private static intToFloat;
}
