/**
 * @module org.aspyct.playqueue
 */
define([], function () {
    "use strict";

    var PlayQueue,
        PlayQueueItem,
        Stepper;

    Stepper = function (target) {
        this.target = target;
    };

    Stepper.prototype = {
        construct: function () {
            var self = this,
                steps,
                resultHandler,
                gotResult,
                finalResult,
                runNextStep;

            steps = [];

            gotResult = function (cbResult) {
                if (cbResult !== undefined) {
                    steps.length = 0;
                    finalResult = cbResult;
                }
            };

            runNextStep = function () {
                var step;

                if (steps.length > 0) {
                    step = steps.shift();
                    step();
                } else {
                    resultHandler(finalResult);
                }
            };

            return {
                async: function (func, args, callback) {
                    if (callback === undefined) {
                        callback = args;
                        args = [];
                    }

                    self.steps.push(function () {
                        args.push(function (result) {
                            var cbResult;

                            cbResult = callback(result);
                            gotResult(cbResult);
                        });
                        func.apply(self.target, args);
                    });
                },
                sync: function (func, args, callback) {
                    if (callback === undefined) {
                        callback = args;
                        args = [];
                    }

                    self.steps.push(function () {
                        var result,
                            cbResult;

                        result = func.apply(self.target, args);
                        cbResult = callback(result);

                        gotResult(cbResult);
                    });
                },
                withResult: function (callback) {
                    resultHandler = callback;
                    runNextStep();
                }
            };
        }
    };

    /**
     * A PlayQueue is responsible for iterating through a TrackList.
     *
     * It is created with a "TrackList" object. This tracklist may be anything,
     * but it must offer the following methods:
     *   1. getMinKnownIndex(callback(minIndex))
     *   2. getMaxKnownIndex(callback(maxIndex))
     *   3. isInfinite(callback(isInfinite)
     *   4. loadTrackAtIndex(index, callback(track))
     *   5. listIndices(callback(startIndex, indices)
     *
     * Most of the methods of a PlayQueue take a callback.
     * Whether or not these callbacks are actually asynchronous
     * depends on the underlying tracklist implementation.
     *
     * Refer to each method's documentation for info about the callback arguments.
     *
     * Special requirements:
     *   - the class must be able to provide the full list in advance,
     *     even if it is shuffled.
     *
     * @class PlayQueue
     */

    /**
     * Private constructor
     *
     * @private
     * @constructor
     * @param 
     */
    PlayQueue = function (tracklist) {
        this.tracklist = tracklist;
        this.repeatMode = PlayQueue.RepeatMode.None;
        this.shuffle = false;
    };

    PlayQueue.prototype = {
        construct: function () {
            var self = this,
                playQueue,
                isLastIndex,
                isFirstIndex,
                currentIndex,
                makeNextIndex,
                makePreviousIndex,
                trackIndices;

            /**
             * Test whether the given index is the last track.
             *
             * Will also yield true if the index is above the last track.
             *
             * @private 
             * @method isFirstIndex
             * @param index {Number} the index to test
             * @param callback {Function} takes one boolean argument, true if given index is the last one
             */
            isLastIndex = function (index, callback) {
                new Stepper(self.tracklist)
                    .async(self.tracklist.isInfinite, function (infinite) {
                        return false;
                    })
                    .async(self.tracklist.withMaxKnownIndex, function (maxIndex) {
                        return index >= maxIndex;
                    })
                    .withResult(function (result) {
                        callback(result);
                    });
            };

            /**
             * Test whether the given index is the first track.
             *
             * Will also yield true if the index is below the first track.
             *
             * @private
             * @method makeNextIndex
             * @param index {Number} the index to test
             * @param callback {Function} takes one boolean argument, true if given index is the last one
             */
            isFirstIndex = function (index, callback) {
                self.tracklist
                    .withMinKnownIndex(function (minIndex) {
                        callback(index <= minIndex);
                    });
            };

            /**
             * Calculate the index of the next track
             *
             * @private
             * @method makeNextIndex
             * @param index {Number} the current index
             * @return {Number} the next index, or undefined if there's no such thing
             */
            makeNextIndex = function (index) {
                if (isLastIndex(index)) {
                    
                } else {
                    return index + 1;
                }
            };

            /*
             * The indices of the tracks, in the order they're expected to be played
             * Shuffle at will
             */
            trackIndices = [];

            /*
             * The playqueue object that will be returned by this function
             */
            playQueue = {};

            /**
             * Move the cursor to the given index.
             *
             * The next song you'll get is the one corresponding to index,
             * whether you call next() or previous()
             *
             * @method moveTo
             * @param index {Number} the wanted absolute index
             */
            playQueue.moveTo = function (index) {

            };

            /**
             * Get the next song
             *
             * The order is affected by the shuffle and repeat modes.
             *
             * If you just made a call to moveTo() on this object,
             * it will return the item at the requested index.
             * See the documentation of moveTo() for details.
             *
             * @method next
             * @param callback {Function} a PlayQueue callback, see class doc.
             */
            playQueue.next = function (callback) {
                
            };

            /**
             * Get the previous song
             *
             * The order is affected by the shuffle and repeat modes.
             *
             * If you just made a call to moveTo() on this object,
             * it will return the item at the requested index.
             * See the documentation of moveTo() for details.
             *
             * @method previous
             * @param callback {Function} a PlayQueue callback, see class doc.
             */
            playQueue.previous = function (callback) {

            };

            /**
             * Notify the PlayQueue that this item cannot be played
             *
             * The PlayQueue will call your callback with the next song,
             * or null if there's none.
             * The notion of "next" depends on whether your last call
             * was next() or previous()
             *
             * @method invalidate
             * @param item {PlayQueueItem} the item that cannot be played
             * @param callback {Function} a PlayQueue callback, see class doc.
             */
            playQueue.invalidate = function (item, callback) {

            };

            /**
             * Set the repeat mode
             *
             * Accepts three values:
             *   1. PlayQueue.REPEAT_MODE.NONE
             *   2. PlayQueue.REPEAT_MODE.ALL
             *   3. PlayQueue.REPEAT_MODE.ONE
             *
             * @method setRepeatMode
             * @param repeatMode {PlayQueue.RepeatMode
             */
            playQueue.setRepeatMode = function (repeatMode) {
                if (PlayQueue.RepeatMode[repeatMode] !== undefined) {
                    self.repeatMode = repeatMode;
                } else {
                    throw new Error('Unknown repeat mode:' + repeatMode);
                }
            };

            /**
             * Enable shuffle (or disable it)
             *
             *
             */
            playQueue.setShuffleMode = function (shuffleMode) {
                self.shuffle = !!shuffleMode;
                // Shuffle / deshuffle the trackIndices
            };

            return playQueue;
        }
    };

    PlayQueue.RepeatMode = {
        All: "All",
        One: "One",
        None: "None"
    };

    return {
        /**
         * @function createFromTrackList
         * @param trackList {TrackList} the tracklist to create a playqueue from
         * @return {PlayQueue}
         */
        createFromTrackList: function (trackList) {
            var playQueue = new PlayQueue(trackList);
            return playQueue.construct();
        }
    };
});
